'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface UseNavigationWithFiltersReturn {
  navigateToIssue: (issueId: string) => void;
  navigateToSerie: (serieId: string) => void;
  navigateToEvent: (eventId: string) => void;
  navigateBack: () => void;
  navigateHome: () => void;
}

export default function useNavigationWithFilters(): UseNavigationWithFiltersReturn {
  const router = useRouter();

  const navigateToIssue = useCallback((issueId: string): void => {
    router.push(`/issue/${issueId}`);
  }, [router]);

  const navigateToSerie = useCallback((serieId: string): void => {
    router.push(`/serie/${serieId}`);
  }, [router]);

  const navigateToEvent = useCallback((eventId: string): void => {
    router.push(`/event/${eventId}`);
  }, [router]);

  const navigateBack = useCallback((): void => {
    router.back();
  }, [router]);

  const navigateHome = useCallback((): void => {
    router.push('/');
  }, [router]);

  return {
    navigateToIssue,
    navigateToSerie,
    navigateToEvent,
    navigateBack,
    navigateHome,
  };
}