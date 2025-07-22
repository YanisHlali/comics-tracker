import {
  fetchPeriods,
  fetchPeriodById,
  fetchWriters,
  fetchPencillers,
  fetchCharacters,
  fetchIssuesByPeriod,
  fetchEventsByPeriod,
  fetchFrenchEditionsByPeriod,
  fetchFrenchEditionsByIssue,
  fetchEventById,
  fetchIssuesByIds
} from './dataFetcher';
import { 
  Period, 
  Issue, 
  Writer, 
  Penciller, 
  Character, 
  Event, 
  FrenchEdition, 
  Volume 
} from '@/types';

interface ServerDataFetcher {
  fetchPeriods(): Promise<Period[]>;
  fetchPeriodById(periodId: string): Promise<Period | null>;
  fetchWriters(): Promise<Writer[]>;
  fetchPencillers(): Promise<Penciller[]>;
  fetchCharacters(): Promise<Character[]>;
  fetchIssuesByPeriod(periodName: string): Promise<Issue[]>;
  fetchEventsByPeriod(periodName: string): Promise<Event[]>;
  fetchFrenchEditionsByPeriod(periodName: string): Promise<FrenchEdition[]>;
  fetchFrenchEditionsByIssue(periodName: string, issueId: string): Promise<FrenchEdition[]>;
  fetchEventById(eventId: string): Promise<(Event & { period_id: string }) | null>;
  fetchIssuesByIds(periodId: string, issueIds: string[]): Promise<Issue[]>;
}

export const serverDataFetcher: ServerDataFetcher = {
  async fetchPeriods(): Promise<Period[]> {
    try {
      const periods = await fetchPeriods();
      return periods || [];
    } catch (error: any) {
      console.error("Error loading periods:", error);
      return [];
    }
  },

  async fetchPeriodById(periodId: string): Promise<Period | null> {
    try {
      return await fetchPeriodById(periodId);
    } catch (error: any) {
      console.error(`Error loading period ${periodId}:`, error);
      return null;
    }
  },

  async fetchWriters(): Promise<Writer[]> {
    try {
      const writers = await fetchWriters();
      return writers || [];
    } catch (error: any) {
      console.error("Error loading writers:", error);
      return [];
    }
  },

  async fetchPencillers(): Promise<Penciller[]> {
    try {
      const pencillers = await fetchPencillers();
      return pencillers || [];
    } catch (error: any) {
      console.error("Error loading pencillers:", error);
      return [];
    }
  },

  async fetchCharacters(): Promise<Character[]> {
    try {
      const characters = await fetchCharacters();
      return characters || [];
    } catch (error: any) {
      console.error("Error loading characters:", error);
      return [];
    }
  },

  async fetchIssuesByPeriod(periodName: string): Promise<Issue[]> {
    try {
      const issues = await fetchIssuesByPeriod(periodName);
      return issues || [];
    } catch (error: any) {
      console.error(`Error loading issues for period ${periodName}:`, error);
      return [];
    }
  },

  async fetchEventsByPeriod(periodName: string): Promise<Event[]> {
    try {
      const events = await fetchEventsByPeriod(periodName);
      return events || [];
    } catch (error: any) {
      console.error(`Error loading events for period ${periodName}:`, error);
      return [];
    }
  },

  async fetchFrenchEditionsByPeriod(periodName: string): Promise<FrenchEdition[]> {
    try {
      const frenchEditions = await fetchFrenchEditionsByPeriod(periodName);
      return frenchEditions || [];
    } catch (error: any) {
      console.error(`Error loading french editions for period ${periodName}:`, error);
      return [];
    }
  },

  async fetchFrenchEditionsByIssue(periodName: string, issueId: string): Promise<FrenchEdition[]> {
    try {
      const frenchEditions = await fetchFrenchEditionsByIssue(periodName, issueId);
      return frenchEditions || [];
    } catch (error: any) {
      console.error(`Error loading french editions for issue ${issueId} in period ${periodName}:`, error);
      return [];
    }
  },

  async fetchEventById(eventId: string): Promise<(Event & { period_id: string }) | null> {
    try {
      return await fetchEventById(eventId);
    } catch (error: any) {
      console.error(`Error loading event ${eventId}:`, error);
      return null;
    }
  },

  async fetchIssuesByIds(periodId: string, issueIds: string[]): Promise<Issue[]> {
    try {
      const issues = await fetchIssuesByIds(periodId, issueIds);
      return issues || [];
    } catch (error: any) {
      console.error(`Error loading issues by IDs for period ${periodId}:`, error);
      return [];
    }
  }
};

export default serverDataFetcher;