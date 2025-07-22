import { useEffect } from "react";
import { logger } from "@/lib/errorHandler";

export default function useViewerKeepAlive(
  taskId: string | null, 
  currentIndex: number = 0
): void {
  useEffect(() => {
    if (!taskId) return;

    let lastPingTime = 0;
    const PING_THROTTLE = 5000;

    const storeCurrentPage = (): void => {
      if (typeof window !== "undefined") {
        const returnUrl = `${window.location.pathname}${window.location.search}`;
        localStorage.setItem("comicViewerReturnUrl", returnUrl);
        localStorage.setItem("comicViewerLastPage", currentIndex.toString());
        localStorage.setItem("comicViewerLastSession", Date.now().toString());
      }
    };

    const sendPing = async (): Promise<void> => {
      const now = Date.now();
      if (now - lastPingTime < PING_THROTTLE) {
        if (process.env.NODE_ENV !== "production") {
          console.log("[KeepAlive] Ping throttled, too recent");
        }
        return;
      }

      try {
        const response = await fetch(`/api/proxy/viewer-alive/${taskId}`, {
          method: "POST",
          keepalive: true,
        });
        
        lastPingTime = now;
        storeCurrentPage();
        logger.info(`KeepAlive ping sent for taskId: ${taskId}`, { status: response.status });
      } catch (error) {
        logger.error(`KeepAlive ping failed for taskId: ${taskId}`, error);
      }
    };

    const onVisibilityChange = (): void => {
      if (document.visibilityState === "visible") {
        if (process.env.NODE_ENV !== "production") {
          console.log("[KeepAlive] Page became visible, sending ping");
        }
        sendPing();
      } else {
        storeCurrentPage();
      }
    };

    const onBeforeUnload = (): void => {
      if (process.env.NODE_ENV !== "production") {
        console.log("[KeepAlive] Page unloading, sending cleanup signal");
      }

      storeCurrentPage();

      if (navigator.sendBeacon) {
        navigator.sendBeacon(`/api/proxy/viewer-cleanup/${taskId}`, new Blob());
      } else {
        fetch(`/api/proxy/viewer-cleanup/${taskId}`, {
          method: "POST",
          keepalive: true,
        }).catch(() => {});
      }
    };

    const interval = setInterval(sendPing, 30000);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", onBeforeUnload);

    sendPing();

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onBeforeUnload);

      storeCurrentPage();
      
      if (process.env.NODE_ENV !== "production") {
        console.log("[KeepAlive] Component unmounting, sending cleanup signal");
      }
      fetch(`/api/proxy/viewer-cleanup/${taskId}`, {
        method: "POST",
        keepalive: true,
      }).catch(() => {});
    };
  }, [taskId, currentIndex]);
}