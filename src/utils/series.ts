import { Issue } from '@/types';

interface SerieInfo {
  title: string;
  year: number;
  prefix: string;
}

interface SerieData {
  id: string;
  title: string;
  year: number;
  image: string;
  issueCount: number;
  issues: Issue[];
}

export const getSeriePrefix = (serieId: string): string => {
  if (!serieId || typeof serieId !== 'string') {
    return '';
  }

  const match = serieId.match(/^(.+)_\d+(?:\.\d+)?$/);
  return match ? match[1] : serieId;
};

export const parseSerieInfo = (issues: Issue[]): SerieInfo | null => {
  if (!Array.isArray(issues) || issues.length === 0) {
    return null;
  }
  
  const firstIssue = issues[0];
  if (!firstIssue || !firstIssue.title) {
    return null;
  }
  
  try {
    const match = firstIssue.title.match(/^(.*?)\s*\((\d{4})\)/);
    
    if (match) {
      const [, title, yearStr] = match;
      const year = parseInt(yearStr, 10);
      const prefix = getSeriePrefix(firstIssue.id);
      
      return {
        title: title.trim(),
        year: year,
        prefix: prefix
      };
    }
    
    return {
      title: firstIssue.title,
      year: new Date().getFullYear(),
      prefix: getSeriePrefix(firstIssue.id)
    };
  } catch (error) {
    console.error('Error parsing serie info:', error);
    return null;
  }
};

export const parseSeriesFromIssues = (issues: Issue[]): SerieData[] => {
  if (!Array.isArray(issues)) {
    return [];
  }
  
  const seriesMap = new Map<string, Issue[]>();
  
  issues.forEach(issue => {
    if (!issue || !issue.id) return;
    
    const prefix = getSeriePrefix(issue.id);
    if (!seriesMap.has(prefix)) {
      seriesMap.set(prefix, []);
    }
    seriesMap.get(prefix)!.push(issue);
  });
  
  const series: SerieData[] = [];
  
  seriesMap.forEach((serieIssues, prefix) => {
    if (serieIssues.length === 0) return;
    
    const sortedIssues = serieIssues.sort((a, b) => (a.order || 0) - (b.order || 0));
    const serieInfo = parseSerieInfo(sortedIssues);
    
    if (serieInfo) {
      const serieData: SerieData = {
        id: prefix,
        title: serieInfo.title,
        year: serieInfo.year,
        image: sortedIssues[0]?.image || '',
        issueCount: sortedIssues.length,
        issues: sortedIssues
      };
      
      series.push(serieData);
    }
  });
  
  return series.sort((a, b) => a.title.localeCompare(b.title));
};

export const filterSeries = (
  series: SerieData[],
  filters: {
    searchQuery?: string;
    sortBy?: 'title' | 'year' | 'issueCount';
    sortDirection?: 'asc' | 'desc';
    minYear?: number;
    maxYear?: number;
  }
): SerieData[] => {
  if (!Array.isArray(series)) {
    return [];
  }
  
  let filtered = [...series];
  
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(serie => 
        serie.title.toLowerCase().includes(query)
      );
    }
  }
  
  if (filters.minYear !== undefined) {
    filtered = filtered.filter(serie => serie.year >= filters.minYear!);
  }
  
  if (filters.maxYear !== undefined) {
    filtered = filtered.filter(serie => serie.year <= filters.maxYear!);
  }
  
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'year':
          comparison = a.year - b.year;
          break;
        case 'issueCount':
          comparison = a.issueCount - b.issueCount;
          break;
        default:
          comparison = 0;
      }
      
      return filters.sortDirection === 'desc' ? -comparison : comparison;
    });
  }
  
  return filtered;
};

export const getSerieById = (series: SerieData[], serieId: string): SerieData | null => {
  if (!Array.isArray(series) || !serieId) {
    return null;
  }
  
  return series.find(serie => serie.id === serieId) || null;
};

export const getSeriesByYear = (series: SerieData[], year: number): SerieData[] => {
  if (!Array.isArray(series) || typeof year !== 'number') {
    return [];
  }
  
  return series.filter(serie => serie.year === year);
};

export const getSeriesStats = (series: SerieData[]): {
  totalSeries: number;
  totalIssues: number;
  yearRange: { min: number; max: number } | null;
  averageIssuesPerSerie: number;
} => {
  if (!Array.isArray(series) || series.length === 0) {
    return {
      totalSeries: 0,
      totalIssues: 0,
      yearRange: null,
      averageIssuesPerSerie: 0
    };
  }
  
  const totalIssues = series.reduce((sum, serie) => sum + serie.issueCount, 0);
  const years = series.map(serie => serie.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  
  return {
    totalSeries: series.length,
    totalIssues: totalIssues,
    yearRange: { min: minYear, max: maxYear },
    averageIssuesPerSerie: Math.round(totalIssues / series.length * 100) / 100
  };
};