import { useState, useCallback } from 'react';

export type DisplayMode = 'grid' | 'text';

interface UseDisplayModeReturn {
  displayMode: DisplayMode;
  toggleDisplayMode: () => void;
  setDisplayMode: (mode: DisplayMode) => void;
}

export default function useDisplayMode(initialMode: DisplayMode = 'grid'): UseDisplayModeReturn {
  const [displayMode, setDisplayMode] = useState<DisplayMode>(initialMode);

  const toggleDisplayMode = useCallback((): void => {
    setDisplayMode(prev => prev === 'grid' ? 'text' : 'grid');
  }, []);

  const setDisplayModeCallback = useCallback((mode: DisplayMode): void => {
    setDisplayMode(mode);
  }, []);

  return {
    displayMode,
    toggleDisplayMode,
    setDisplayMode: setDisplayModeCallback,
  };
}