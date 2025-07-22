interface FilterableItem {
  [key: string]: any;
}

export type MatcherFunction<T = any> = (item: T) => boolean;
export type MatcherFactory = (value: any) => MatcherFunction;

export const createTextMatcher = (searchText: string): MatcherFunction => {
  if (!searchText || typeof searchText !== 'string') {
    return () => true;
  }
  
  const normalizedSearch = searchText.toLowerCase().trim();
  if (!normalizedSearch) {
    return () => true;
  }
  
  return (item: FilterableItem): boolean => {
    if (!item) return false;
    
    const searchableFields = ['title', 'name', 'french_title'];
    return searchableFields.some(field => {
      const value = item[field];
      return value && typeof value === 'string' && 
             value.toLowerCase().includes(normalizedSearch);
    });
  };
};

export const createArrayMatcher = (value: any): MatcherFunction => {
  if (!Array.isArray(value) || value.length === 0) {
    return () => true;
  }
  
  return (item: FilterableItem): boolean => {
    if (!item) return false;
    
    const searchFields = ['writers', 'pencillers', 'categories'];
    
    return searchFields.some(field => {
      const itemValue = item[field];
      if (Array.isArray(itemValue)) {
        return itemValue.some(val => value.includes(val));
      }
      return value.includes(itemValue);
    });
  };
};

export const createRangeMatcher = (
  min?: number | null, 
  max?: number | null, 
  fieldName: string = 'order'
): MatcherFunction => {
  if (min === null && max === null) {
    return () => true;
  }
  
  return (item: FilterableItem): boolean => {
    if (!item) return false;
    
    const value = item[fieldName];
    if (typeof value !== 'number') return false;
    
    if (min !== null && min !== undefined && value < min) return false;
    if (max !== null && max !== undefined && value > max) return false;
    
    return true;
  };
};

export const createBooleanMatcher = (value: any): MatcherFunction => {
  if (typeof value !== 'boolean') {
    return () => true;
  }
  
  return (item: FilterableItem): boolean => {
    if (!item) return false;
    
    if (value === true) {
      return Boolean(item.hasFrenchEdition || item.isTranslated);
    } else {
      return !Boolean(item.hasFrenchEdition || item.isTranslated);
    }
  };
};

export const createCustomMatcher = <T>(
  predicate: (item: T) => boolean
): MatcherFunction<T> => {
  return predicate;
};

export const combineMatchers = (
  matchers: MatcherFunction[], 
  operator: 'AND' | 'OR' = 'AND'
): MatcherFunction => {
  if (matchers.length === 0) {
    return () => true;
  }
  
  if (matchers.length === 1) {
    return matchers[0];
  }
  
  return (item: FilterableItem): boolean => {
    if (operator === 'AND') {
      return matchers.every(matcher => matcher(item));
    } else {
      return matchers.some(matcher => matcher(item));
    }
  };
};

export const applyFilters = <T>(
  items: T[], 
  filters: MatcherFunction<T>[]
): T[] => {
  if (!Array.isArray(items)) {
    return [];
  }
  
  if (filters.length === 0) {
    return items;
  }
  
  const combinedMatcher = combineMatchers(filters, 'AND');
  return items.filter(combinedMatcher);
};