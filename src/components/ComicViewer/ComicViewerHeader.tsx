import React from "react";

interface ComicViewerHeaderProps {
  editionTitle: string;
  images: string[];
  currentIndex: number;
  setPage: (index: number) => void;
  goPrev: () => void;
  goNext: () => void;
}

const ComicViewerHeader: React.FC<ComicViewerHeaderProps> = ({ 
  editionTitle, 
  images, 
  currentIndex, 
  setPage,
  goPrev, 
  goNext 
}) => {
  return (
    <div className="sticky top-0 z-50 backdrop-blur-md bg-gray-900/80 border-b border-gray-700">
      <div className="w-full px-4 py-4">
        <div className="flex items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-white">
              📚 <span className="text-red-400">{editionTitle || "Comic Viewer"}</span>
            </h1>
          </div>

          {images.length > 0 && (
            <div className="hidden md:flex items-center justify-center gap-3 flex-1 ml-24">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Page précédente (←)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex items-center gap-2">
                <select
                  value={currentIndex}
                  onChange={(e) => setPage(Number(e.target.value))}
                  className="w-60 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 outline-none text-sm text-center"
                >
                  {images.map((_, i) => (
                    <option key={i} value={i}>
                      Page {i + 1}
                    </option>
                  ))}
                </select>
                
                <span className="text-sm text-gray-400">
                  / {images.length}
                </span>
              </div>
              
              <button
                onClick={goNext}
                disabled={currentIndex === images.length - 1}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Page suivante (→)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {images.length > 0 && (
            <div className="md:hidden flex items-center gap-2 text-gray-300 ml-auto">
              <span className="text-sm">Page {currentIndex + 1} / {images.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComicViewerHeader;