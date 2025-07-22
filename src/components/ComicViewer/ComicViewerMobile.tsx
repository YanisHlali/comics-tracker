import React from "react";
import MetaTitle from "@/components/MetaTitle";
import Image from "next/image";
import useComicViewerState from "@/hooks/useComicViewerState";

interface ComicViewerMobileProps {}

const ComicViewerMobile: React.FC<ComicViewerMobileProps> = () => {
  const {
    driveLink,
    editionTitle,
    images = [],
    loading,
    error,
    progress,
    statusMessage,
    copied,
    onSubmit,
    onCopy,
    onImageError,
    scrollToTop,
  } = useComicViewerState();

  return (
    <>
      <MetaTitle title={`${editionTitle || "Comic Viewer"} | Comics Tracker`} />
      <div className="w-full min-h-screen bg-[#121826]">
        <div className="relative mb-6 pt-12 px-4">
          {driveLink && (
            <a
              href={driveLink}
              download
              className="absolute top-0 right-0 mt-4 mr-4 px-3 py-2 bg-red-600 text-white rounded shadow-lg"
            >
              Télécharger
            </a>
          )}
          <h1 className="mt-10 text-3xl font-bold text-white">
            Lecture de <span className="text-red-400">{editionTitle}</span>
          </h1>
        </div>

        <form onSubmit={onSubmit} className="mb-6 px-4">
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
          <div className="flex gap-2">
            <input
              type="text"
              value={driveLink}
              disabled={true}
              placeholder="Collez ici votre lien Google Drive"
              className="w-full p-2 border rounded mb-2 bg-gray-900 text-white disabled:text-gray-400"
              readOnly
            />
            <button
              type="button"
              aria-label="Copier le lien"
              className="text-gray-400 hover:text-white px-3"
              onClick={onCopy}
              tabIndex={-1}
            >
              {copied ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 11l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="9" y="9" width="10" height="10" rx="2" />
                  <rect x="3" y="3" width="10" height="10" rx="2" />
                </svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50 w-full mt-2"
          >
            {loading ? "Chargement…" : "Charger le comics"}
          </button>
        </form>

        {error && <div className="text-red-500 mb-4 px-4">{error}</div>}

        {images && images.length > 0 && (
          <div className="w-full flex flex-col items-center gap-4 pb-20">
            {images.map((src: string, i: number) => (
              <React.Fragment key={i}>
                <span className="text-white text-center w-full my-2">
                  Page {i + 1} / {images.length}
                </span>
                <Image
                  src={src}
                  width={600}
                  height={800}
                  alt={`Page ${i + 1}`}
                  className="w-screen h-auto object-contain block max-w-full"
                  draggable={false}
                  onError={onImageError}
                />
              </React.Fragment>
            ))}
          </div>
        )}

        {images && images.length > 0 && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 bg-red-600/70 text-white p-3 rounded-full shadow-lg hover:bg-red-700/90 transition text-2xl"
            aria-label="Remonter en haut"
          >
            ↑
          </button>
        )}
      </div>
    </>
  );
};

export default ComicViewerMobile;