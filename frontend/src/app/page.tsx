"use client";

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';


import SummaryCards from '../components/SummaryCards';
import PortfolioCharts from '../components/PortfolioCharts';
import SearchFilters from '../components/SearchFilters';
import PortfolioTable from '../components/PortfolioTable';
import SectorSummary from '../components/SectorSummary';
import { StockData, FilterState } from '../types';


const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


interface SummaryData {
  totalInvestment: number;
  currentValue: number;
  totalGainLoss: number;
  totalGain: number;
  totalLoss: number;
  totalRevenue: number;
  overallReturn: number;
  isGain: boolean;
}

interface ChartData {
  pieChart: Array<{ name: string; value: number; investment: number; percent: number; color: string }>;
  lineChart: Array<{ name: string; fullName: string; value: number; isGain: boolean }>;
}

interface SectorData {
  sector: string;
  investment: number;
  presentValue: number;
  gainLoss: number;
  count: number;
  returnPercent: number;
}

const PortfolioDashboard: React.FC = () => {
  const [tableData, setTableData] = useState<StockData[]>([]); 
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [sectorData, setSectorData] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null); 
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filters, setFilters] = useState<FilterState | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      
      try {
        await axios.get(`${API_BASE}/health`, { timeout: 5000 });
      } catch (healthErr) {
        throw new Error(`Cannot connect to backend at ${API_BASE}. Please ensure the backend server is running on port 8000.`);
      }

      
      const [summaryRes, chartsRes, sectorsRes, tableRes] = await Promise.all([
        axios.get(`${API_BASE}/api/portfolio/summary`, { 
          timeout: 60000,
          headers: { 'Content-Type': 'application/json' }
        }),
        axios.get(`${API_BASE}/api/portfolio/charts`, { 
          timeout: 60000,
          headers: { 'Content-Type': 'application/json' }
        }),
        axios.get(`${API_BASE}/api/portfolio/sectors`, { 
          timeout: 60000,
          headers: { 'Content-Type': 'application/json' }
        }),
        axios.get(`${API_BASE}/api/portfolio/table`, { 
          timeout: 60000,
          params: filters || {},
          headers: { 'Content-Type': 'application/json' }
        })
      ]);

      setSummaryData(summaryRes.data);
      setChartData(chartsRes.data);
      setSectorData(sectorsRes.data);
      setTableData(tableRes.data || []);
      setLastUpdated(new Date());
    } catch (err: any) {
      let errorMessage = "Failed to load portfolio data from server.";
      
      if (err.code === 'ECONNREFUSED' || err.message?.includes('connect')) {
        errorMessage = `Cannot connect to backend at ${API_BASE}. Please ensure the backend server is running on port 8000.`;
      } else if (err.response?.data?.error) {
        errorMessage = `Failed to load portfolio: ${err.response.data.error}`;
      } else if (err.message) {
        errorMessage = `Failed to load portfolio: ${err.message}`;
      }
      
      setError(errorMessage);
      setSummaryData(null);
      setChartData(null);
      setSectorData([]);
      setTableData([]);
      console.error("Portfolio fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  
  useEffect(() => {
    if (!loading) {
      const fetchFilteredTable = async () => {
        try {
          const res = await axios.get(`${API_BASE}/api/portfolio/table`, {
            timeout: 30000,
            params: filters || {}
          });
          setTableData(res.data || []);
        } catch (err) {
          console.error("Failed to fetch filtered table data:", err);
        }
      };
      fetchFilteredTable();
    }
  }, [filters]);

  const handleFilter = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    setFilters(null);
  };

  const handleDownload = () => {
    const headers = ["Stock Name", "Purchase Price", "Qty", "Investment", "Present Value", "Gain/Loss", "P/E Ratio", "Earnings", "Exchange", "Sector"];
    
    
    const dataToExport = tableData;

    const csvContent = [
      headers.join(","),
      ...dataToExport.map((stock) => [
        stock.name,
        stock.purchasePrice,
        stock.qty,
        stock.investment,
        stock.presentValue,
        stock.gainLoss,
        stock.peRatio,
        stock.earnings,
        stock.exchange,
        stock.sector,
      ].join(","))
    ].join("\n");

    
    try {
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `portfolio-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch(e) {
        console.error("CSV Download Failed:", e);
    }
  };

  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdated) return 'Never';
    return lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, [lastUpdated]);


  return (
    <div className="min-h-screen bg-gray-950 font-sans text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Investment Portfolio Dashboard
              </h1>
              <p className="text-gray-400 mt-1">
                A consolidated view of all your holdings
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-400 bg-gray-800 p-2 px-4 rounded-full shadow-md border border-gray-700">
                Last Updated: <span className='font-semibold text-blue-400'>{formattedLastUpdated}</span>
              </div>
            </div>
          </div>
        </div>

        {}
        {loading && (
          <div className="text-center py-12 text-blue-400 font-semibold">
            Loading portfolio data...
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 mb-4">{error}</p>
        )}

        {}
        {!loading && summaryData && chartData && (
          <>
            <SummaryCards 
              totalInvestment={summaryData.totalInvestment}
              currentValue={summaryData.currentValue}
              totalGainLoss={summaryData.totalGainLoss}
              totalGain={summaryData.totalGain}
              totalLoss={summaryData.totalLoss}
              totalRevenue={summaryData.totalRevenue}
              overallReturn={summaryData.overallReturn}
              isGain={summaryData.isGain}
            />

            <PortfolioCharts 
              pieChartData={chartData.pieChart}
              lineChartData={chartData.lineChart}
            />

            <SearchFilters 
              onFilter={handleFilter}
              onReset={handleReset}
              onDownload={handleDownload}
            />

            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Stock Holdings</h2>
              <PortfolioTable data={tableData} filters={filters} />
            </div>

            <SectorSummary sectors={sectorData} />
          </>
        )}

        {}
        {!loading && (!summaryData || tableData.length === 0) && (
          <div className="bg-gray-900 rounded-xl shadow-md p-12 text-center border border-gray-800 mt-8">
            <h3 className="text-2xl font-bold text-white mb-2">No Portfolio Data Available</h3>
            <p className="text-gray-400">Portfolio data failed to load. Please check console for errors.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioDashboard;