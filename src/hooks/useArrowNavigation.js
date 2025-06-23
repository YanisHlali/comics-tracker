import { useEffect } from "react";

export default function useArrowNavigation(onLeft, onRight) {
  useEffect(() => {
    const handleKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "ArrowLeft") onLeft?.();
      else if (e.key === "ArrowRight") onRight?.();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onLeft, onRight]);
}
