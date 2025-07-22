'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import {
  createTextMatcher,
  createArrayMatcher,
  createRangeMatcher,
  createBooleanMatcher,
} from '@/utils/filters';

export interface FilterValues {
  searchTitle: string;
  searchWriter: string;
  searchPenciller: string;
  minReadingNumber: number | null;
  maxReadingNumber: number | null;
  onlyWithoutFrenchEdition: boolean;
  frenchEditionStyle: string;
  showFilters: boolean;
  [key: string]: any;
}

export interface FilterableItem {
  title?: string;
  writers?: string[];
  pencillers?: string[];
  order?: number;
  hasFrenchEdition?: boolean;
  [key: string]: any;
}

export type MatcherFunction<T = any> = (item: T) => boolean;
export type MatcherFactory = (value: any) => MatcherFunction;

export interface MatcherMap {
  [key: string]: MatcherFactory;
}

export interface FilterStats {
  total: number;
  filtered: number;
  hidden: number;
  activeFiltersCount: number;
}

interface UseFiltersOptions {
  pageKey?: string;
  enableAdvanced?: boolean;
  enableUnified?: boolean;
  enableAutoCleanup?: boolean;
  items?: FilterableItem[];
  debounceMs?: number;
  enableHighlight?: boolean;
  customMatchers?: MatcherMap;
}

interface UseFiltersReturn {
  filters: FilterValues;
  updateFilter: (key: string, value: any) => void;
  updateFilters: (newFilters: Partial<FilterValues>) => void;
  resetAllFilters: () => void;
  pageKey: string;
  
  filteredItems?: FilterableItem[];
  stats?: FilterStats;
  clearCache?: () => void;
  getFilterSuggestions?: (filterKey: string, query: string) => string[];
  getHighlightedText?: (text: string, searchTerm: string) => string;
  isFiltering?: boolean;
  filtersChanged?: boolean;
  cacheSize?: number;
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

export function useFilters(options?: UseFiltersOptions): UseFiltersReturn;
export function useFilters(pageKeyOrOptions?: string | UseFiltersOptions): UseFiltersReturn {
  const resolvedOptions = typeof pageKeyOrOptions === 'string' 
    ? { pageKey: pageKeyOrOptions }
    : pageKeyOrOptions || {};

  const {
    pageKey: explicitPageKey,
    enableAdvanced = false,
    enableUnified = false,
    enableAutoCleanup = false,
    items = [],
    debounceMs = 300,
    enableHighlight = false,
    customMatchers = {},
  } = resolvedOptions;

  const router = useRouter();
  const pathname = usePathname();
  const { getPageFilters, setFilter, resetFilters } = useAppContext();
  
  const pageKey = explicitPageKey || (enableUnified ? pathname : 'default');
  
  const filters = getPageFilters(pageKey) || getDefaultFilters();

  const filterCacheRef = useRef<Map<string, FilterableItem[]>>(new Map());
  const lastFiltersRef = useRef<FilterValues>({} as FilterValues);

  const updateFilter = useCallback((key: string, value: any): void => {
    setFilter(pageKey, key, value);
  }, [setFilter, pageKey]);

  const resetAllFilters = useCallback((): void => {
    resetFilters(pageKey);
  }, [resetFilters, pageKey]);

  const updateFilters = useCallback((newFilters: Partial<FilterValues>): void => {
    Object.entries(newFilters).forEach(([key, value]) => {
      setFilter(pageKey, key, value);
    });
  }, [setFilter, pageKey]);

  const matchers = useMemo<MatcherMap>(
    () => ({
      title: (value: any) => createTextMatcher(value),
      searchTitle: (value: any) => createTextMatcher(value),
      writers: (value: any) => createArrayMatcher(value),
      searchWriter: (value: any) => createArrayMatcher(value),
      pencillers: (value: any) => createArrayMatcher(value),
      searchPenciller: (value: any) => createArrayMatcher(value),
      order: (value: any) => createRangeMatcher(value, undefined),
      minReadingNumber: (min: number) => createRangeMatcher(min, null),
      maxReadingNumber: (max: number) => createRangeMatcher(null, max),
      onlyWithoutFrenchEdition: (value: any) => createBooleanMatcher(value),
      onlyTranslated: (value: any) => createBooleanMatcher(value),
      ...customMatchers,
    }),
    [customMatchers]
  );

  const getCacheKey = useCallback((filterObj: FilterValues): string => {
    return JSON.stringify(filterObj, Object.keys(filterObj).sort());
  }, []);

  const filtersChanged = useMemo((): boolean => {
    if (!enableAdvanced) return false;
    
    const current = getCacheKey(filters);
    const previous = getCacheKey(lastFiltersRef.current);
    lastFiltersRef.current = filters;
    return current !== previous;
  }, [filters, getCacheKey, enableAdvanced]);

  const performFiltering = useCallback(
    (itemsToFilter: FilterableItem[], currentFilters: FilterValues): FilterableItem[] => {
      const cacheKey = getCacheKey(currentFilters);

      if (filterCacheRef.current.has(cacheKey)) {
        const cached = filterCacheRef.current.get(cacheKey)!;
        return cached;
      }

      const excludedKeys = ["showFilters", "frenchEditionStyle"];

      const activeFilters = Object.entries(currentFilters).filter(
        ([key, value]) => {
          if (excludedKeys.includes(key)) return false;
          if (value === null || value === undefined || value === "") return false;
          if (typeof value === "boolean") return value === true;
          return true;
        }
      );

      if (activeFilters.length === 0) {
        filterCacheRef.current.set(cacheKey, itemsToFilter);
        return itemsToFilter;
      }

      const filtered = itemsToFilter.filter((item: FilterableItem) => {
        return activeFilters.every(([filterKey, filterValue]) => {
          const matcherFactory = matchers[filterKey];
          if (!matcherFactory) return true;

          const matcher = matcherFactory(filterValue);
          
          switch (filterKey) {
            case "searchTitle":
            case "searchWriter":
            case "searchPenciller":
            case "minReadingNumber":
            case "maxReadingNumber":
              return matcher(item);
            case "onlyWithoutFrenchEdition":
              return matcher(!item.hasFrenchEdition);
            case "onlyTranslated":
              return matcher(item.hasFrenchEdition);
            default:
              return matcher(item[filterKey] || item);
          }
        });
      });

      filterCacheRef.current.set(cacheKey, filtered);

      if (filterCacheRef.current.size > 50) {
        const firstKey = filterCacheRef.current.keys().next().value;
        if (firstKey) {
          filterCacheRef.current.delete(firstKey);
        }
      }

      return filtered;
    },
    [matchers, getCacheKey]
  );

  const filteredItems = useMemo((): FilterableItem[] | undefined => {
    if (!enableAdvanced || !Array.isArray(items)) return undefined;
    return performFiltering(items, filters);
  }, [items, filters, performFiltering, enableAdvanced]);

  const stats = useMemo(
    (): FilterStats | undefined => {
      if (!enableAdvanced) return undefined;
      
      return {
        total: items?.length || 0,
        filtered: filteredItems?.length || 0,
        hidden: (items?.length || 0) - (filteredItems?.length || 0),
        activeFiltersCount: Object.values(filters).filter(
          (v) => v !== null && v !== undefined && v !== "" && v !== false
        ).length,
      };
    },
    [items, filteredItems, filters, enableAdvanced]
  );

  const clearCache = useCallback((): void => {
    if (!enableAdvanced) return;
    filterCacheRef.current.clear();
  }, [enableAdvanced]);

  const getFilterSuggestions = useCallback(
    (filterKey: string, query: string): string[] => {
      if (!enableAdvanced || !items || !Array.isArray(items)) return [];

      const suggestions = new Set<string>();
      const queryLower = query.toLowerCase();

      items.forEach((item: FilterableItem) => {
        const fieldValue = item[filterKey];
        const values = Array.isArray(fieldValue) ? fieldValue : [fieldValue];

        values.forEach((value: any) => {
          if (
            value &&
            typeof value === "string" &&
            value.toLowerCase().includes(queryLower)
          ) {
            suggestions.add(value);
          }
        });
      });

      return Array.from(suggestions).slice(0, 10);
    },
    [items, enableAdvanced]
  );

  const getHighlightedText = useCallback(
    (text: string, searchTerm: string): string => {
      if (!enableAdvanced || !enableHighlight || !searchTerm || !text) return text;

      const regex = new RegExp(`(${searchTerm})`, "gi");
      return text.replace(regex, "<mark>$1</mark>");
    },
    [enableHighlight, enableAdvanced]
  );

  useEffect(() => {
    if (!enableAutoCleanup) return;
    
    return () => {
      resetFilters(pageKey);
    };
  }, [pageKey, resetFilters, enableAutoCleanup]);

  useEffect(() => {
    if (enableAdvanced) {
      clearCache();
    }
  }, [items?.length, clearCache, enableAdvanced]);

  const baseReturn: UseFiltersReturn = {
    filters,
    updateFilter,
    updateFilters,
    resetAllFilters,
    pageKey,
  };

  if (enableAdvanced) {
    return {
      ...baseReturn,
      filteredItems,
      stats,
      clearCache,
      getFilterSuggestions,
      getHighlightedText,
      isFiltering: (filteredItems?.length || 0) !== (items?.length || 0),
      filtersChanged,
      cacheSize: filterCacheRef.current.size,
    };
  }

  return baseReturn;
}

export default useFilters;