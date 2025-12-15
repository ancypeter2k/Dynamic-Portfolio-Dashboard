import React, { useState, useEffect } from 'react';

interface SectorData {
  sector: string;
  investment: number;
  presentValue: number;
  gainLoss: number;
  count: number;
  returnPercent: number;
}

interface SectorSummaryProps {
  sectors: SectorData[];
}

export default function SectorSummary({ sectors }: SectorSummaryProps) {
  const sectorData = sectors;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  
  useEffect(() => {
    setCurrentPage(1);
  }, [sectors]);

  if (sectorData.length === 0) {
    return null;
  }

  
  const totalPages = Math.ceil(sectorData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sectorData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800 mb-8">
      <h3 className="text-xl font-bold text-white mb-6">Sector-wise Summary</h3>
      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-700 bg-gray-950">
              <th className="text-left py-3 px-4 font-semibold text-gray-300">Sector</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-300 hidden sm:table-cell">Stocks</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-300">Investment (₹)</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-300 hidden md:table-cell">Present Value (₹)</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-300">Gain/Loss (₹)</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-300 hidden sm:table-cell">Return %</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((sector, index) => (
              <tr 
                key={index} 
                className={`border-b border-gray-800 transition-colors ${index % 2 === 0 ? "bg-gray-900 hover:bg-gray-800" : "bg-gray-800 hover:bg-gray-700"}`}
              >
                <td className="py-3 px-4 font-medium text-white whitespace-nowrap">{sector.sector}</td>
                <td className="py-3 px-4 text-right text-gray-400 hidden sm:table-cell">{sector.count}</td>
                <td className="py-3 px-4 text-right font-medium text-gray-300 whitespace-nowrap">
                  {sector.investment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </td>
                <td className="py-3 px-4 text-right font-medium text-gray-300 hidden md:table-cell whitespace-nowrap">
                  {sector.presentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </td>
                <td className={`py-3 px-4 text-right font-semibold whitespace-nowrap ${
                  sector.gainLoss > 0 ? "text-green-400" : sector.gainLoss < 0 ? "text-red-400" : "text-gray-400"
                }`}>
                  {sector.gainLoss > 0 ? "+" : ""} {Math.abs(sector.gainLoss).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </td>
                <td className={`py-3 px-4 text-right font-semibold hidden sm:table-cell whitespace-nowrap ${
                  sector.returnPercent > 0 ? "text-green-400" : sector.returnPercent < 0 ? "text-red-400" : "text-gray-400"
                }`}>
                  {sector.returnPercent > 0 ? "+" : ""}{sector.returnPercent.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {}
      {sectorData.length > itemsPerPage && (
        <div className="mt-4 px-4 py-3 flex items-center justify-between border-t border-gray-700">
          <div className="text-sm text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, sectorData.length)} of {sectorData.length} entries
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