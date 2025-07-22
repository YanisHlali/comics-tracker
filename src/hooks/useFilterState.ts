import { useState } from 'react';
import { getActiveFiltersCount } from '@/utils/issues';

interface Filters {
  showFilters?: boolean;
  [key: string]: any;
}

interface UseFilterStateReturn {
  showFilters: boolean;
  activeFiltersCount: number;
  handleToggleFilters: (setFilter: (key: string, value: any) => void) => void;
}

export default function useFilterState(initialFilters: Filters): UseFilterStateReturn {
    const [showFilters, setShowFilters] = useState<boolean>(initialFilters.showFilters || false);

    const activeFiltersCount = getActiveFiltersCount(initialFilters);

    const handleToggleFilters = (setFilter: (key: string, value: any) => void): void => {
        const newState = !showFilters;
        setShowFilters(newState);
        setFilter('showFilters', newState);
    };

    return {
        showFilters,
        activeFiltersCount,
        handleToggleFilters
    };
}