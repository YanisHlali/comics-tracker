import { useEffect, useRef } from "react";

type NavigationHandler = () => void;

interface PressedKeys {
  [key: string]: boolean;
}

export default function useArrowNavigation(
  onLeft?: NavigationHandler, 
  onRight?: NavigationHandler
): void {
  const pressedRef = useRef<PressedKeys>({});

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      const activeElement = document.activeElement;
      const tag = activeElement?.tagName;
      
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      
      if (e.repeat) return;

      if (e.key === "ArrowLeft" && !pressedRef.current["ArrowLeft"]) {
        onLeft?.();
        pressedRef.current["ArrowLeft"] = true;
      }
      
      if (e.key === "ArrowRight" && !pressedRef.current["ArrowRight"]) {
        onRight?.();
        pressedRef.current["ArrowRight"] = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent): void => {
      if (e.key === "ArrowLeft") {
        pressedRef.current["ArrowLeft"] = false;
      }
      if (e.key === "ArrowRight") {
        pressedRef.current["ArrowRight"] = false;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [onLeft, onRight]);
}