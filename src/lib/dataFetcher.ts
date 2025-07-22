import { withDataFetching, AppError, ERROR_TYPES } from "./errorHandler";
import { 
  Period, 
  Issue, 
  FrenchEdition, 
  Writer, 
  Penciller, 
  Character, 
  Event,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface DataCache {
  [key: string]: any;
}

const _cache: DataCache = {};

async function fetchFromRemoteAPI<T = any>(endpoint: string): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  if (_cache[url]) {
    return _cache[url] as T;
  }
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new AppError(
        `HTTP error! status: ${response.status}`, 
        ERROR_TYPES.UNKNOWN_ERROR
      );
    }
    
    const data = await response.json();
    
    _cache[url] = data;
    
    return data as T;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new AppError(
        `Network error: Unable to connect to API at ${url}`, 
        ERROR_TYPES.UNKNOWN_ERROR, 
        error
      );
    }
    throw new AppError(
      `Failed to fetch from API: ${url}`, 
      ERROR_TYPES.UNKNOWN_ERROR, 
      error
    );
  }
}

const _fetchPeriods = async (): Promise<Period[]> => {
  return await fetchFromRemoteAPI<Period[]>('/periods');
};

const _fetchPeriodById = async (periodId: string): Promise<Period> => {
  const periods = await _fetchPeriods();
  const period = periods.find((period) => period.id === periodId);
  
  if (!period) {
    throw new AppError(`Period not found: ${periodId}`, ERROR_TYPES.FILE_NOT_FOUND);
  }
  return period;
};

const _fetchWriters = async (): Promise<Writer[]> => {
  return await fetchFromRemoteAPI<Writer[]>('/creators/writers');
};

const _fetchPencillers = async (): Promise<Penciller[]> => {
  return await fetchFromRemoteAPI<Penciller[]>('/creators/pencillers');
};

const _fetchCharacters = async (): Promise<Character[]> => {
  return await fetchFromRemoteAPI<Character[]>('/creators/characters');
};

const _fetchIssuesByPeriod = async (periodName: string): Promise<Issue[]> => {
  return await fetchFromRemoteAPI<Issue[]>(`/issues?periodName=${encodeURIComponent(periodName)}`);
};

const _fetchEventsByPeriod = async (periodName: string): Promise<Event[]> => {
  return await fetchFromRemoteAPI<Event[]>(`/events?periodName=${encodeURIComponent(periodName)}`);
};

const _fetchFrenchEditionsByPeriod = async (periodName: string): Promise<FrenchEdition[]> => {
  return await fetchFromRemoteAPI<FrenchEdition[]>(`/french-editions?periodName=${encodeURIComponent(periodName)}`);
};

const _fetchFrenchEditionsByIssue = async (
  periodName: string, 
  issueId: string
): Promise<FrenchEdition[]> => {
  const frenchEditions = await _fetchFrenchEditionsByPeriod(periodName);
  return frenchEditions.filter(
    (edition) =>
      Array.isArray(edition.issue_ids) && edition.issue_ids.includes(issueId)
  );
};

const _fetchEventById = async (eventId: string): Promise<(Event & { period_id: string }) | null> => {
  const periods = ['marvel_now', 'ultimate_universe', 'all_new_all_different'] as const;
  
  for (const period of periods) {
    try {
      const events = await _fetchEventsByPeriod(period);
      if (Array.isArray(events)) {
        const found = events.find(e => e.id === eventId);
        if (found) {
          return { ...found, period_id: period };
        }
      }
    } catch (error) {
      console.warn(`Error fetching events for period ${period}:`, error);
    }
  }
  
  return null;
};

const _fetchIssuesByIds = async (periodId: string, issueIds: string[]): Promise<Issue[]> => {
  const issues = await _fetchIssuesByPeriod(periodId);
  if (!Array.isArray(issues)) return [];
  return issues.filter(issue => issueIds.includes(issue.id));
};

export const fetchPeriods = withDataFetching(_fetchPeriods, [], 'Failed to fetch periods');
export const fetchPeriodById = withDataFetching(_fetchPeriodById, null, 'Failed to fetch period by ID');
export const fetchWriters = withDataFetching(_fetchWriters, [], 'Failed to fetch writers');
export const fetchPencillers = withDataFetching(_fetchPencillers, [], 'Failed to fetch pencillers');
export const fetchCharacters = withDataFetching(_fetchCharacters, [], 'Failed to fetch characters');

export const fetchIssuesByPeriod = withDataFetching(
  _fetchIssuesByPeriod, 
  [], 
  'Failed to fetch issues by period'
);

export const fetchEventsByPeriod = withDataFetching(
  _fetchEventsByPeriod, 
  [], 
  'Failed to fetch events by period'
);

export const fetchFrenchEditionsByPeriod = withDataFetching(
  _fetchFrenchEditionsByPeriod, 
  [], 
  'Failed to fetch french editions by period'
);

export const fetchFrenchEditionsByIssue = withDataFetching(
  _fetchFrenchEditionsByIssue, 
  [], 
  'Failed to fetch french editions by issue'
);

export const fetchEventById = withDataFetching(
  _fetchEventById, 
  null, 
  'Failed to fetch event by ID'
);

export const fetchIssuesByIds = withDataFetching(
  _fetchIssuesByIds, 
  [], 
  'Failed to fetch issues by IDs'
);

export const loadPeriodData = async <T = any>(
  periodName: string, 
  fileType: string
): Promise<T> => {
  console.warn('[DEPRECATED] loadPeriodData is deprecated. Using API fetch instead.');
  
  switch (fileType) {
    case 'issues':
      return await _fetchIssuesByPeriod(periodName) as T;
    case 'events':
      return await _fetchEventsByPeriod(periodName) as T;
    case 'french_editions':
      return await _fetchFrenchEditionsByPeriod(periodName) as T;
    default:
      throw new AppError(
        `Unknown fileType: ${fileType}. Use specific API fetchers instead.`, 
        ERROR_TYPES.UNKNOWN_ERROR
      );
  }
};

export const getPeriodStaticPaths = async () => {
  try {
    const periods = await _fetchPeriods();
    
    return {
      paths: (periods || []).map((period: Period) => ({
        params: { periodId: period.id }
      })),
      fallback: "blocking" as const,
    };
  } catch (error: any) {
    console.error("Error in getPeriodStaticPaths:", error);
    return {
      paths: [],
      fallback: "blocking" as const,
    };
  }
};