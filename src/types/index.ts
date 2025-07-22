import { ReactNode } from "react";

export interface Period {
  id: string;
  name: string;
  start_year: number;
  end_year: number | "now";
}

export interface Issue {
  id: string;
  order: number;
  pencillers: string[];
  period_id: string;
  title: string;
  writers: string[];
  image: string;
}

export interface FrenchEdition {
  id: string;
  french_title: string;
  issue_ids: string[];
  link: string;
  image: string;
  table_content?: number[];
  labels?: string[];
}

export interface Writer {
  id: string;
  name: string;
  slug?: string;
}

export interface Penciller {
  id: string;
  name: string;
  slug?: string;
}

export interface Character {
  id: string;
  name: string;
  slug?: string;
  image?: string;
}

export interface Event {
  id: string;
  name: string;
  image?: string;
  description?: string;
  period_id?: string;
  start_date?: string;
  end_date?: string;
  issue_ids?: string[];
}

export interface Series {
  id: string;
  name: string;
  start_year: number;
  end_year?: number;
  period_id: string;
  issues: Issue[];
  translated?: boolean;
}

export interface Volume {
  id: string;
  name: string;
  issues: Issue[];
  period_id: string;
}

export interface PeriodCardProps {
  period: Period;
  issueCount?: number;
  translatedCount?: number;
  onClick?: () => void;
}

export interface IssueCardProps {
  issue: Issue;
  isTranslated?: boolean;
  frenchEdition?: FrenchEdition;
  onClick?: () => void;
  showDetails?: boolean;
}

export interface SeriesCardProps {
  series: Series;
  translatedCount?: number;
  onClick?: () => void;
}

export interface EventCardProps {
  event: Event;
  issueCount?: number;
  onClick?: () => void;
}

export interface IssueFilters {
  writer?: string;
  penciller?: string;
  character?: string;
  onlyTranslated?: boolean;
  onlyUntranslated?: boolean;
  searchQuery?: string;
  orderBy?: 'order' | 'title' | 'date';
  sortDirection?: 'asc' | 'desc';
}

export interface SeriesFilters {
  searchQuery?: string;
  sortBy?: 'name' | 'year' | 'translated' | 'issueCount';
  sortDirection?: 'asc' | 'desc';
  onlyTranslated?: boolean;
  onlyUntranslated?: boolean;
}

export interface EventFilters {
  searchQuery?: string;
  periodId?: string;
  sortBy?: 'name' | 'date';
  sortDirection?: 'asc' | 'desc';
}

export interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
}

export interface ComicViewerProps {
  periodId?: string;
  seriesId?: string;
  eventId?: string;
  issues?: Issue[];
}

export interface ComicViewerMobileProps extends ComicViewerProps {
  isMobile: boolean;
}

export interface ComicViewerDesktopProps extends ComicViewerProps {
  isMobile: boolean;
}

export interface FilterBarProps {
  onFilterChange: (filters: IssueFilters) => void;
  writers: string[];
  pencillers: string[];
  characters?: string[];
  currentFilters: IssueFilters;
  showTranslationFilter?: boolean;
}

export interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  disabled?: boolean;
}

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export interface ErrorProps {
  message: string;
  onRetry?: () => void;
}

export interface PeriodsResponse {
  periods: Period[];
}

export interface IssuesResponse {
  issues: Issue[];
  frenchEditions?: FrenchEdition[];
}

export interface SeriesResponse {
  series: Series[];
}

export interface EventsResponse {
  events: Event[];
}

export interface UseIssuesReturn {
  issues: Issue[];
  loading: boolean;
  error: string | null;
  filteredIssues: Issue[];
  applyFilters: (filters: IssueFilters) => void;
  clearFilters: () => void;
}

export interface UseSeriesReturn {
  series: Series[];
  loading: boolean;
  error: string | null;
  filteredSeries: Series[];
  applyFilters: (filters: SeriesFilters) => void;
  clearFilters: () => void;
}

export interface UsePeriodsReturn {
  periods: Period[];
  loading: boolean;
  error: string | null;
}

export interface UseFrenchEditionsReturn {
  frenchEditions: FrenchEdition[];
  loading: boolean;
  error: string | null;
  isTranslated: (issueId: string) => boolean;
  getFrenchEdition: (issueId: string) => FrenchEdition | undefined;
}

export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'mobile' | 'desktop';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationOptions {
  page: number;
  limit: number;
  total?: number;
}

export interface SortOptions {
  field: string;
  direction: SortOrder;
}

export interface PeriodPageProps {
  period: Period;
  issues: Issue[];
  frenchEditions: FrenchEdition[];
}

export interface SeriesPageProps {
  series: Series[];
  period: Period;
}

export interface IssuePageProps {
  issue: Issue;
  frenchEdition?: FrenchEdition;
  period: Period;
}

export interface EventPageProps {
  event: Event;
  issues: Issue[];
  period: Period;
}

export interface HomePageProps {
  periods: Period[];
  featuredIssues?: Issue[];
  stats?: {
    totalIssues: number;
    translatedIssues: number;
    totalSeries: number;
  };
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
  children?: NavigationItem[];
}

export interface ResponsiveConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

export interface BreakpointConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

export interface AppErrorInfo {
  message: string;
  code?: string;
  details?: any;
}

export interface SearchResult {
  type: 'issue' | 'series' | 'event' | 'character';
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  url: string;
}

export interface SearchFilters {
  query: string;
  types: Array<'issue' | 'series' | 'event' | 'character'>;
  periods?: string[];
}

export interface PeriodStats {
  periodId: string;
  totalIssues: number;
  translatedIssues: number;
  totalSeries: number;
  translatedSeries: number;
  completionPercentage: number;
}

export interface GlobalStats {
  totalIssues: number;
  translatedIssues: number;
  totalSeries: number;
  totalPeriods: number;
  lastUpdated: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'checkbox' | 'radio';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  };
}

export interface FormData {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string;
}

export interface ThemeConfig {
  mode: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
}

export interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
}

export interface ComicViewerProps {
  periodId?: string;
  seriesId?: string;
  eventId?: string;
  issues?: Issue[];
}

export interface ComicViewerMobileProps extends ComicViewerProps {
  isMobile: boolean;
}

export interface ComicViewerDesktopProps extends ComicViewerProps {
  isMobile: boolean;
}

export interface FilterBarProps {
  onFilterChange: (filters: IssueFilters) => void;
  writers: string[];
  pencillers: string[];
  characters?: string[];
  currentFilters: IssueFilters;
  showTranslationFilter?: boolean;
}

export interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  disabled?: boolean;
}

export interface IssueCardProps {
  issue: Issue;
  variant?: "default" | "compact" | "featured" | "detailed";
  showBookmark?: boolean;
  showOrder?: boolean;
  frenchEditionStyle?: "color" | "border" | "shadow" | "gray";
  hasFrenchEdition?: boolean;
  onBookmark?: (order: number) => void;
  className?: string;
  isMobile?: boolean;
}

export interface SeriesCardProps {
  serie: {
    id: string;
    title: string;
    year: number;
    image: string;
    issueCount: number;
  };
  translatedCount?: number;
}

export interface MetaTitleProps {
  title?: string;
}

export interface IssueListProps {
  filteredIssues: Issue[];
  frenchEditionStyle?: "color" | "border" | "shadow" | "gray";
  setMinReadingNumber?: (order: number) => void;
  showBookmark?: boolean;
  useScroll?: boolean;
  frenchEditions?: any[];
  periodId?: string | null;
}

export interface IssueCardHeaderProps {
  order: number;
  showBookmark?: boolean;
  onBookmark?: () => void;
}

export interface IssueCardImageProps {
  issue: Issue;
  variant?: "default" | "compact" | "featured" | "detailed";
  frenchEditionStyle?: "color" | "border" | "shadow" | "gray";
  hasFrenchEdition?: boolean;
}

export interface IssueCardTitleProps {
  issue: Issue;
  variant?: "default" | "compact" | "featured" | "detailed";
}

export interface ComicViewerHeaderProps {
  editionTitle: string;
  images: string[];
  currentIndex: number;
  setPage: (index: number) => void;
  goPrev: () => void;
  goNext: () => void;
}

export interface ComicViewerImageDisplayProps {
  containerRef: React.RefObject<HTMLDivElement>;
  onImageClick: (
    e: React.MouseEvent,
    containerRef?: React.RefObject<HTMLElement>
  ) => void;
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  isDoublePage: boolean;
  customWidth: number;
  customDoubleWidth: number;
  imgLoaded: boolean;
  setImgLoaded: (loaded: boolean) => void;
  currentImage: string;
  altText: string;
}

export interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export interface ErrorProps {
  message: string;
  onRetry?: () => void;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
  children?: NavigationItem[];
}

export interface ResponsiveConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

export interface BreakpointConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

export interface AppErrorInfo {
  message: string;
  code?: string;
  details?: any;
}

export interface PeriodStats {
  periodId: string;
  totalIssues: number;
  translatedIssues: number;
  totalSeries: number;
  translatedSeries: number;
  completionPercentage: number;
}

export interface GlobalStats {
  totalIssues: number;
  translatedIssues: number;
  totalSeries: number;
  totalPeriods: number;
  lastUpdated: string;
}

export interface PeriodPageProps {
  period: Period;
  issues: Issue[];
  frenchEditions: FrenchEdition[];
}

export interface SeriesPageProps {
  series: Series[];
  period: Period;
}

export interface IssuePageProps {
  issue: Issue;
  frenchEdition?: FrenchEdition;
  period: Period;
}

export interface EventPageProps {
  event: Event;
  issues: Issue[];
  period: Period;
}

export interface HomePageProps {
  periods: Period[];
  featuredIssues?: Issue[];
  stats?: {
    totalIssues: number;
    translatedIssues: number;
    totalSeries: number;
  };
}