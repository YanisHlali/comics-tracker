import usePersistedState from "@/hooks/usePersistedState";
import { useCallback } from "react";

export default function useDisplayMode(key = "displayMode") {
  const [displayMode, setDisplayMode] = usePersistedState(key, "image");

  const toggleDisplayMode = useCallback(() => {
    setDisplayMode((prev) => (prev === "text" ? "image" : "text"));
  }, [setDisplayMode]);

  return { displayMode, toggleDisplayMode };
}
