import React, { useMemo, useCallback } from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import { ParsedUrlQuery } from "querystring";
import Link from "next/link";
import dynamic from "next/dynamic";
import useFrenchEditionsMap from "@/hooks/useFrenchEditionsMap";
import { useFilters } from "@/hooks/useFilters";
import MetaTitle from "@/components/MetaTitle";
import SimpleFilters from "@/components/SimpleFilters";
import { serverDataFetcher } from "@/lib/serverDataFetcher";
import { createFrenchEditionsMap } from "@/utils/issues";
import { sanitizeIssues } from "@/utils/sanitize";
import { Issue, FrenchEdition, Event } from "@/types";
import BackButton from "@/components/BackButton";

const IssueList = dynamic(() => import("@/components/IssueList"), {
  ssr: false,
});

interface SanitizedIssue {
  id: string;
  title: string;
  order: number;
  writers: string[];
  pencillers: string[];
  image: string;
}

interface StaticParams extends ParsedUrlQuery {
  periodId: string;
}

interface PeriodDetailPageProps {
  periodId: string;
  periodTitle: string;
  issues: SanitizedIssue[];
  events: Event[];
  frenchEditions: FrenchEdition[];
  issueCounts: {
    with: number;
    without: number;
  };
}

export const getStaticPaths: GetStaticPaths<StaticParams> = async () => {
  try {
    const periods = await serverDataFetcher.fetchPeriods();
    const result = {
      paths: (periods || []).map((period) => ({
        params: { periodId: period.id },
      })),
      fallback: "blocking" as const,
    };

    let fallback: boolean | "blocking" = false;
    if (typeof result.fallback === "boolean") {
      fallback = result.fallback;
    } else if (result.fallback === "blocking") {
      fallback = "blocking";
    }

    return {
      paths: result.paths || [],
      fallback,
    };
  } catch (error) {
    console.error("Error generating static paths:", error);
    return {
      paths: [],
      fallback: false,
    };
  }
};

export const getStaticProps: GetStaticProps<
  PeriodDetailPageProps,
  StaticParams
> = async ({ params }) => {
  if (!params?.periodId) {
    return {
      notFound: true,
    };
  }

  const { periodId } = params;

  try {
    const [period, issues, events, frenchEditions] = await Promise.all([
      serverDataFetcher.fetchPeriodById(periodId),
      serverDataFetcher.fetchIssuesByPeriod(periodId),
      serverDataFetcher.fetchEventsByPeriod(periodId),
      serverDataFetcher.fetchFrenchEditionsByPeriod(periodId),
    ]);

    if (!period) {
      return {
        notFound: true,
      };
    }

    const frenchMap: Record<string, any> = createFrenchEditionsMap(
      frenchEditions || []
    );
    const minimalIssues: SanitizedIssue[] = sanitizeIssues(issues || []);

    const issuesWithFrenchEdition = (issues || []).filter(
      (issue: Issue) => frenchMap[issue.id]
    );
    const issueCounts = {
      with: issuesWithFrenchEdition.length,
      without: (issues || []).length - issuesWithFrenchEdition.length,
    };

    return {
      props: {
        periodId,
        periodTitle: period.name || "Unknown",
        issues: minimalIssues,
        events: events || [],
        frenchEditions: frenchEditions || [],
        issueCounts,
      },
    };
  } catch (error) {
    console.error(`Error loading data for period ${periodId}:`, error);
    return {
      notFound: true,
    };
  }
};

export default function PeriodDetailPage({
  periodId,
  periodTitle,
  issues,
  events,
  frenchEditions,
  issueCounts,
}: PeriodDetailPageProps): React.ReactElement {
  const frenchMap: Record<string, boolean> = useFrenchEditionsMap(
    frenchEditions,
    periodId
  );

  const mappedIssues = useMemo(
    () =>
      issues.map((issue: SanitizedIssue) => ({
        ...issue,
        hasFrenchEdition: Boolean(frenchMap[issue.id]),
        period_id: periodId,
      })),
    [issues, frenchMap, periodId]
  );

  const {
    filters,
    updateFilter,
    resetAllFilters,
    filteredItems: filteredIssues,
    stats,
  } = useFilters({
    pageKey: `period-${periodId}`,
    enableAdvanced: true,
    items: mappedIssues,
    debounceMs: 200,
    enableHighlight: true,
  });

  const handleFilterWithoutFrenchEdition = useCallback((): void => {
    updateFilter("onlyWithoutFrenchEdition", true);
  }, [updateFilter]);

  const handleSetMinReadingNumber = useCallback(
    (value: number): void => {
      updateFilter("minReadingNumber", value);
    },
    [updateFilter]
  );

  const compatibleIssues: Issue[] = useMemo(
    () =>
      (filteredIssues || []).map((item) => ({
        id: item.id || "",
        title: item.title || "",
        order: item.order || 0,
        writers: item.writers || [],
        pencillers: item.pencillers || [],
        image: item.image || "",
        period_id: item.period_id || periodId,
      })),
    [filteredIssues, periodId]
  );

  return (
    <>
      {React.createElement(BackButton, { href: "/" })}
      <div className="header-container">
        <MetaTitle title={`${periodTitle} | Comics Tracker`} />

        <div className="app-container">
          <h1 className="w-full text-2xl sm:text-3xl font-bold text-red-400 separator">
            {periodTitle}
            <span className="text-white"> · Reading Order · </span>
            {events && events.length > 0 && (
              <>
                <Link
                  className="hover:underline"
                  href={`/period/${periodId}/events`}
                >
                  Events
                </Link>
                <span className="text-white"> · </span>
              </>
            )}
            <Link
              className="hover:underline"
              href={`/period/${periodId}/series`}
            >
              Series
            </Link>
          </h1>
          <h2 className="text-xl font-semibold text-red-400 mb-4 border-b-2 border-gray-600 pb-2">
            <span className="text-green-400">
              {issueCounts?.with ?? 0} issues disponibles
            </span>
            <span className="text-gray-400">
              {" "}
              · {issueCounts?.without ?? 0} non traduites
            </span>
          </h2>
        </div>

        <SimpleFilters
          filters={filters}
          setFilter={updateFilter}
          resetFilters={resetAllFilters}
          filterIssuesWithoutFrenchEdition={handleFilterWithoutFrenchEdition}
        />

        <IssueList
          filteredIssues={compatibleIssues}
          frenchEditionStyle={
            (filters.frenchEditionStyle as "color" | "border" | "shadow") ||
            "color"
          }
          setMinReadingNumber={handleSetMinReadingNumber}
          showBookmark={true}
          frenchEditions={frenchEditions}
          periodId={periodId}
        />
      </div>
    </>
  );
}
