import React, { useState, useMemo } from 'react';
import { Filter, X, Search, Eye, EyeOff } from 'lucide-react';
import { WorkflowSession } from '../types';

interface InteractiveSignalSummaryProps {
  session: WorkflowSession;
}

const InteractiveSignalSummary: React.FC<InteractiveSignalSummaryProps> = ({ session }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllSignals, setShowAllSignals] = useState(false);
  const [signalsPerPage, setSignalsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate statistics
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    session.signals.forEach(signal => {
      stats[signal.category] = (stats[signal.category] || 0) + 1;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [session.signals]);

  const sourceStats = useMemo(() => {
    const stats: Record<string, number> = {};
    session.signals.forEach(signal => {
      stats[signal.source] = (stats[signal.source] || 0) + 1;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [session.signals]);

  // Filter signals based on selected filters and search
  const filteredSignals = useMemo(() => {
    return session.signals.filter(signal => {
      const matchesCategory = !selectedCategory || signal.category === selectedCategory;
      const matchesSource = !selectedSource || signal.source === selectedSource;
      const matchesSearch = !searchTerm || 
        signal.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        signal.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        signal.source.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSource && matchesSearch;
    });
  }, [session.signals, selectedCategory, selectedSource, searchTerm]);

  // Paginate signals
  const paginatedSignals = useMemo(() => {
    if (showAllSignals) return filteredSignals;
    
    const startIndex = (currentPage - 1) * signalsPerPage;
    const endIndex = startIndex + signalsPerPage;
    return filteredSignals.slice(startIndex, endIndex);
  }, [filteredSignals, showAllSignals, currentPage, signalsPerPage]);

  const totalPages = Math.ceil(filteredSignals.length / signalsPerPage);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSource(null);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedCategory || selectedSource || searchTerm;

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Organizational Signals Summary</h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <X className="h-3 w-3" />
              <span>Clear Filters</span>
            </button>
          )}
          <button
            onClick={() => setShowAllSignals(!showAllSignals)}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            {showAllSignals ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            <span>{showAllSignals ? 'Paginate' : 'Show All'}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search signals by content, category, or source..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {filteredSignals.length}
          </div>
          <div className="text-gray-600">
            {filteredSignals.length === session.signals.length ? 'Total Signals' : 'Filtered Signals'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {new Set(filteredSignals.map(s => s.category)).size}
          </div>
          <div className="text-gray-600">Categories</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {new Set(filteredSignals.map(s => s.source)).size}
          </div>
          <div className="text-gray-600">Sources</div>
        </div>
      </div>

      {/* Interactive Category Breakdown */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">Categories</h4>
          {selectedCategory && (
            <span className="text-xs text-blue-600">
              Filtered by: {selectedCategory}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {categoryStats.map(([category, count]) => {
            const isSelected = selectedCategory === category;
            const filteredCount = filteredSignals.filter(s => s.category === category).length;
            const isVisible = filteredCount > 0;
            
            if (!isVisible && !isSelected) return null;
            
            return (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(isSelected ? null : category);
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                } ${!isVisible ? 'opacity-50' : ''}`}
              >
                {category} ({isSelected ? count : filteredCount})
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Source Breakdown */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">Sources</h4>
          {selectedSource && (
            <span className="text-xs text-green-600">
              Filtered by: {selectedSource}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {sourceStats.map(([source, count]) => {
            const isSelected = selectedSource === source;
            const filteredCount = filteredSignals.filter(s => s.source === source).length;
            const isVisible = filteredCount > 0;
            
            if (!isVisible && !isSelected) return null;
            
            return (
              <button
                key={source}
                onClick={() => {
                  setSelectedSource(isSelected ? null : source);
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-green-500 text-white'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                } ${!isVisible ? 'opacity-50' : ''}`}
              >
                {source} ({isSelected ? count : filteredCount})
              </button>
            );
          })}
        </div>
      </div>

      {/* Signals List */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">
            Organizational Signals {hasActiveFilters && `(${filteredSignals.length} filtered)`}
          </h4>
          {!showAllSignals && filteredSignals.length > signalsPerPage && (
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <span>Per page:</span>
              <select
                value={signalsPerPage}
                onChange={(e) => {
                  setSignalsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-xs"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {paginatedSignals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No signals match your current filters.</p>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700 text-sm mt-2"
              >
                Clear filters to see all signals
              </button>
            </div>
          ) : (
            paginatedSignals.map((signal, index) => (
              <div key={signal.id} className="text-xs bg-white p-3 rounded border hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    #{((currentPage - 1) * signalsPerPage) + index + 1}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedCategory(signal.category);
                        setCurrentPage(1);
                      }}
                      className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                    >
                      {signal.category}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSource(signal.source);
                        setCurrentPage(1);
                      }}
                      className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
                    >
                      {signal.source}
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {searchTerm ? (
                    // Highlight search terms
                    signal.content.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) =>
                      part.toLowerCase() === searchTerm.toLowerCase() ? (
                        <mark key={i} className="bg-yellow-200">{part}</mark>
                      ) : part
                    )
                  ) : (
                    signal.content
                  )}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {!showAllSignals && filteredSignals.length > signalsPerPage && (
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div>
            Showing {((currentPage - 1) * signalsPerPage) + 1} to {Math.min(currentPage * signalsPerPage, filteredSignals.length)} of {filteredSignals.length} signals
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <div>
              Active filters: 
              {selectedCategory && <span className="ml-1 text-blue-600">Category: {selectedCategory}</span>}
              {selectedSource && <span className="ml-1 text-green-600">Source: {selectedSource}</span>}
              {searchTerm && <span className="ml-1 text-purple-600">Search: "{searchTerm}"</span>}
            </div>
            <div>
              {filteredSignals.length} of {session.signals.length} signals shown
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveSignalSummary;