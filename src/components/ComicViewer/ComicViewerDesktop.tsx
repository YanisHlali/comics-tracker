import React, { useRef, useState, useEffect, useCallback } from "react";
import MetaTitle from "@/components/MetaTitle";
import useComicViewerState from "@/hooks/useComicViewerState";
import KeyboardShortcuts from "./KeyboardShortcuts";
import ComicViewerHeader from "./ComicViewerHeader";
import DisplayControlPanel from "./DisplayControlPanel";
import ComicViewerLoadingPanel from "./ComicViewerLoadingPanel";
import ComicViewerImageDisplay from "./ComicViewerImageDisplay";
import { PiWarningCircle } from "react-icons/pi";

interface ComicViewerDesktopProps {}

const ComicViewerDesktop: React.FC<ComicViewerDesktopProps> = () => {
  const {
    driveLink,
    editionTitle,
    images,
    loading,
    error,
    currentIndex,
    tableContents,
    labels,
    progress,
    statusMessage,
    copied,
    isDoublePage,
    imgLoaded,
    setImgLoaded,
    lastHeight,
    customWidth,
    setCustomWidth,
    customDoubleWidth,
    setCustomDoubleWidth,
    onSubmit,
    goPrev,
    goNext,
    setPage,
    onImageLoad,
    onImageError,
    onCopy,
    onImageClick,
  } = useComicViewerState();

  const pageToIssueLabel: Record<number, string> = {};
  if (Array.isArray(tableContents) && Array.isArray(labels) && images && Array.isArray(images) && images.length) {
    tableContents.forEach((pageNumber: number, i: number) => {
      const index = pageNumber - 1;
      if (index >= 0 && index < images.length) {
        pageToIssueLabel[index] = labels[i];
      }
    });
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const [showZoomIndicator, setShowZoomIndicator] = useState<boolean>(false);

  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -5 : 5;
      const current = isDoublePage ? customDoubleWidth : customWidth;
      const min = isDoublePage ? 50 : 30;
      const max = 100;
      const newValue = Math.max(min, Math.min(max, current + delta));

      if (isDoublePage) {
        setCustomDoubleWidth(newValue);
      } else {
        setCustomWidth(newValue);
      }

      setShowZoomIndicator(true);
      setTimeout(() => setShowZoomIndicator(false), 1000);
    }
  }, [isDoublePage, customDoubleWidth, customWidth, setCustomDoubleWidth, setCustomWidth]);

  useEffect(() => {
    setShowZoomIndicator(true);
    const timer = setTimeout(() => setShowZoomIndicator(false), 800);
    return () => clearTimeout(timer);
  }, [customWidth, customDoubleWidth]);

  return (
    <>
      <MetaTitle title={`${editionTitle || "Comic Viewer"} | Comics Tracker`} />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <ComicViewerHeader
          editionTitle={editionTitle}
          images={images}
          currentIndex={currentIndex}
          setPage={setPage}
          goPrev={goPrev}
          goNext={goNext}
        />

        <div className="relative w-full">
          <div className="comic-control-panel">
            <div className="space-y-6 pt-4">
              <DisplayControlPanel
                isDoublePage={isDoublePage}
                customWidth={customWidth}
                customDoubleWidth={customDoubleWidth}
                setCustomWidth={setCustomWidth}
                setCustomDoubleWidth={setCustomDoubleWidth}
                tableContents={tableContents}
                labels={labels}
                images={images}
                currentIndex={currentIndex}
                setPage={setPage}
              />
              
              <ComicViewerLoadingPanel
                loading={loading}
                error={error}
                progress={progress}
                statusMessage={statusMessage}
                driveLink={driveLink}
                copied={copied}
                onSubmit={onSubmit}
                onCopy={onCopy}
              />
            </div>
          </div>

          {error && error.toLowerCase().includes("stockage plein") && (
            <div className="w-full pt-4 px-4">
              <div className="max-w-2xl mx-auto">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <PiWarningCircle className="w-6 h-6 text-red-400" />
                    <h3 className="text-xl font-semibold text-red-400">Erreur de stockage</h3>
                  </div>
                  <p className="text-red-300 text-lg">{error}, sous la France de Macron je peux pas payer beaucoup de serveur désolé.</p>
                  <p className="text-red-300 text-lg">Copie le lien et télécharge le toi-même.</p>
                </div>
              </div>
            </div>
          )}

          {images && images.length > 0 && !loading && (
            <ComicViewerImageDisplay
              containerRef={containerRef}
              onImageClick={onImageClick}
              onWheel={onWheel}
              isDoublePage={isDoublePage}
              customWidth={customWidth}
              customDoubleWidth={customDoubleWidth}
              imgLoaded={imgLoaded}
              setImgLoaded={setImgLoaded}
              lastHeight={lastHeight}
              images={images}
              currentIndex={currentIndex}
              onImageLoad={onImageLoad}
              onImageError={onImageError}
              showZoomIndicator={showZoomIndicator}
            />
          )}
        </div>

        <KeyboardShortcuts />
      </div>
    </>
  );
};

export default ComicViewerDesktop;