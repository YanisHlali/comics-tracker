import React from "react";
import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchIssuesByPeriod, fetchFrenchEditionsByPeriod } from "@/lib/server/dataFetcher";
import { fetchPeriods } from "@/lib/periodsFetcher";
import BackButton from "@/components/BackButton";
import MetaTitle from "@/components/MetaTitle";
import useMobileBreakpoint from "@/hooks/useMobileBreakpoint";
import { parseSeriesFromIssues } from "@/utils/series";
import useFrenchEditionsMap from "@/hooks/useFrenchEditionsMap";

const SeriesCard = React.memo(({ serie, translatedCount }) => {
  const isMobile = useMobileBreakpoint();
  return (
    <li className="text-center scale-hover">
      <Link href={`/serie/${serie.id}`}>
        <div className="flex justify-center">
          <Image
            src={serie.image}
            alt={serie.title}
            width={isMobile ? 150 : 200}
            height={isMobile ? 205 : 275}
            className="rounded-lg mb-2 shadow-gray-700"
            style={{ objectFit: "cover" }}
            loading="lazy"
          />
        </div>
        <div className="text-gray-300">
          <b className="font-bold block">{serie.title.toUpperCase()}</b>
          <span className="text-sm">
            {serie.year} · {translatedCount != null ? `${translatedCount}/${serie.issueCount} issues` : `${serie.issueCount} issues`}
          </span>
        </div>
      </Link>
    </li>
  )
});

const SearchInput = React.memo(({ value, onChange }) => (
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

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const { periodId } = params;
  const [issues, periods, frenchEditions] = await Promise.all([
    fetchIssuesByPeriod(periodId),
    fetchPeriods(),
    fetchFrenchEditionsByPeriod(periodId),
  ]);

  const series = parseSeriesFromIssues(issues);
  const periodName = periods.find((p) => p.id === periodId)?.name || "";
  return {
    props: {
      periodId,
      periodName,
      series,
      frenchEditions,
    },
  };
}

const SeriesList = ({ periodId, periodName, series, frenchEditions }) => {
  const [search, setSearch] = useState("");
  const frenchMap = useFrenchEditionsMap(frenchEditions);
  const filtered = useCallback(
    (serie) => serie.title.toLowerCase().includes(search.toLowerCase()),
    [search]
  );
  const fullyTranslated = useMemo(() =>
    series.filter((serie) =>
      serie.issues.every((issue) => frenchMap[issue.id]) && filtered(serie)
    ),
    [series, frenchMap, filtered]
  );
  const incompleteTranslated = useMemo(() =>
    series.filter((serie) =>
      serie.issues.some((issue) => !frenchMap[issue.id]) && filtered(serie)
    ),
    [series, frenchMap, filtered]
  );
  return (
    <>
      <MetaTitle title={`Séries · ${periodName} | Comics Tracker`} />
      <div className="container mx-auto py-12 bg-gray-900">
        <BackButton href={`/period/${periodId}`} />
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 border-b-2 border-gray-600 pb-2">
          Toutes les séries de <span className="text-red-400">{periodName}</span>
        </h1>
        <SearchInput value={search} onChange={setSearch} />
        {fullyTranslated.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-red-400 mt-10 mb-4">
              Les séries complètement traduites
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {fullyTranslated.map((serie) => (
                <SeriesCard key={serie.id} serie={serie} />
              ))}
            </ul>
          </>
        )}
        {incompleteTranslated.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-red-400 mt-10 mb-4">
              Les séries incomplètes
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {incompleteTranslated.map((serie) => {
                const translatedCount = serie.issues.filter((issue) => frenchMap[issue.id]).length;
                return <SeriesCard key={serie.id} serie={serie} translatedCount={translatedCount} />;
              })}
            </ul>
          </>
        )}
      </div>
    </>
  );
};

export default SeriesList;
