import React from "react";
import { IoBookOutline } from "react-icons/io5";

interface NavigationControlPanelProps {
  currentIndex: number;
  images: string[];
  pageToIssueLabel: Record<number, string>;
  setPage: (index: number) => void;
  goPrev: () => void;
  goNext: () => void;
  isDoublePage: boolean;
  customWidth: number;
  customDoubleWidth: number;
  setCustomWidth: (width: number) => void;
  setCustomDoubleWidth: (width: number) => void;
}

const NavigationControlPanel: React.FC<NavigationControlPanelProps> = ({ 
  currentIndex, 
  images, 
  pageToIssueLabel, 
  setPage, 
  goPrev, 
  goNext, 
  isDoublePage, 
  customWidth, 
  customDoubleWidth, 
  setCustomWidth, 
  setCustomDoubleWidth 
}) => {
  return (
    <div className="comic-viewer-card bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          <IoBookOutline className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-semibold text-white">
          Navigation
        </h3>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {currentIndex + 1}
          </div>
          <div className="text-sm text-gray-400">
            sur {images.length} pages
          </div>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="comic-progress-bar h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
          />
        </div>

        <select
          value={currentIndex}
          onChange={(e) => setPage(Number(e.target.value))}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none transition-colors"
        >
          {images.map((_, i) => {
            const issueLabel = pageToIssueLabel[i];
            return (
              <option key={i} value={i}>
                Page {i + 1}{issueLabel ? ` - ${issueLabel}` : ""}
              </option>
            );
          })}
        </select>

        <div className="flex gap-2 mt-4">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="comic-viewer-btn flex-1 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Page précédente (←)"
          >
            <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goNext}
            disabled={currentIndex === images.length - 1}
            className="comic-viewer-btn flex-1 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Page suivante (→)"
          >
            <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex gap-1 mt-3">
          <button
            onClick={() => {
              const current = isDoublePage ? customDoubleWidth : customWidth;
              const newValue = Math.max(isDoublePage ? 50 : 30, current - 10);
              if (isDoublePage) {
                setCustomDoubleWidth(newValue);
              } else {
                setCustomWidth(newValue);
              }
            }}
            className="comic-viewer-btn flex-1 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors"
            title="Zoom arrière"
          >
            🔍➖
          </button>
          <button
            onClick={() => {
              const current = isDoublePage ? customDoubleWidth : customWidth;
              const newValue = Math.min(100, current + 10);
              if (isDoublePage) {
                setCustomDoubleWidth(newValue);
              } else {
                setCustomWidth(newValue);
              }
            }}
            className="comic-viewer-btn flex-1 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors"
            title="Zoom avant"
          >
            🔍➕
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavigationControlPanel;