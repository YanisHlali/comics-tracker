import React, { useRef } from "react";
import MetaTitle from "@/components/MetaTitle";
import Image from "next/image";

export default function ComicViewerDesktop(props) {
  const {
    driveLink,
    editionTitle,
    images,
    loading,
    error,
    currentIndex,
    progress,
    statusMessage,
    copied,
    isDoublePage,
    imgLoaded,
    lastHeight,
    handleSubmit,
    goPrev,
    goNext,
    setPage,
    handleImageLoad,
    handleCopy,
    handleImageClick,
  } = props;

  const containerRef = useRef(null);

  return (
    <>
      <MetaTitle title={`${editionTitle || "Comic Viewer"} | Comics Tracker`} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="mt-10 text-3xl font-bold text-white">
            Lecture de <span className="text-red-400">{editionTitle}</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="mb-6 relative">
          {loading && (
            <div className="w-full bg-gray-800 rounded h-2 mb-4 overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          {loading && (
            <p
              className="text-white text-sm text-center mb-2"
              role="status"
              aria-live="polite"
            >
              {statusMessage || `${progress}%`}
            </p>
          )}
          <div className="flex flex-row items-center gap-2">
            <div className="inline-flex items-center gap-2">
              <input
                type="text"
                value={driveLink}
                size={Math.max(1, driveLink.length)}
                disabled
                placeholder="Collez ici votre lien Google Drive"
                className="p-2 border rounded bg-gray-900 text-white disabled:text-gray-400"
                readOnly
              />
              <button
                type="button"
                aria-label="Copier le lien"
                className="text-gray-400 hover:text-white"
                onClick={handleCopy}
                tabIndex={-1}
              >
                {copied ? (
                  // Icône "check"
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M5 11l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  // Icône "copy"
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="9" y="9" width="10" height="10" rx="2" />
                    <rect x="3" y="3" width="10" height="10" rx="2" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <br />
          <div className="flex flex-row gap-3 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? "Chargement…" : "Charger le comics"}
            </button>
            {driveLink && (
              <a
                href={driveLink}
                download
                className="bg-red-600 text-white px-4 py-2 rounded shadow-lg"
                style={{ minWidth: 0, textAlign: "center" }}
              >
                Télécharger
              </a>
            )}
          </div>
        </form>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        {images.length > 0 && (
          <div className="flex flex-col items-center">
            <div className="flex gap-4 mb-2">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
              >
                ⬅️ Précédente
              </button>
              <button
                onClick={goNext}
                disabled={currentIndex === images.length - 1}
                className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
              >
                Suivante ➡️
              </button>
            </div>
            <span className="text-white mb-4">
              Page {currentIndex + 1} / {images.length}
            </span>
            <div className="mb-6 w-full max-w-sm">
              <label htmlFor="pageSelect" className="block mb-2 text-lg font-semibold text-gray-200">
                📖 Aller à la page :
              </label>
              <div className="relative">
                <select
                  id="pageSelect"
                  value={currentIndex}
                  onChange={(e) => setPage(Number(e.target.value))}
                  className="appearance-none w-full px-4 py-2 pr-10 rounded-md bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {images.map((_, i) => (
                    <option key={i} value={i}>
                      Page {i + 1}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.084l3.71-3.853a.75.75 0 111.08 1.04l-4.25 4.417a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div
              ref={containerRef}
              onClick={(e) => handleImageClick(e, containerRef)}
              className="relative overflow-hidden inline-block cursor-pointer"
              style={{
                width: isDoublePage ? "90vw" : "60vw",
                maxWidth: isDoublePage ? "90vw" : "60vw",
              }}
            >
              {!imgLoaded && (
                <div
                  className="bg-gray-800 animate-pulse"
                  style={{ width: "100%", height: lastHeight.current }}
                />
              )}
              <Image
                width={isDoublePage ? 1200 : 600}
                height={isDoublePage ? 800 : 1200}
                key={currentIndex}
                src={images[currentIndex]}
                alt={`Page ${currentIndex + 1}`}
                onLoad={handleImageLoad}
                onError={() => {
                }}
                className={`object-contain transition-opacity duration-200 w-full h-auto ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                draggable={false}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
