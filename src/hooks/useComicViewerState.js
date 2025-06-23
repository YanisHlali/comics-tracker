import { useState, useRef, useEffect, useCallback } from "react";
import usePollingTask from "@/hooks/usePollingTask";
import useViewerKeepAlive from "@/hooks/useViewerKeepAlive";
import useArrowNavigation from "@/hooks/useArrowNavigation";

export default function useComicViewerState() {
  const [driveLink, setDriveLink] = useState("");
  const [editionTitle, setEditionTitle] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [taskId, setTaskId] = useState(null);

  const [copied, setCopied] = useState(false);
  const [isDoublePage, setIsDoublePage] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const lastHeight = useRef("80vh");

  const detectDouble = useCallback((w, h) => w / h > 1.3, []);

  const extractImages = useCallback(async () => {
    let isMounted = true;

    setLoading(true);
    setError("");
    setImages([]);
    setCurrentIndex(0);
    setProgress(0);
    setTaskId(null);

    try {
      const res = await fetch(`/api/proxy/from-drive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: driveLink }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      if (isMounted) setTaskId(data.taskId);
    } catch (err) {
      if (isMounted) {
        setError(err.message);
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [driveLink]);

  useEffect(() => {
    const savedLink = localStorage.getItem("driveLink");
    const savedTitle = localStorage.getItem("editionTitle");
    if (savedLink) setDriveLink(savedLink);
    if (savedTitle) setEditionTitle(savedTitle);
  }, []);

  useEffect(() => {
    if (driveLink) {
      const cleanup = extractImages();
      return () => {
        if (typeof cleanup === "function") cleanup();
      };
    }
  }, [driveLink, extractImages]);

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault();
      if (!driveLink) return;
      localStorage.setItem("driveLink", driveLink);
      localStorage.setItem("editionTitle", editionTitle);
      extractImages();
    },
    [driveLink, editionTitle, extractImages]
  );

  usePollingTask(taskId, {
    onError: (msg) => {
      setError(msg);
      setLoading(false);
      setTaskId(null);
      setProgress(0);
    },
    onDone: (data) => {
      setImages(data.images || []);
      setLoading(false);
      setProgress(100);
      setStatusMessage(data.message || "✔️ Terminé");
      setTimeout(() => setTaskId(null), 5 * 60 * 1000);
    },
    onUpdate: (data) => {
      setProgress(data.progress || 0);
      setStatusMessage(data.message || "");
    },
    onClear: () => {},
  });

  useViewerKeepAlive(taskId);

  useEffect(() => {
    setImgLoaded(false);
  }, [currentIndex]);

  const goPrev = useCallback(() => setCurrentIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(
    () => setCurrentIndex((i) => Math.min(images.length - 1, i + 1)),
    [images.length]
  );

  const handleImageLoad = useCallback(
    (e) => {
      const { naturalWidth, naturalHeight, clientHeight } = e.target;
      setIsDoublePage(detectDouble(naturalWidth, naturalHeight));
      lastHeight.current = `${clientHeight}px`;
      setImgLoaded(true);
    },
    [detectDouble]
  );

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(driveLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }, [driveLink]);

  const setPage = useCallback(
    (index) => {
      if (index >= 0 && index < images.length) setCurrentIndex(index);
    },
    [images.length]
  );

  const handleImageClick = useCallback(
    (e, containerRef) => {
      if (!containerRef?.current) return;
      const { left, width } = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - left;
      clickX < width / 2 ? goPrev() : goNext();
    },
    [goPrev, goNext]
  );

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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
    lastHeight,
    handleSubmit,
    goPrev,
    goNext,
    setPage,
    handleImageLoad,
    handleCopy,
    handleImageClick,
    scrollToTop,
  };
}
