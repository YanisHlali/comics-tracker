import React from "react";
import { RiFullscreenFill } from "react-icons/ri";
import TableOfContentsPanel from "./TableOfContentsPanel";

interface DisplayControlPanelProps {
  isDoublePage: boolean;
  customWidth: number;
  customDoubleWidth: number;
  setCustomWidth: (width: number) => void;
  setCustomDoubleWidth: (width: number) => void;
  tableContents?: number[];
  labels?: string[];
  images: string[];
  currentIndex: number;
  setPage: (index: number) => void;
}

const DisplayControlPanel: React.FC<DisplayControlPanelProps> = ({ 
  isDoublePage, 
  customWidth, 
  customDoubleWidth, 
  setCustomWidth, 
  setCustomDoubleWidth,
  tableContents,
  labels,
  images,
  currentIndex,
  setPage
}) => {
  return (
    <>
      <div className="comic-viewer-card bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <RiFullscreenFill className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Affichage
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Type de page</span>
            <span className="text-red-400 font-medium">
              {isDoublePage ? "📖 Double" : "📄 Simple"}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Largeur ({isDoublePage ? "double" : "simple"})
            </label>
            <input
              type="range"
              min={isDoublePage ? "50" : "30"}
              max={isDoublePage ? "100" : "100"}
              value={isDoublePage ? customDoubleWidth : customWidth}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (isDoublePage) {
                  setCustomDoubleWidth(value);
                } else {
                  setCustomWidth(value);
                }
              }}
              className="comic-viewer-slider w-full bg-gray-700 rounded-lg cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${isDoublePage ? customDoubleWidth : customWidth}%, #374151 ${isDoublePage ? customDoubleWidth : customWidth}%, #374151 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{isDoublePage ? "50%" : "30%"}</span>
              <span className="font-medium text-red-400">{isDoublePage ? customDoubleWidth : customWidth}%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <button
              onClick={() => {
                if (isDoublePage) {
                  setCustomDoubleWidth(50);
                } else {
                  setCustomWidth(30);
                }
              }}
              className="comic-viewer-btn px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors"
            >
              📱 Petit
            </button>
            <button
              onClick={() => {
                if (isDoublePage) {
                  setCustomDoubleWidth(70);
                } else {
                  setCustomWidth(50);
                }
              }}
              className="comic-viewer-btn px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors"
            >
              💻 Normal
            </button>
            <button
              onClick={() => {
                if (isDoublePage) {
                  setCustomDoubleWidth(100);
                } else {
                  setCustomWidth(100);
                }
              }}
              className="comic-viewer-btn px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors"
            >
              🔍 Grand
            </button>
          </div>

          <button
            onClick={() => {
              setCustomWidth(50);
              setCustomDoubleWidth(70);
            }}
            className="comic-viewer-btn w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm mt-3"
          >
            🔄 Réinitialiser
          </button>

          <button
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              } else {
                document.documentElement.requestFullscreen();
              }
            }}
            className="comic-viewer-btn w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
          >
            🖥️ Plein écran
          </button>
        </div>
      </div>

      <TableOfContentsPanel
        tableContents={tableContents}
        labels={labels}
        images={images}
        currentIndex={currentIndex}
        setPage={setPage}
      />
    </>
  );
};

export default DisplayControlPanel;