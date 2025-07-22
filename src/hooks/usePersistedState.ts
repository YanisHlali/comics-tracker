import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';

export default function usePersistedState<T>(
  key: string, 
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return initialValue;
      return JSON.parse(stored);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[usePersistedState] Erreur lecture localStorage pour "${key}" :`, err);
      }
      return initialValue;
    }
  });

  const prevKey = useRef<string>(key);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (prevKey.current !== key) {
      try {
        localStorage.removeItem(prevKey.current);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[usePersistedState] Erreur removeItem "${prevKey.current}" :`, err);
        }
      }
      prevKey.current = key;
    }

    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[usePersistedState] Erreur écriture localStorage pour "${key}" :`, err);
      }
    }
  }, [key, state]);

  return [state, setState];
}