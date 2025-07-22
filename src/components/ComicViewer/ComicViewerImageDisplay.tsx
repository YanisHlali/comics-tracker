import React from "react";
import Image from "next/image";
import { FaRegFileLines } from "react-icons/fa6";

interface ComicViewerImageDisplayProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onImageClick: (e: React.MouseEvent, containerRef?: React.RefObject<HTMLElement | null>) => void;
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  isDoublePage: boolean;
  customWidth: number;
  customDoubleWidth: number;
  imgLoaded: boolean;
  setImgLoaded?: (loaded: boolean) => void;
  lastHeight: React.MutableRefObject<string>;
  images: string[];
  currentIndex: number;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  showZoomIndicator: boolean;
}

const ComicViewerImageDisplay: React.FC<ComicViewerImageDisplayProps> = ({
  containerRef,
  onImageClick,
  onWheel,
  isDoublePage, 
  customWidth, 
  customDoubleWidth, 
  imgLoaded, 
  setImgLoaded,
  lastHeight, 
  images, 
  currentIndex,
  onImageLoad,
  onImageError,
  showZoomIndicator 
}) => {
  const currentImageSrc = images[currentIndex];
  
  return (
    <div className="comic-main-content">
      <div className="comic-image-wrapper">
        <div
          ref={containerRef}
          onClick={(e) => onImageClick(e, containerRef)}
          onWheel={onWheel}
          className="relative cursor-pointer pt-4 max-w-full"
          style={{
            width: `${isDoublePage ? customDoubleWidth : customWidth}%`,
            minWidth: `${isDoublePage ? customDoubleWidth : customWidth}%`,
          }}
        >
          {!imgLoaded && (
            <div
              className="absolute inset-0 bg-gray-800 rounded-lg flex items-center justify-center z-10 w-full"
              style={{ height: lastHeight.current || "80vh" }}
            >
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <FaRegFileLines className="w-6 h-6 animate-pulse" />
                <span className="text-sm">Chargement...</span>
              </div>
            </div>
          )}

          {currentImageSrc && (
            <Image
              key={`${currentIndex}-${currentImageSrc}`}
              src={currentImageSrc}
              alt={`Page ${currentIndex + 1}`}
              width={isDoublePage ? 1600 : 800}
              height={isDoublePage ? 1131 : 1200}
              onLoad={onImageLoad}
              onError={onImageError}
              className={`object-contain transition-opacity duration-300 ease-in-out w-full h-auto rounded-lg shadow-2xl ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
              draggable={false}
              priority={currentIndex === 0}
              unoptimized
              onLoadingComplete={() => {
                if (!imgLoaded) {
                  setTimeout(() => setImgLoaded?.(true), 100);
                }
              }}
            />
          )}

          {showZoomIndicator && (
            <div className={`comic-zoom-indicator ${showZoomIndicator ? 'show' : ''}`}>
              🔍 {isDoublePage ? customDoubleWidth : customWidth}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComicViewerImageDisplay;