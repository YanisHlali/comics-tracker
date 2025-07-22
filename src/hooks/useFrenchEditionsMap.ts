import { useMemo, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { FrenchEdition } from '@/types';

export interface FrenchEditionsMap {
  [issueId: string]: boolean;
}

export default function useFrenchEditionsMap(
  frenchEditions: FrenchEdition[] = [], 
  periodId: string | null = null
): FrenchEditionsMap {
  const { getFrenchEditionsMap, setFrenchEditions } = useAppContext();

  useEffect(() => {
    if (periodId && frenchEditions.length > 0) {
      const cachedMap = getFrenchEditionsMap(periodId);
      if (Object.keys(cachedMap).length === 0) {
        setFrenchEditions(periodId, frenchEditions);
      }
    }
  }, [periodId, frenchEditions, getFrenchEditionsMap, setFrenchEditions]);

  return useMemo((): FrenchEditionsMap => {
    if (periodId) {
      const cachedMap = getFrenchEditionsMap(periodId);
      if (Object.keys(cachedMap).length > 0) {
        return cachedMap;
      }
    }

    const map: FrenchEditionsMap = {};
    frenchEditions.forEach(edition => {
      (edition.issue_ids || []).forEach(id => {
        map[id] = true;
      });
    });
    return map;
  }, [frenchEditions, periodId, getFrenchEditionsMap]);
}