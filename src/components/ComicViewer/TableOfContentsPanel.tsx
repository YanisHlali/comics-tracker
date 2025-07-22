import React from "react";
import { FaRegFileLines } from "react-icons/fa6";

interface TableOfContentsPanelProps {
  tableContents?: number[];
  labels?: string[];
  images: string[];
  currentIndex: number;
  setPage: (index: number) => void;
}

interface TocEntry {
  pageIndex: number;
  pageNumber: number;
  label: string;
  isValid: boolean;
}

const TableOfContentsPanel: React.FC<TableOfContentsPanelProps> = ({ 
  tableContents, 
  labels, 
  images, 
  currentIndex, 
  setPage 
}) => {
  if (!tableContents || !labels || tableContents.length === 0 || labels.length === 0) {
    return null;
  }

  const tocEntries: TocEntry[] = tableContents.map((pageNumber: number, index: number) => {
    const pageIndex = pageNumber - 1;
    const label = labels[index];
    
    return {
      pageIndex,
      pageNumber,
      label,
      isValid: pageIndex >= 0 && pageIndex < images.length
    };
  }).filter(entry => entry.isValid);

  if (tocEntries.length === 0) {
    return null;
  }

  return (
    <div className="comic-viewer-card bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          <FaRegFileLines className="w-5 h-5 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">
          Sommaire
        </h3>
      </div>

      <div className="space-y-2">
        {tocEntries.map((entry: TocEntry, index: number) => (
          <button
            key={index}
            onClick={() => setPage(entry.pageIndex)}
            className={`w-full text-left p-3 rounded-lg transition-all duration-200 border group ${
              currentIndex === entry.pageIndex
                ? 'bg-red-500/20 border-red-500/50 text-red-400 scale-[1.02]'
                : 'bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-600/50 hover:border-gray-500/50 hover:text-white hover:scale-[1.01]'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {entry.label}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Page {entry.pageNumber}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentIndex === entry.pageIndex && (
                  <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0 animate-pulse" />
                )}
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${
                    currentIndex === entry.pageIndex 
                      ? 'text-red-400 translate-x-0' 
                      : 'text-gray-500 group-hover:text-gray-300 group-hover:translate-x-1'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      {tocEntries.length > 1 && (
        <div className="mt-3 pt-3 border-t border-gray-600/50">
          <div className="text-xs text-gray-400 text-center">
            <span className="inline-flex items-center gap-1">
              📚 {tocEntries.length} issues
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableOfContentsPanel;