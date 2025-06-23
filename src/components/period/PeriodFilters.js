import React, { Suspense, useCallback } from "react";
const Filters = React.lazy(() => import("@/components/Filters"));

export default function PeriodFilters({
  filters,
  setFilter,
  resetFilters,
  filterIssuesWithoutFrenchEdition,
}) {
  const handleSetMinReadingNumber = useCallback(
    v => setFilter("minReadingNumber", v),
    [setFilter]
  );
  const handleSetMaxReadingNumber = useCallback(
    v => setFilter("maxReadingNumber", v),
    [setFilter]
  );

  return (
    <Suspense fallback={<p className="text-center">Chargement des filtres...</p>}>
      <Filters
        showFilters={filters.showFilters}
        toggleFilters={() => setFilter("showFilters", !filters.showFilters)}
        searchTitle={filters.searchTitle}
        setSearchTitle={v => setFilter("searchTitle", v)}
        searchWriter={filters.searchWriter}
        setSearchWriter={v => setFilter("searchWriter", v)}
        searchPenciller={filters.searchPenciller}
        setSearchPenciller={v => setFilter("searchPenciller", v)}
        minReadingNumber={filters.minReadingNumber}
        setMinReadingNumber={handleSetMinReadingNumber}
        maxReadingNumber={filters.maxReadingNumber}
        setMaxReadingNumber={handleSetMaxReadingNumber}
        frenchEditionStyle={filters.frenchEditionStyle}
        setFrenchEditionStyle={v => setFilter("frenchEditionStyle", v)}
        filterIssuesWithoutFrenchEdition={filterIssuesWithoutFrenchEdition}
        resetFilter={resetFilters}
        displayMode={filters.displayMode}
        setDisplayMode={v => setFilter("displayMode", v)}
      />
    </Suspense>
  );
}
