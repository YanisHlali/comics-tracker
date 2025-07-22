import { useEffect, useRef } from "react";

const DEFAULT_POLL_INTERVAL = 1000;
const DEFAULT_POLL_TIMEOUT = 60_000;

const BASE_URL = "https://yanis-mail.fr";

interface PollingTaskData {
  status: 'error' | 'done' | 'pending' | 'processing';
  error?: string;
  progress?: number;
  message?: string;
  images?: string[];
  table_content?: number[];
  labels?: string[];
  [key: string]: any;
}

interface UsePollingTaskOptions {
  onError?: (message: string) => void;
  onDone?: (data: PollingTaskData) => void;
  onUpdate?: (data: PollingTaskData) => void;
  onClear?: () => void;
  pollInterval?: number;
  pollTimeout?: number;
}

export default function usePollingTask(
  taskId: string | null,
  {
    onError,
    onDone,
    onUpdate,
    onClear,
    pollInterval = DEFAULT_POLL_INTERVAL,
    pollTimeout = DEFAULT_POLL_TIMEOUT,
  }: UsePollingTaskOptions
): void {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!taskId) return;

    let expired = false;

    const poll = async (): Promise<void> => {
      if (abortRef.current) abortRef.current.abort();
      const abortController = new AbortController();
      abortRef.current = abortController;

      try {
        const res = await fetch(`${BASE_URL}/progress/${taskId}`, {
          signal: abortController.signal,
        });
        const data: PollingTaskData = await res.json();

        if (expired) return;
        if (data.status === "error") {
          onError?.(data.error || "Erreur");
          onClear?.();
        } else if (data.status === "done") {
          onDone?.(data);
          onClear?.();
        } else {
          onUpdate?.(data);
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        onError?.("Erreur de suivi de progression");
        onClear?.();
      }
    };

    poll();
    intervalRef.current = setInterval(poll, pollInterval);

    timeoutRef.current = setTimeout(() => {
      expired = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      abortRef.current?.abort();
      onError?.("Le suivi de progression a expiré.");
      onClear?.();
    }, pollTimeout);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      abortRef.current?.abort();
    };
  }, [taskId, onError, onDone, onUpdate, onClear, pollInterval, pollTimeout]);
}