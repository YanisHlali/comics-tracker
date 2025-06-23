import { useState } from "react";
import MetaTitle from "@/components/MetaTitle";
import BackButton from "@/components/BackButton";
import SerieHeader from "@/components/serie/SerieHeader";
import SerieIssues from "@/components/serie/SerieIssues";
import { fetchIssuesByPeriod } from "@/lib/server/dataFetcher";
import { fetchPeriods } from "@/lib/periodsFetcher";
import { getSeriePrefix, parseSerieInfo } from "@/utils/series";

export async function getStaticPaths() {
  const periods = await fetchPeriods();
  const serieIdSet = new Set();
  for (const period of periods) {
    const issues = await fetchIssuesByPeriod(period.id);
    issues.forEach(issue => {
      const parts = issue.id.split("_");
      if (parts.length >= 3) {
        const serieId = parts.slice(0, -1).join("_");
        serieIdSet.add(serieId);
      }
    });
  }
  const paths = Array.from(serieIdSet).map(serieId => ({ params: { serieId } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { serieId } = params;
  const seriePrefix = getSeriePrefix(serieId);
  const periods = await fetchPeriods();
  let allIssues = [];
  let period = null;
  for (const p of periods) {
    const issues = await fetchIssuesByPeriod(p.id);
    const filtered = issues.filter(issue => issue.id.startsWith(seriePrefix));
    if (filtered.length > 0 && !period) period = p.id;
    allIssues.push(...filtered);
  }
  const sorted = allIssues.sort((a, b) => {
    const [aBase, aDec = 0] = a.id.split("_").at(-1).split(".").map(Number);
    const [bBase, bDec = 0] = b.id.split("_").at(-1).split(".").map(Number);
    return aBase !== bBase ? aBase - bBase : aDec - bDec;
  });
  const serieInfo = parseSerieInfo(sorted);
  return {
    props: {
      serieId,
      serieIssues: sorted,
      period,
      serieInfo,
    },
  };
}

export default function SerieDetailPage({ serieId, serieIssues, period, serieInfo }) {
  const [frenchEditionStyle, setFrenchEditionStyle] = useState("color");
  if (!serieIssues.length) return <p className="text-center mt-12 text-gray-600">Série introuvable.</p>;
  if (!serieInfo) return <p className="text-center mt-12 text-yellow-600">Titre non reconnu : {serieIssues[0]?.title}</p>;
  return (
    <>
      <MetaTitle title={`${serieInfo.title} (${serieInfo.year}) | Comics Tracker`} />
      <div className="container mx-auto py-12 bg-gray-900">
        <BackButton href={period ? `/period/${period}` : "/"} />
        <SerieHeader title={serieInfo.title} year={serieInfo.year} />
        <SerieIssues issues={serieIssues} frenchEditionStyle={frenchEditionStyle} />
      </div>
    </>
  );
}
