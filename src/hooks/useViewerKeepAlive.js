import { useEffect } from "react";

export default function useViewerKeepAlive(taskId) {
  useEffect(() => {
    if (!taskId) return;

    const sendPing = () => {
      fetch(`/api/proxy/viewer-alive/${taskId}`, {
        method: "POST",
        keepalive: true,
      }).catch(() => {});
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") sendPing();
    };

    const interval = setInterval(sendPing, 5000);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", sendPing);
    sendPing();

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", sendPing);
      sendPing();
    };
  }, [taskId]);
}
