import { Issue, FrenchEdition, Writer, Penciller } from '@/types';

interface ParsedComicTitle {
  title: string;
  year: string | null;
  number: string | null;
  titleSerie: string;
}

interface EnrichedIssue extends Issue {
  period_id: string;
  writers: string[];
  pencillers: string[];
}

export const parseComicTitle = (title: string, issueId: string): ParsedComicTitle | null => {
  if (!title || !issueId) return null;
  
  try {
    const match = title.match(/^(.*?)\s*\((\d{4})\)\s*(?:#(\d+(?:\.\d+)?))?/);
    
    if (match) {
      const [, titlePart, year, number] = match;
      const cleanTitle = titlePart.trim();
      
      const titleSerie = issueId.replace(/_\d+(?:\.\d+)?$/, '');
      
      return {
        title: cleanTitle,
        year: year || null,
        number: number || null,
        titleSerie: titleSerie
      };
    }
    
    return {
      title: title,
      year: null,
      number: null,
      titleSerie: issueId.replace(/_\d+(?:\.\d+)?$/, '')
    };
  } catch (error) {
    console.error('Error parsing comic title:', error);
    return null;
  }
};

export const enrichComicData = (
  comic: Issue,
  writers: Writer[],
  pencillers: Penciller[],
  periodId: string
): EnrichedIssue => {
  const enrichedWriters = (comic.writers || []).map(writerId => {
    const writer = writers.find(w => w.id === writerId);
    return writer ? writer.name : writerId;
  });
  
  const enrichedPencillers = (comic.pencillers || []).map(pencillerId => {
    const penciller = pencillers.find(p => p.id === pencillerId);
    return penciller ? penciller.name : pencillerId;
  });
  
  return {
    ...comic,
    period_id: periodId,
    writers: enrichedWriters,
    pencillers: enrichedPencillers
  };
};

export const createFrenchEditionsMap = (frenchEditions: FrenchEdition[]): Record<string, boolean> => {
  if (!Array.isArray(frenchEditions)) {
    return {};
  }
  
  const map: Record<string, boolean> = {};
  
  frenchEditions.forEach(edition => {
    if (edition.issue_ids && Array.isArray(edition.issue_ids)) {
      edition.issue_ids.forEach(issueId => {
        if (typeof issueId === 'string') {
          map[issueId] = true;
        }
      });
    }
  });
  
  return map;
};

export const filterIssues = (
  issues: Issue[],
  filters: {
    searchQuery?: string;
    writer?: string;
    penciller?: string;
    onlyTranslated?: boolean;
    onlyUntranslated?: boolean;
    minOrder?: number;
    maxOrder?: number;
  },
  frenchEditionsMap: Record<string, boolean> = {}
): Issue[] => {
  if (!Array.isArray(issues)) {
    return [];
  }
  
  return issues.filter(issue => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = issue.title?.toLowerCase().includes(query);
      const matchesWriters = issue.writers?.some(writer => 
        writer.toLowerCase().includes(query)
      );
      const matchesPencillers = issue.pencillers?.some(penciller => 
        penciller.toLowerCase().includes(query)
      );
      
      if (!matchesTitle && !matchesWriters && !matchesPencillers) {
        return false;
      }
    }

    if (filters.writer && issue.writers) {
      if (!issue.writers.includes(filters.writer)) {
        return false;
      }
    }
    

    if (filters.penciller && issue.pencillers) {
      if (!issue.pencillers.includes(filters.penciller)) {
        return false;
      }
    }

    if (filters.minOrder !== undefined && issue.order < filters.minOrder) {
      return false;
    }
    
    if (filters.maxOrder !== undefined && issue.order > filters.maxOrder) {
      return false;
    }
    
    const isTranslated = Boolean(frenchEditionsMap[issue.id]);
    
    if (filters.onlyTranslated && !isTranslated) {
      return false;
    }
    
    if (filters.onlyUntranslated && isTranslated) {
      return false;
    }
    
    return true;
  });
};

export const sortIssues = (
  issues: Issue[],
  sortBy: 'order' | 'title' | 'date' = 'order',
  direction: 'asc' | 'desc' = 'asc'
): Issue[] => {
  if (!Array.isArray(issues)) {
    return [];
  }
  
  const sorted = [...issues].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'order':
        comparison = (a.order || 0) - (b.order || 0);
        break;
      case 'title':
        comparison = (a.title || '').localeCompare(b.title || '');
        break;
      case 'date':
        comparison = (a.order || 0) - (b.order || 0);
        break;
      default:
        comparison = 0;
    }
    
    return direction === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
};

export const createTextSearchFilter = (searchText: string) => {
  if (!searchText || typeof searchText !== 'string') {
    return () => true;
  }
  
  const normalizedSearch = searchText.toLowerCase().trim();
  if (!normalizedSearch) {
    return () => true;
  }
  
  return (item: any): boolean => {
    if (!item) return false;
    
    const searchableFields = ['title', 'name', 'french_title'];
    return searchableFields.some(field => {
      const value = item[field];
      return value && typeof value === 'string' && 
             value.toLowerCase().includes(normalizedSearch);
    });
  };
};

export const getActiveFiltersCount = (filters: Record<string, any>): number => {
  if (!filters || typeof filters !== 'object') {
    return 0;
  }
  
  let count = 0;

  const defaultValues = {
    frenchEditionStyle: 'color',
    showFilters: false,
  };

  const excludedKeys = ['showFilters'];
  
  Object.entries(filters).forEach(([key, value]) => {
    if (excludedKeys.includes(key)) {
      return;
    }

    if (value === null || value === undefined || value === '') {
      return;
    }
    
    if (Array.isArray(value) && value.length === 0) {
      return;
    }
    
    if (typeof value === 'boolean' && !value) {
      return;
    }

    if (typeof value === 'string' && value.trim() === '') {
      return;
    }
    
    if (defaultValues[key as keyof typeof defaultValues] === value) {
      return;
    }
    
    count++;
  });
  
  return count;
};