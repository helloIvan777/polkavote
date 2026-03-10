'use client';

import React from 'react';

/**
 * FilterBar Component
 * Reusable search and sorting bar for project listings
 */
export default function FilterBar({ searchTerm, setSearchTerm, sortBy, setSortBy, totalResults }) {
  return (
    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white
              placeholder-slate-500 text-sm
              focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20
              transition-all duration-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-slate-400 text-sm whitespace-nowrap hidden sm:block">
            Sort by:
          </label>
          <div className="relative flex-1 md:flex-none">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-44 appearance-none px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl
                text-white text-sm font-medium cursor-pointer
                focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20
                transition-all duration-200"
            >
              <option value="newest">Newest</option>
              <option value="ending">Ending Soon</option>
              <option value="funded">Most Funded</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {totalResults !== undefined && (
          <div className="text-slate-400 text-sm whitespace-nowrap hidden lg:block">
            {totalResults} {totalResults === 1 ? 'result' : 'results'}
          </div>
        )}
      </div>
    </div>
  );
}
