import React from "react";
import { CiLink } from "react-icons/ci";
import { FaRegCopy } from "react-icons/fa6";
import { IoCheckmarkDoneOutline } from "react-icons/io5";

interface ComicViewerLoadingPanelProps {
  loading: boolean;
  error: string;
  progress: number;
  statusMessage: string;
  driveLink: string;
  copied: boolean;
  onSubmit: (e?: React.FormEvent) => void;
  onCopy: () => Promise<void>;
}

const ComicViewerLoadingPanel: React.FC<ComicViewerLoadingPanelProps> = ({
  loading,
  error,
  progress,
  statusMessage,
  driveLink,
  copied,
  onSubmit,
  onCopy
}) => {
  return (
    <div className="comic-viewer-card bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
          <CiLink className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">
          Lien
        </h3>
      </div>

      <div className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          {loading && (
            <div className="space-y-2">
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="comic-progress-bar h-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-xs text-gray-300" role="status" aria-live="polite">
                {statusMessage || `${progress}%`}
              </p>
              <div className="text-center py-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg">
                  <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-xs font-medium">Extraction...</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <input
              type="text"
              value={driveLink}
              disabled
              placeholder="Lien Google Drive"
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              readOnly
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="comic-viewer-btn flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-xs"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-1">
                    <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Chargement...</span>
                  </div>
                ) : (
                  "🚀 Charger"
                )}
              </button>

              <button
                type="button"
                onClick={onCopy}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors"
                title="Copier le lien"
              >
                {copied ? (
                  <IoCheckmarkDoneOutline className="w-4 h-4 text-green-400" />
                ) : (
                  <FaRegCopy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-400 text-xs">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComicViewerLoadingPanel;