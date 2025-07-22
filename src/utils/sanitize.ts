import { Issue, Event } from '@/types';

interface SerieData {
  id?: string;
  title?: string;
  year?: string | number;
  image?: string;
  issueCount?: number;
  issues?: Issue[];
  [key: string]: any;
}

interface EventWithOptionalFields extends Partial<Event> {
  title?: string;
  image?: string;
  order?: number;
}

export function sanitizeIssue(issue: Partial<Issue>): Issue {
  return {
    id: issue.id ?? "",
    title: issue.title ?? "",
    order: issue.order ?? 0,
    writers: Array.isArray(issue.writers) ? issue.writers : [],
    pencillers: Array.isArray(issue.pencillers) ? issue.pencillers : [],
    image: issue.image ?? "",
    period_id: issue.period_id ?? "",
  };
}

export function sanitizeIssues(issues: Partial<Issue>[]): Issue[] {
  return Array.isArray(issues) ? issues.map(sanitizeIssue) : [];
}

export function sanitizeEvent(event: EventWithOptionalFields): any {
  return {
    id: event.id ?? "",
    title: event.title ?? event.name ?? "",
    image: event.image ?? "",
    order: event.order ?? null,
    name: event.name ?? "",
    description: event.description ?? null,
    period_id: event.period_id ?? null,
    start_date: event.start_date ?? null,
    end_date: event.end_date ?? null,
    issue_ids: event.issue_ids ?? null,
  };
}

export function sanitizeEvents(events: EventWithOptionalFields[]): any[] {
  return Array.isArray(events) ? events.map(sanitizeEvent) : [];
}

export function sanitizeSerie(serie: SerieData): SerieData {
  return {
    ...serie,
    id: serie.id ?? "",
    title: serie.title ?? "",
    year: serie.year ?? "",
    image: serie.image ?? "",
    issueCount: serie.issueCount ?? 0,
    issues: sanitizeIssues(serie.issues || []),
  };
}