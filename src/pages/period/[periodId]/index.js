import { useState, useMemo, useCallback } from "react";
import useFrenchEditionsMap from "@/hooks/useFrenchEditionsMap";
import MetaTitle from "@/components/MetaTitle";
import BackButton from "@/components/BackButton";
import PeriodHeader from "@/components/period/PeriodHeader";
import PeriodFilters from "@/components/period/PeriodFilters";
import PeriodIssues from "@/components/period/PeriodIssues";
import { fetchPeriods } from "@/lib/periodsFetcher";
import { fetchPeriodById } from "@/lib/dataFetcher";
import { fetchIssuesByPeriod, fetchEventsByPeriod, fetchFrenchEditionsByPeriod } from "@/lib/server/dataFetcher";

export async function getStaticPaths() {
  const periods = await fetchPeriods();
  const paths = periods.map((p) => ({ params: { periodId: p.id } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { periodId } = params;
  const [period, issues, events, frenchEditions] = await Promise.all([
    fetchPeriodById(periodId),
    fetchIssuesByPeriod(periodId),
    fetchEventsByPeriod(periodId),
    fetchFrenchEditionsByPeriod(periodId),
  ]);
  return {
    props: {
      periodId,
      periodTitle: period?.name || "Unknown",
      issues,
      events,
      frenchEditions,
    },
  };
}

const initialFilters = {
  showFilters: false,
  searchTitle: "",
  searchWriter: "",
  searchPenciller: "",
  minReadingNumber: null,
  maxReadingNumber: null,
  frenchEditionStyle: "color",
  displayMode: "image",
  onlyWithoutFrenchEdition: false,
};

export default function PeriodDetailPage({ periodId, periodTitle, issues, events, frenchEditions }) {
  const [filters, setFilters] = useState({ ...initialFilters });
  const frenchMap = useFrenchEditionsMap(frenchEditions);

  const setFilter = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
  }, []);
  const resetFilters = useCallback(() => setFilters({ ...initialFilters }), []);
  const filterIssuesWithoutFrenchEdition = useCallback(
    () => setFilters((f) => ({ ...f, onlyWithoutFrenchEdition: true })),
    []
  );

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const titleMatch = issue.title.toLowerCase().includes(filters.searchTitle.toLowerCase());
      const writerMatch = !filters.searchWriter || (issue.writers || []).some(w =>
        w.toLowerCase().includes(filters.searchWriter.toLowerCase())
      );
      const pencillerMatch = !filters.searchPenciller || (issue.pencillers || []).some(p =>
        p.toLowerCase().includes(filters.searchPenciller.toLowerCase())
      );

      const minMatch = filters.minReadingNumber == null || issue.order >= filters.minReadingNumber;
      const maxMatch = filters.maxReadingNumber == null || issue.order <= filters.maxReadingNumber;
      const withoutFrMatch = !filters.onlyWithoutFrenchEdition || !frenchMap[issue.id];

      return titleMatch && writerMatch && pencillerMatch && minMatch && maxMatch && withoutFrMatch;
    });
  }, [issues, filters, frenchMap]);

  const issuesWithFrenchEdition = useMemo(() => (
    issues.filter(issue => frenchMap[issue.id])
  ), [issues, frenchMap]);

  const issueCounts = {
    with: issuesWithFrenchEdition.length,
    without: issues.length - issuesWithFrenchEdition.length,
  };

  return (
    <div className="container mx-auto py-12 bg-gray-900 text-white">
      <MetaTitle title={`${periodTitle} | Comics Tracker`} />
      <BackButton href="/" />
      <PeriodHeader
        title={periodTitle}
        events={events}
        periodId={periodId}
        issueCounts={issueCounts}
      />
      <PeriodFilters
        filters={filters}
        setFilter={setFilter}
        resetFilters={resetFilters}
        filterIssuesWithoutFrenchEdition={filterIssuesWithoutFrenchEdition}
      />
      <PeriodIssues
        filteredIssues={filteredIssues}
        frenchEditionStyle={filters.frenchEditionStyle}
        setMinReadingNumber={v => setFilter("minReadingNumber", v)}
        showBookmark={true}
        frenchEditions={frenchEditions}
      />
    </div>
  );
}
