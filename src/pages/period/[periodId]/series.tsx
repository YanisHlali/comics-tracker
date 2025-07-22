import React, { useCallback, useMemo, useState } from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import { ParsedUrlQuery } from "querystring";
import Link from "next/link";
import Image from "next/image";
import { serverDataFetcher } from "@/lib/serverDataFetcher";
import MetaTitle from "@/components/MetaTitle";
import { useMobileBreakpoint } from "@/hooks/useResponsive";
import { parseSeriesFromIssues } from "@/utils/series";
import useFrenchEditionsMap from "@/hooks/useFrenchEditionsMap";
import { createTextSearchFilter } from "@/utils/issues";
import { sanitizeSerie } from "@/utils/sanitize";
import { Issue, FrenchEdition, Period } from "@/types";
import BackButton from "@/components/BackButton";

interface SerieData {
  id: string;
  title: string;
  year: number;
  image: string;
  issueCount: number;
  issues: Issue[];
}

interface SeriesCardProps {
  serie: SerieData;
  translatedCount?: number;
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

interface SeriesListProps {
  periodId: string;
  periodName: string;
  series: SerieData[];
  frenchEditions: FrenchEdition[];
}

interface StaticParams extends ParsedUrlQuery {
  periodId: string;
}

interface SeriesPageStaticProps {
  periodId: string;
  periodName: string;
  series: SerieData[];
  frenchEditions: FrenchEdition[];
}

const SeriesCard = React.memo<SeriesCardProps>(({ serie, translatedCount }) => {
  const isMobile = useMobileBreakpoint();

  return (
    <li className="text-center transition-transform duration-300 hover:scale-105">
      <Link href={`/serie/${serie.id}`}>
        <div className="flex justify-center">
          <Image
            src={serie.image}
            alt={serie.title}
            width={isMobile ? 150 : 200}
            height={isMobile ? 205 : 275}
            className="rounded-lg mb-2 shadow-gray-700 object-cover"
            loading="lazy"
          />
        </div>
        <div className="text-gray-300">
          <b className="font-bold block">{serie.title.toUpperCase()}</b>
          <span className="text-sm">
            {serie.year} ·{" "}
            {translatedCount != null
              ? `${translatedCount}/${serie.issueCount} issues`
              : `${serie.issueCount} issues`}
          </span>
        </div>
      </Link>
    </li>
  );
});

SeriesCard.displayName = "SeriesCard";

const SearchInput = React.memo<SearchInputProps>(({ value, onChange }) => (
  <input
    id="search"
    type="text"
    placeholder="Rechercher une série"
    className="
      mb-6 w-full p-4 border-transparent rounded-md bg-gray-800 text-white
      focus:outline-none
      focus:ring-0
    "
    autoComplete="off"
    aria-label="Rechercher une série"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
));

SearchInput.displayName = "SearchInput";

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

export const getStaticProps: GetStaticProps<any, StaticParams> = async ({
  params,
}) => {
  if (!params?.periodId) {
    return {
      notFound: true,
    };
  }

  const { periodId } = params;

  try {
    const [issues, periods, frenchEditions] = await Promise.all([
      serverDataFetcher.fetchIssuesByPeriod(periodId),
      serverDataFetcher.fetchPeriods(),
      serverDataFetcher.fetchFrenchEditionsByPeriod(periodId),
    ]);

    const rawSeries = parseSeriesFromIssues(issues || []);
    const series = rawSeries.map(sanitizeSerie);

    const periodName =
      ((periods || []).find((p: Period) => p.id === periodId) || {}).name ?? "";

    return {
      props: {
        periodId,
        periodName,
        series,
        frenchEditions: Array.isArray(frenchEditions) ? frenchEditions : [],
      },
    };
  } catch (error) {
    console.error(`Error loading data for period ${periodId}:`, error);
    return {
      notFound: true,
    };
  }
};

const SeriesList: React.FC<SeriesListProps> = ({
  periodId,
  periodName,
  series,
  frenchEditions,
}) => {
  const [search, setSearch] = useState<string>("");
  const frenchMap = useFrenchEditionsMap(frenchEditions, periodId);

  const filtered = useCallback(createTextSearchFilter(search), [search]);

  const fullyTranslated = useMemo(
    () =>
      series.filter(
        (serie: SerieData) =>
          serie.issues.every((issue: Issue) => frenchMap[issue.id]) &&
          filtered(serie)
      ),
    [series, frenchMap, filtered]
  );

  const incompleteTranslated = useMemo(
    () =>
      series.filter(
        (serie: SerieData) =>
          serie.issues.some((issue: Issue) => !frenchMap[issue.id]) &&
          filtered(serie)
      ),
    [series, frenchMap, filtered]
  );

  return (
    <>
      {React.createElement(BackButton, { href: `/period/${periodId}` })}
      <MetaTitle title={`Séries · ${periodName} | Comics Tracker`} />
      <div className="header-container">
        <h1 className="app-container separator">
          <span className="text-white"> Toutes les séries de </span>{" "}
          {periodName}
        </h1>
        <SearchInput value={search} onChange={setSearch} />
        {fullyTranslated.length > 0 && (
          <>
            <h2 className="series-title">Les séries complètement traduites</h2>
            <ul className="issue-list">
              {fullyTranslated.map((serie: SerieData) => (
                <SeriesCard key={serie.id} serie={serie} />
              ))}
            </ul>
          </>
        )}
        {incompleteTranslated.length > 0 && (
          <>
            <h2 className="series-title">Les séries incomplètes</h2>
            <ul className="issue-list">
              {incompleteTranslated.map((serie: SerieData) => {
                const translatedCount = serie.issues.filter(
                  (issue: Issue) => frenchMap[issue.id]
                ).length;
                return (
                  <SeriesCard
                    key={serie.id}
                    serie={serie}
                    translatedCount={translatedCount}
                  />
                );
              })}
            </ul>
          </>
        )}
      </div>
    </>
  );
};

export default SeriesList;
