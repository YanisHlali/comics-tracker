import { useState, useEffect, useCallback } from 'react';

export const BREAKPOINTS = {
  mobile: 932,
  tablet: 768,
  desktop: 1024,
  wide: 1280
} as const;

type BreakpointKey = keyof typeof BREAKPOINTS;

interface WindowSize {
  width: number;
  height: number;
}

interface UseResponsiveOptions {
  throttleMs?: number;
  includeColumns?: boolean;
}

interface UseResponsiveReturn {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  
  columns?: number;

  breakpoint: number;
  isBelow: (bp: BreakpointKey | number) => boolean;
  isAbove: (bp: BreakpointKey | number) => boolean;
}

function throttle<T extends any[]>(fn: (...args: T) => void, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: T | null = null;

  return function throttled(...args: T): void {
    if (timeout === null) {
      fn(...args);
      timeout = setTimeout(() => {
        timeout = null;
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, wait);
    } else {
      lastArgs = args;
    }
  };
}

function calculateColumns(width: number): number {
  if (width < 640) return 2;
  if (width < 768) return 3;
  if (width < 1024) return 4;
  return 5;
}

export function useResponsive(options: UseResponsiveOptions = {}): UseResponsiveReturn {
  const { throttleMs = 250, includeColumns = false } = options;
  
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  const [columns, setColumns] = useState<number>(() => 
    includeColumns ? calculateColumns(windowSize.width) : 0
  );

  useEffect(() => {
    const handleResize = throttle(() => {
      const newSize = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      
      setWindowSize(newSize);
      
      if (includeColumns) {
        setColumns(calculateColumns(newSize.width));
      }
    }, throttleMs);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [throttleMs, includeColumns]);

  const { width, height } = windowSize;

  const isMobile = width < BREAKPOINTS.mobile;
  const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
  const isDesktop = width >= BREAKPOINTS.desktop && width < BREAKPOINTS.wide;
  const isWide = width >= BREAKPOINTS.wide;

  const isBelow = useCallback((bp: BreakpointKey | number): boolean => {
    const breakpointValue = typeof bp === 'string' ? BREAKPOINTS[bp] : bp;
    return width < breakpointValue;
  }, [width]);

  const isAbove = useCallback((bp: BreakpointKey | number): boolean => {
    const breakpointValue = typeof bp === 'string' ? BREAKPOINTS[bp] : bp;
    return width >= breakpointValue;
  }, [width]);

  const baseReturn = {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    breakpoint: width,
    isBelow,
    isAbove,
  };

  return includeColumns 
    ? { ...baseReturn, columns }
    : baseReturn;
}

export function useMobileBreakpoint(breakpoint: number = BREAKPOINTS.mobile): boolean {
  const { width } = useResponsive();
  return width < breakpoint;
}

export function useResponsiveColumns(): { columns: number; isMobile: boolean } {
  const { columns, isMobile } = useResponsive({ includeColumns: true });
  return { columns: columns!, isMobile };
}

export function useResponsiveBreakpoint(
  throttleMs: number = 250
): UseResponsiveReturn {
  return useResponsive({ throttleMs });
}

export default useResponsive;
