import { useCallback, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';

export type CacheType = 'frenchEditions' | 'issues' | 'events';

export type CacheData = any;

interface CacheHelpers {
  get: (periodId: string) => CacheData | undefined;
  set: (periodId: string, data: CacheData) => void;
  has: (periodId: string) => boolean;
}

export interface UseClientCacheReturn {
  set: (type: CacheType, key: string, data: CacheData) => void;
  get: (type: CacheType, key: string) => CacheData | undefined;
  has: (type: CacheType, key: string) => boolean;
  remove: (type: CacheType, key: string) => void;
  clear: () => void;
  frenchEditions: CacheHelpers;
  issues: CacheHelpers;
  events: CacheHelpers;
}

export default function useClientCache(): UseClientCacheReturn {
  const { getCacheData, setCacheData, clearCache } = useAppContext();

  const set = useCallback((
    type: CacheType, 
    key: string, 
    data: CacheData
  ): void => {
    setCacheData(type, key, data);
  }, [setCacheData]);

  const get = useCallback((
    type: CacheType, 
    key: string
  ): CacheData | undefined => {
    return getCacheData(type, key);
  }, [getCacheData]);

  const has = useCallback((
    type: CacheType, 
    key: string
  ): boolean => {
    return getCacheData(type, key) !== undefined;
  }, [getCacheData]);

  const remove = useCallback((
    type: CacheType, 
    key: string
  ): void => {
    setCacheData(type, key, undefined);
  }, [setCacheData]);

  const clear = useCallback((): void => {
    clearCache();
  }, [clearCache]);

  const cacheHelpers = useMemo(() => ({
    frenchEditions: {
      get: (periodId: string) => get('frenchEditions', periodId),
      set: (periodId: string, data: CacheData) => set('frenchEditions', periodId, data),
      has: (periodId: string) => has('frenchEditions', periodId),
    },
    issues: {
      get: (periodId: string) => get('issues', periodId),
      set: (periodId: string, data: CacheData) => set('issues', periodId, data),
      has: (periodId: string) => has('issues', periodId),
    },
    events: {
      get: (periodId: string) => get('events', periodId),
      set: (periodId: string, data: CacheData) => set('events', periodId, data),
      has: (periodId: string) => has('events', periodId),
    },
  }), [get, set, has]);

  return {
    set,
    get,
    has,
    remove,
    clear,
    ...cacheHelpers,
  };
}