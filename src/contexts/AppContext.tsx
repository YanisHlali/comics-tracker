import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createFrenchEditionsMap } from '@/utils/issues';
import { FrenchEdition } from '@/types';

type CacheType = 'frenchEditions' | 'issues' | 'events';

interface FilterValues {
  searchTitle: string;
  searchWriter: string;
  searchPenciller: string;
  minReadingNumber: number | null;
  maxReadingNumber: number | null;
  onlyWithoutFrenchEdition: boolean;
  frenchEditionStyle: string;
  showFilters: boolean;
}

interface AppContextValue {
  displayMode: string;
  setDisplayMode: (mode: string) => void;
  
  getFrenchEditionsMap: (periodId: string) => Record<string, boolean>;
  setFrenchEditions: (periodId: string, frenchEditions: FrenchEdition[]) => void;

  getPageFilters: (pageKey: string) => FilterValues;
  setFilter: (pageKey: string, key: string, value: any) => void;
  resetFilters: (pageKey: string) => void;
  setPageFilters: (pageKey: string, filters: Partial<FilterValues>) => void;
  clearPageFilters: (pageKey: string) => void;
  
  getCacheData: (type: CacheType, key: string) => any;
  setCacheData: (type: CacheType, key: string, data: any) => void;
  clearCache: () => void;
}

interface AppProviderProps {
  children: ReactNode;
}

const getDefaultFilters = (): FilterValues => ({
  searchTitle: '',
  searchWriter: '',
  searchPenciller: '',
  minReadingNumber: null,
  maxReadingNumber: null,
  onlyWithoutFrenchEdition: false,
  frenchEditionStyle: 'color',
  showFilters: false,
});

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: AppProviderProps): React.ReactElement {
  const [displayMode, setDisplayMode] = useState('image');
  const [frenchEditionsMaps, setFrenchEditionsMaps] = useState<Record<string, Record<string, boolean>>>({});
  const [pageFilters, setPageFilters] = useState<Record<string, FilterValues>>({});
  const [cache, setCache] = useState<Record<CacheType, Record<string, any>>>({
    frenchEditions: {},
    issues: {},
    events: {},
  });

  const handleSetFrenchEditions = useCallback((periodId: string, frenchEditions: FrenchEdition[]) => {
    setFrenchEditionsMaps(prev => ({
      ...prev,
      [periodId]: createFrenchEditionsMap(frenchEditions)
    }));
  }, []);

  const getFrenchEditionsMap = useCallback((periodId: string): Record<string, boolean> => {
    return frenchEditionsMaps[periodId] || {};
  }, [frenchEditionsMaps]);

  const getPageFilters = useCallback((pageKey: string): FilterValues => {
    return pageFilters[pageKey] || getDefaultFilters();
  }, [pageFilters]);

  const setFilter = useCallback((pageKey: string, key: string, value: any) => {
    setPageFilters(prev => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        [key]: value
      }
    }));
  }, []);

  const resetFilters = useCallback((pageKey: string) => {
    setPageFilters(prev => ({
      ...prev,
      [pageKey]: {
        ...getDefaultFilters(),
        frenchEditionStyle: prev[pageKey]?.frenchEditionStyle || 'color'
      }
    }));
  }, []);

  const handleSetPageFilters = useCallback((pageKey: string, filters: Partial<FilterValues>) => {
    setPageFilters(prev => ({
      ...prev,
      [pageKey]: {
        ...getDefaultFilters(),
        ...filters
      }
    }));
  }, []);

  const clearPageFilters = useCallback((pageKey: string) => {
    setPageFilters(prev => {
      const { [pageKey]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const getCacheData = useCallback((type: CacheType, key: string) => {
    return cache[type]?.[key];
  }, [cache]);

  const setCacheData = useCallback((type: CacheType, key: string, data: any) => {
    setCache(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: data
      }
    }));
  }, []);

  const clearCache = useCallback(() => {
    setCache({
      frenchEditions: {},
      issues: {},
      events: {},
    });
  }, []);

  const contextValue: AppContextValue = {
    displayMode,
    setDisplayMode,
    getFrenchEditionsMap,
    setFrenchEditions: handleSetFrenchEditions,
    getPageFilters,
    setFilter,
    resetFilters,
    setPageFilters: handleSetPageFilters,
    clearPageFilters,
    getCacheData,
    setCacheData,
    clearCache,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export default AppContext;