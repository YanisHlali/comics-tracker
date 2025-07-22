import { useState, useRef, useEffect, useCallback } from "react";
import usePollingTask from "@/hooks/usePollingTask";
import useViewerKeepAlive from "@/hooks/useViewerKeepAlive";
import useArrowNavigation from "@/hooks/useArrowNavigation";

interface UseComicViewerStateReturn {
  driveLink: string;
  setDriveLink: (link: string) => void;
  editionTitle: string;
  setEditionTitle: (title: string) => void;
  images: string[];
  loading: boolean;
  error: string;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  progress: number;
  statusMessage: string;
  copied: boolean;
  isDoublePage: boolean;
  imgLoaded: boolean;
  setImgLoaded: (loaded: boolean) => void;
  lastHeight: React.MutableRefObject<string>;
  customWidth: number;
  setCustomWidth: (width: number) => void;
  customDoubleWidth: number;
  setCustomDoubleWidth: (width: number) => void;
  customHeight: number;
  setCustomHeight: (height: number) => void;
  onSubmit: (e?: React.FormEvent) => void;
  goPrev: () => void;
  goNext: () => void;
  setPage: (index: number) => void;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onCopy: () => Promise<void>;
  onImageClick: (e: React.MouseEvent, containerRef?: React.RefObject<HTMLElement | null>) => void;
  scrollToTop: () => void;
  tableContents: number[];
  labels: string[];
  forceRestart: () => void;
}

export default function useComicViewerState(): UseComicViewerStateReturn {
  const [driveLink, setDriveLink] = useState<string>("");
  const [editionTitle, setEditionTitle] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [tableContents, setTableContents] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [taskId, setTaskId] = useState<string | null>(null);

  const [copied, setCopied] = useState<boolean>(false);
  const [isDoublePage, setIsDoublePage] = useState<boolean>(false);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);

  const [customWidth, setCustomWidth] = useState<number>(60);
  const [customDoubleWidth, setCustomDoubleWidth] = useState<number>(90);
  const [customHeight, setCustomHeight] = useState<number>(80);
  const [imageErrorCount, setImageErrorCount] = useState<number>(0);

  const [shouldAutoExtract, setShouldAutoExtract] = useState<boolean>(false);
  const [sessionRecovered, setSessionRecovered] = useState<boolean>(false);
  const [pendingPageRestore, setPendingPageRestore] = useState<number | null>(null);

  const lastHeight = useRef<string>("80vh");
  const abortRef = useRef<AbortController | null>(null);
  const imageErrorTimeout = useRef<NodeJS.Timeout | null>(null);
  const preloadedImages = useRef<Set<string>>(new Set());
  const currentImageRef = useRef<HTMLImageElement | null>(null);
  const extractionStartTime = useRef<number | null>(null);

  const detectDouble = useCallback((w: number, h: number): boolean => w / h > 1.3, []);

  const checkSessionRecovery = useCallback((): boolean => {
    if (typeof window === "undefined") return false;

    const lastSession = localStorage.getItem("comicViewerLastSession");
    const lastPage = localStorage.getItem("comicViewerLastPage");
    const returnUrl = localStorage.getItem("comicViewerReturnUrl");

    if (lastSession && lastPage && returnUrl) {
      const sessionTime = parseInt(lastSession);
      const now = Date.now();
      const timeDifference = now - sessionTime;
      
      if (timeDifference > 60000) {
        localStorage.removeItem("comicViewerLastSession");
        localStorage.removeItem("comicViewerLastPage");
        localStorage.removeItem("comicViewerReturnUrl");
        
        if (window.location.pathname === "/comic-viewer" && returnUrl !== "/comic-viewer") {
          setError(`Session expirée. Redirection vers la page précédente...`);
          setTimeout(() => {
            window.location.href = returnUrl;
          }, 2000);
          return true;
        }
      } else if (lastPage && parseInt(lastPage) >= 0) {
        const pageNumber = parseInt(lastPage);
        setPendingPageRestore(pageNumber);
        setSessionRecovered(true);
      }
    }
    return false;
  }, []);

  const extractImages = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError("");
    setImages([]);
    
    setProgress(0);
    setTaskId(null);
    setImgLoaded(false);
    preloadedImages.current.clear();
    extractionStartTime.current = Date.now();

    if (abortRef.current) abortRef.current.abort();
    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const res = await fetch(`https://yanis-mail.fr/from-drive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: driveLink }),
        signal: abortController.signal,
      });

      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur inconnue.");
        setTaskId(data.taskId);
      } else {
        const raw = await res.text();
        throw new Error(
          "La réponse n'est pas un JSON valide : " + raw.slice(0, 100)
        );
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setError(err.message || "Une erreur est survenue.");
      setLoading(false);
    }
  }, [driveLink, pendingPageRestore]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const shouldRedirect = checkSessionRecovery();
      if (shouldRedirect) return;

      const savedLink = localStorage.getItem("driveLink");
      const savedTitle = localStorage.getItem("editionTitle");
      const savedWidth = localStorage.getItem("customWidth");
      const savedDoubleWidth = localStorage.getItem("customDoubleWidth");
      const savedHeight = localStorage.getItem("customHeight");
      let savedTableContents = localStorage.getItem("tableContents");
      let savedLabels = localStorage.getItem("labels");

      if (savedLink) {
        setDriveLink(savedLink);
        setShouldAutoExtract(true);
      }
      if (savedTitle) setEditionTitle(savedTitle);
      if (savedWidth) setCustomWidth(Number(savedWidth));
      if (savedDoubleWidth) setCustomDoubleWidth(Number(savedDoubleWidth));
      if (savedHeight) setCustomHeight(Number(savedHeight));

      if (savedTableContents && savedTableContents !== "undefined") {
        try {
          const parsed = JSON.parse(savedTableContents);
          setTableContents(parsed);
        } catch (e) {
          console.error("[ComicViewerState] JSON.parse failed:", e);
        }
      }
      if (savedLabels && savedLabels !== "undefined") {
        try {
          const parsed = JSON.parse(savedLabels);
          setLabels(parsed);
        } catch (e) {
          console.error("[ComicViewerState] JSON.parse labels failed:", e);
        }
      }
    }
  }, [checkSessionRecovery]);

  useEffect(() => {
    if (driveLink && shouldAutoExtract && images.length === 0 && !loading) {
      const timer = setTimeout(() => {
        extractImages();
        setShouldAutoExtract(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [driveLink, shouldAutoExtract, images.length, loading, extractImages]);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (imageErrorTimeout.current) clearTimeout(imageErrorTimeout.current);
    };
  }, []);

  usePollingTask(loading ? taskId : null, {
    onError: (msg: string) => {
      setError(msg);
      setLoading(false);
      setTaskId(null);
      setProgress(0);
      extractionStartTime.current = null;
    },
    onDone: (data: any) => {
      const fixedImages = (data.images || []).map((imageUrl: string) => {
        if (imageUrl.startsWith('https://yanis-mail.fr/api/proxy/')) {
          return imageUrl.replace('https://yanis-mail.fr', '');
        }
        if (imageUrl.startsWith('http://yanis-mail.fr/api/proxy/')) {
          return imageUrl.replace('http://yanis-mail.fr', '');
        }
        if (imageUrl.startsWith('http://localhost:3000/api/proxy/')) {
          return imageUrl.replace('http://localhost:3000', '');
        }
        if (imageUrl.startsWith('https://localhost:3000/api/proxy/')) {
          return imageUrl.replace('https://localhost:3000', '');
        }
        if (imageUrl.includes('localhost') && imageUrl.includes('/api/proxy/')) {
          const pathStart = imageUrl.indexOf('/api/proxy/');
          return imageUrl.substring(pathStart);
        }
        return imageUrl;
      });

      setImages(fixedImages);
      if (data.table_content) setTableContents(data.table_content);
      if (data.labels) setLabels(data.labels);
      setLoading(false);
      setProgress(100);
      setStatusMessage(data.message || "✔️ Terminé");
      extractionStartTime.current = null;

      if (pendingPageRestore !== null && fixedImages.length > 0) {
        const pageToRestore = Math.min(pendingPageRestore, fixedImages.length - 1);
        
        setCurrentIndex(pageToRestore);
        setPendingPageRestore(null);
        setSessionRecovered(false);
        
        localStorage.removeItem("comicViewerLastSession");
        localStorage.removeItem("comicViewerLastPage");
      } else {
        setCurrentIndex(0);
      }
    },
    onUpdate: (data: any) => {
      setProgress(data.progress || 0);
      setStatusMessage(data.message || "");

      if (extractionStartTime.current && Date.now() - extractionStartTime.current > 300000) {
        setError("Extraction trop longue. Veuillez réessayer avec un fichier plus petit.");
        setLoading(false);
        setTaskId(null);
        setProgress(0);
        extractionStartTime.current = null;
        if (abortRef.current) abortRef.current.abort();
      }
    },
    onClear: () => {
      extractionStartTime.current = null;
    },
    pollInterval: 2000,
  });

  useViewerKeepAlive(taskId, currentIndex);

  useEffect(() => {
    if (images.length === 0) return;

    const currentSrc = images[currentIndex];

    const isCurrentImagePreloaded = preloadedImages.current.has(currentSrc);
    if (!isCurrentImagePreloaded) {
      setImgLoaded(false);
    }
    setImageErrorCount(0);

    const imagesToPreload = [currentSrc];

    if (currentIndex > 0) {
      imagesToPreload.push(images[currentIndex - 1]);
    }
    if (currentIndex < images.length - 1) {
      imagesToPreload.push(images[currentIndex + 1]);
    }

    imagesToPreload.forEach(src => {
      if (src && !preloadedImages.current.has(src)) {
        if (src.includes('/cbr/') || (src.includes('/api/proxy/') && !src.includes('localhost'))) {
          const img = new Image();
          img.onload = () => {
            preloadedImages.current.add(src);
            if (src === currentSrc) {
              setImgLoaded(true);
            }
          };
          img.onerror = () => {
            if (src.includes('/cbr/')) {
              console.warn(`[ComicViewer] Failed to preload: ${src}`);
            }
          };
          img.src = src;
        }
      } else if (src === currentSrc && preloadedImages.current.has(src)) {
        setImgLoaded(true);
      }
    });
  }, [currentIndex, images, imgLoaded]);

  const forceRestart = useCallback((): void => {
    if (abortRef.current) abortRef.current.abort();
    if (imageErrorTimeout.current) clearTimeout(imageErrorTimeout.current);

    setLoading(false);
    setError("");
    setTaskId(null);
    setProgress(0);
    setImages([]);
    setCurrentIndex(0);
    setImgLoaded(false);
    preloadedImages.current.clear();
    extractionStartTime.current = null;
    setPendingPageRestore(null);

    setTimeout(() => {
      if (driveLink) {
        extractImages();
      }
    }, 1000);
  }, [driveLink, extractImages]);

  const goPrev = useCallback(
    (): void => setCurrentIndex((i) => Math.max(0, i - 1)),
    []
  );
  const goNext = useCallback(
    (): void => setCurrentIndex((i) => Math.min(images.length - 1, i + 1)),
    [images.length]
  );

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>): void => {
      const target = e.target as HTMLImageElement;
      const { naturalWidth, naturalHeight, clientHeight, src } = target;
      setIsDoublePage(detectDouble(naturalWidth, naturalHeight));
      lastHeight.current = `${clientHeight}px`;
      setImgLoaded(true);
      setImageErrorCount(0);
      preloadedImages.current.add(src);
      currentImageRef.current = target;
    },
    [detectDouble]
  );

  const onImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>): void => {
    const target = e.target as HTMLImageElement;
    const src = target.src;

    if (src.includes('localhost/api/proxy/proxy-image') ||
      src.includes('localhost:3000/api/proxy/')) {
      return;
    }

    console.warn(`[ComicViewer] Image load error: ${src}`);

    setImageErrorCount((prev) => {
      const newCount = prev + 1;

      if (newCount >= 3) {
        if (imageErrorTimeout.current) {
          clearTimeout(imageErrorTimeout.current);
        }

        imageErrorTimeout.current = setTimeout(() => {
          setError("Images non disponibles. Veuillez réessayer.");
          if (driveLink) {
            preloadedImages.current.clear();
            extractImages();
          }
        }, 2000);
      } else {
        if (src.includes('/cbr/') || src.includes('/api/proxy/')) {
          setTimeout(() => {
            if (target) {
              let retrySrc = src;
              if (retrySrc.includes('localhost')) {
                const pathStart = retrySrc.indexOf('/api/proxy/');
                if (pathStart !== -1) {
                  retrySrc = retrySrc.substring(pathStart);
                }
              }
              target.src = retrySrc + (retrySrc.includes('?') ? '&' : '?') + 'retry=' + newCount;
            }
          }, 1000 * newCount);
        }
      }

      return newCount;
    });
  }, [driveLink, extractImages]);

  const onCopy = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(driveLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("[onCopy] Clipboard write failed:", err);
      setError("Impossible de copier le lien");
    }
  }, [driveLink]);

  const setPage = useCallback(
    (index: number): void => {
      if (index >= 0 && index < images.length) setCurrentIndex(index);
    },
    [images.length]
  );

  const onImageClick = useCallback(
    (e: React.MouseEvent, containerRef?: React.RefObject<HTMLElement | null>): void => {
      if (!containerRef?.current) return;
      const { left, width } = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - left;
      clickX < width / 2 ? goPrev() : goNext();
    },
    [goPrev, goNext]
  );

  const scrollToTop = useCallback((): void => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const onSubmit = useCallback(
    (e?: React.FormEvent): void => {
      e?.preventDefault();
      if (!driveLink) return;
      
      if (typeof window !== "undefined") {
        const existingPage = localStorage.getItem("comicViewerLastPage");
        const existingSession = localStorage.getItem("comicViewerLastSession");
        const existingReturnUrl = localStorage.getItem("comicViewerReturnUrl");
        
        if (existingPage && existingSession && existingReturnUrl) {
          const pageNumber = parseInt(existingPage);
          if (pageNumber >= 0) {
            setPendingPageRestore(pageNumber);
            setSessionRecovered(true);
          }
        }
        
        localStorage.setItem("driveLink", driveLink);
        localStorage.setItem("editionTitle", editionTitle);
        localStorage.setItem("customWidth", customWidth.toString());
        localStorage.setItem("customDoubleWidth", customDoubleWidth.toString());
        localStorage.setItem("customHeight", customHeight.toString());
        localStorage.setItem("tableContents", JSON.stringify(tableContents));
        localStorage.setItem("labels", JSON.stringify(labels));
      }
      
      extractImages();
    },
    [
      driveLink,
      editionTitle,
      customWidth,
      customDoubleWidth,
      customHeight,
      tableContents,
      labels,
      extractImages,
    ]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("customWidth", customWidth.toString());
    }
  }, [customWidth]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("customDoubleWidth", customDoubleWidth.toString());
    }
  }, [customDoubleWidth]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("customHeight", customHeight.toString());
    }
  }, [customHeight]);

  useArrowNavigation(goPrev, goNext);

  return {
    driveLink,
    setDriveLink,
    editionTitle,
    setEditionTitle,
    images,
    loading,
    error,
    currentIndex,
    setCurrentIndex,
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
    customHeight,
    setCustomHeight,
    onSubmit,
    goPrev,
    goNext,
    setPage,
    onImageLoad,
    onImageError,
    onCopy,
    onImageClick,
    scrollToTop,
    tableContents,
    labels,
    forceRestart,
  };
}