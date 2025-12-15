"use client";

import React, { useMemo, useState } from 'react';
import { StockData, FilterState } from '../types';

interface PortfolioTableProps {
  data: StockData[];
  filters: FilterState | null;
}

interface SortConfig {
    key: keyof StockData | 'name';
    direction: 'ascending' | 'descending';
}

export default function PortfolioTable({ data, filters }: PortfolioTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data];

    
    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (stock) =>
            stock.name?.toLowerCase().includes(searchLower) ||
            stock.symbol?.toLowerCase().includes(searchLower)
        );
      }
      if (filters.exchange && filters.exchange !== "All Exchanges") {
        filtered = filtered.filter((stock) => stock.exchange === filters.exchange);
      }
      if (filters.status && filters.status !== "All Statuses") {
        if (filters.status === "Gain") {
          filtered = filtered.filter((stock) => (stock.gainLoss || 0) > 0);
        } else if (filters.status === "Loss") {
          filtered = filtered.filter((stock) => (stock.gainLoss || 0) < 0);
        } else if (filters.status === "Neutral") {
          filtered = filtered.filter((stock) => (stock.gainLoss || 0) === 0);
        }
      }
    }

    
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const key = sortConfig.key as keyof StockData; 
        const aValue = a[key] as (number | string) || 0;
        const bValue = b[key] as (number | string) || 0;

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, filters, sortConfig]);

  
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, endIndex);

  
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters, data]);

  const requestSort = (key: keyof StockData | 'name') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof StockData | 'name') => {
    if (sortConfig.key !== key) return ' ↕';
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  };

  const headers: { key: keyof StockData; label: string }[] = [
    { key: 'name', label: 'Stock Name' },
    { key: 'purchasePrice', label: 'Buy Price (₹)' },
    { key: 'qty', label: 'Qty' },
    { key: 'investment', label: 'Investment (₹)' },
    { key: 'presentValue', label: 'Value (₹)' },
    { key: 'gainLoss', label: 'Gain/Loss (₹)' },
    { key: 'exchange', label: 'Exch.' },
    { key: 'peRatio', label: 'P/E' },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-md border border-gray-800 overflow-hidden">
      <div className="overflow-hidden">
        <table className="w-full divide-y divide-gray-700">
          <thead className='sticky top-0 bg-gray-800'>
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => requestSort(header.key)}
                >
                  <div className="flex items-center gap-1">
                    {header.label}
                    <span className="text-gray-500">{getSortIcon(header.key)}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {paginatedData.length > 0 ? (
              paginatedData.map((stock, index) => {
                
                const isProfit = stock.gainLoss > 0;
                const isLoss = stock.gainLoss < 0;
                return (
                  <tr 
                    key={index}
                    className={`transition-colors ${index % 2 === 0 ? "bg-gray-900 hover:bg-gray-800" : "bg-gray-800 hover:bg-gray-700"}`}
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-white whitespace-nowrap">{stock.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">₹{stock.purchasePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{stock.qty}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-300 whitespace-nowrap">₹{stock.investment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-300 whitespace-nowrap">₹{stock.presentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        isProfit ? "bg-green-900/50 text-green-400 border border-green-700/50" : isLoss ? "bg-red-900/50 text-red-400 border border-red-700/50" : "bg-gray-800/50 text-gray-400"
                      }`}>
                        {isProfit ? "+" : ""}₹{Math.abs(stock.gainLoss).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{stock.exchange}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{stock.peRatio}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={headers.length} className="text-center py-8 text-gray-500 bg-gray-900">
                  No holdings match the current filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {}
      {filteredAndSortedData.length > itemsPerPage && (
        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-700">
          <div className="text-sm text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};