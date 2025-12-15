"use client";

import React, { useState } from 'react';
import { Download } from 'lucide-react';

interface FilterState {
    search: string;
    exchange: string;
    status: string;
}

interface SearchFiltersProps {
  onFilter: (filters: FilterState) => void;
  onReset: () => void;
  onDownload: () => void;
}

const initialFilters: FilterState = {
    search: "",
    exchange: "All Exchanges",
    status: "All Statuses",
};

export default function SearchFilters({ onFilter, onReset, onDownload }: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleChange = (field: keyof FilterState, value: string) => {
    
    const newFilters = { ...filters, [field]: value } as FilterState; 
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    onReset();
  };

  
  const hasActiveFilters = filters.search !== "" || 
                          filters.exchange !== "All Exchanges" || 
                          filters.status !== "All Statuses";

  const inputStyle = "w-full px-3 py-2 border border-gray-700 bg-gray-950 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800 mb-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Filter Holdings</h3>
          <p className="text-sm text-gray-400 mt-1">
            Filter by stock name, exchange, or performance status.
          </p>
        </div>
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          <Download className="w-5 h-5" />
          Download CSV
        </button>
      </div>

      {}
      <div className="flex flex-row flex-wrap gap-4 items-end">
        
        {}
        <div className="w-full md:w-2/5 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Stock Name / Symbol
          </label>
          <input
            type="text"
            placeholder="Eg: HDFC Bank"
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            className={inputStyle}
          />
        </div>

        {}
        <div className="w-full md:w-1/6 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Exchange
          </label>
          <select
            value={filters.exchange}
            onChange={(e) => handleChange("exchange", e.target.value)}
            className={inputStyle}
          >
            <option className='bg-gray-900'>All Exchanges</option>
            <option className='bg-gray-900'>NSE</option>
            <option className='bg-gray-900'>BSE</option>
          </select>
        </div>

        {}
        <div className="w-full md:w-1/3 min-w-[280px]">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Status
          </label>
          <div className="flex gap-2 w-full">
            <select
              value={filters.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-700 bg-gray-950 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option className='bg-gray-900'>All Statuses</option>
              <option className='bg-gray-900'>Gain</option>
              <option className='bg-gray-900'>Loss</option>
              <option className='bg-gray-900'>Neutral</option>
            </select>
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};