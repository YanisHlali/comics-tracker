import { useMemo } from 'react';

export default function useFrenchEditionsMap(frenchEditions = []) {
  return useMemo(() => {
    const map = {};
    frenchEditions.forEach(edition => {
      (edition.issue_ids || []).forEach(id => {
        map[id] = true;
      });
    });
    return map;
  }, [frenchEditions]);
}