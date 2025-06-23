import { useEffect, useRef } from "react";

export default function usePollingTask(taskId, {
  onError,
  onDone,
  onUpdate,
  onClear,
}) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!taskId) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/proxy/progress/${taskId}`);
        const data = await res.json();

        if (data.status === "error") {
          onError?.(data.error || "Erreur");
          onClear?.();
        } else if (data.status === "done") {
          onDone?.(data);
          onClear?.();
        } else {
          onUpdate?.(data);
        }
      } catch {
        onError?.("Erreur de suivi de progression");
        onClear?.();
      }
    };

    intervalRef.current = setInterval(poll, 500);

    return () => clearInterval(intervalRef.current);
  }, [taskId, onError, onDone, onUpdate, onClear]);
}
