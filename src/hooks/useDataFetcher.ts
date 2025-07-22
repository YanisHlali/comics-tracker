import { useCallback } from 'react';
import { Period, Issue, FrenchEdition, Writer, Penciller, Character, Event } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class APIError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly endpoint?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

const errorHandler = {
  async handleAsync<T>(
    operation: () => Promise<T>,
    fallback: T,
    context?: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logError(error, context);
      return fallback;
    }
  },

  logError(error: unknown, context?: string): void {
    const errorInfo = {
      message: error instanceof Error ? error.message : 'Unknown error',
      context,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.error('[useDataFetcher Error]', errorInfo);
    }
  }
};

const fetchFromAPI = async <T>(endpoint: string): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.debug(`[useDataFetcher] Fetching from: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) {
      throw new APIError(response.status, `HTTP error! status: ${response.status}`, endpoint);
    }
    
    return await response.json();
  } catch (error: any) {
    if (error.name === 'TimeoutError') {
      throw new APIError(408, `Request timeout for ${url}`, endpoint);
    }
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new APIError(0, `Network error: Unable to connect to ${url}`, endpoint);
    }
    throw error;
  }
};

interface DataFetcher {
  readonly periods: {
    getAll: () => Promise<Period[]>;
    getById: (id: string) => Promise<Period | null>;
  };
  readonly creators: {
    getWriters: () => Promise<Writer[]>;
    getPencillers: () => Promise<Penciller[]>;
    getCharacters: () => Promise<Character[]>;
  };
  readonly issues: {
    getByPeriod: (periodId: string) => Promise<Issue[]>;
    getByIds: (periodId: string, issueIds: string[]) => Promise<Issue[]>;
  };
  readonly events: {
    getByPeriod: (periodId: string) => Promise<Event[]>;
    getById: (eventId: string) => Promise<(Event & { period_id: string }) | null>;
  };
  readonly frenchEditions: {
    getByPeriod: (periodId: string) => Promise<FrenchEdition[]>;
    getByIssue: (periodId: string, issueId: string) => Promise<FrenchEdition[]>;
  };
}

export function useDataFetcher(): DataFetcher {
  const getAllPeriods = useCallback(async (): Promise<Period[]> => {
    return errorHandler.handleAsync(
      () => fetchFromAPI<Period[]>('/periods'),
      [],
      'getAllPeriods'
    );
  }, []);

  const getPeriodById = useCallback(async (periodId: string): Promise<Period | null> => {
    return errorHandler.handleAsync(
      async () => {
        const periods = await fetchFromAPI<Period[]>('/periods');
        return periods.find(p => p.id === periodId) || null;
      },
      null,
      `getPeriodById(${periodId})`
    );
  }, []);

  const getWriters = useCallback(async (): Promise<Writer[]> => {
    return errorHandler.handleAsync(
      () => fetchFromAPI<Writer[]>('/creators/writers'),
      [],
      'getWriters'
    );
  }, []);

  const getPencillers = useCallback(async (): Promise<Penciller[]> => {
    return errorHandler.handleAsync(
      () => fetchFromAPI<Penciller[]>('/creators/pencillers'),
      [],
      'getPencillers'
    );
  }, []);

  const getCharacters = useCallback(async (): Promise<Character[]> => {
    return errorHandler.handleAsync(
      () => fetchFromAPI<Character[]>('/creators/characters'),
      [],
      'getCharacters'
    );
  }, []);

  const getIssuesByPeriod = useCallback(async (periodId: string): Promise<Issue[]> => {
    return errorHandler.handleAsync(
      () => fetchFromAPI<Issue[]>(`/issues?periodName=${encodeURIComponent(periodId)}`),
      [],
      `getIssuesByPeriod(${periodId})`
    );
  }, []);

  const getIssuesByIds = useCallback(async (periodId: string, issueIds: string[]): Promise<Issue[]> => {
    return errorHandler.handleAsync(
      async () => {
        const issues = await fetchFromAPI<Issue[]>(`/issues?periodName=${encodeURIComponent(periodId)}`);
        if (!Array.isArray(issues)) return [];
        return issues.filter(issue => issueIds.includes(issue.id));
      },
      [],
      `getIssuesByIds(${periodId}, [${issueIds.length} ids])`
    );
  }, []);

  const getEventsByPeriod = useCallback(async (periodId: string): Promise<Event[]> => {
    return errorHandler.handleAsync(
      () => fetchFromAPI<Event[]>(`/events?periodName=${encodeURIComponent(periodId)}`),
      [],
      `getEventsByPeriod(${periodId})`
    );
  }, []);

  const getEventById = useCallback(async (eventId: string): Promise<(Event & { period_id: string }) | null> => {
    return errorHandler.handleAsync(
      async () => {
        const periods = ['marvel_now', 'ultimate_universe', 'all_new_all_different'] as const;
        
        for (const period of periods) {
          try {
            const events = await fetchFromAPI<Event[]>(`/events?periodName=${encodeURIComponent(period)}`);
            if (Array.isArray(events)) {
              const found = events.find(e => e.id === eventId);
              if (found) return { ...found, period_id: period };
            }
          } catch (error) {
            console.warn(`Error fetching events for period ${period}:`, error);
          }
        }
        
        return null;
      },
      null,
      `getEventById(${eventId})`
    );
  }, []);

  const getFrenchEditionsByPeriod = useCallback(async (periodId: string): Promise<FrenchEdition[]> => {
    return errorHandler.handleAsync(
      () => fetchFromAPI<FrenchEdition[]>(`/french-editions?periodName=${encodeURIComponent(periodId)}`),
      [],
      `getFrenchEditionsByPeriod(${periodId})`
    );
  }, []);

  const getFrenchEditionsByIssue = useCallback(async (periodId: string, issueId: string): Promise<FrenchEdition[]> => {
    return errorHandler.handleAsync(
      async () => {
        const frenchEditions = await fetchFromAPI<FrenchEdition[]>(`/french-editions?periodName=${encodeURIComponent(periodId)}`);
        return frenchEditions.filter(
          (edition) => Array.isArray(edition.issue_ids) && edition.issue_ids.includes(issueId)
        );
      },
      [],
      `getFrenchEditionsByIssue(${periodId}, ${issueId})`
    );
  }, []);

  return {
    periods: {
      getAll: getAllPeriods,
      getById: getPeriodById,
    },
    creators: {
      getWriters,
      getPencillers,
      getCharacters,
    },
    issues: {
      getByPeriod: getIssuesByPeriod,
      getByIds: getIssuesByIds,
    },
    events: {
      getByPeriod: getEventsByPeriod,
      getById: getEventById,
    },
    frenchEditions: {
      getByPeriod: getFrenchEditionsByPeriod,
      getByIssue: getFrenchEditionsByIssue,
    },
  };
}

export default useDataFetcher;