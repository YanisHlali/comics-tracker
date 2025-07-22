import React from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import { ParsedUrlQuery } from "querystring";
import MetaTitle from "@/components/MetaTitle";
import BackButton from "@/components/BackButton";
import IssueList from "@/components/IssueList";
import { serverDataFetcher } from "@/lib/serverDataFetcher";
import { parseSerieInfo } from "@/utils/series";
import { sanitizeIssues } from "@/utils/sanitize";
import { logger } from "@/lib/errorHandler";
import { Issue, Period } from "@/types";

interface SerieInfo {
  id: string;
  title: string;
  year: number;
  image: string;
  issueCount: number;
  issues: Issue[];
}

interface StaticParams extends ParsedUrlQuery {
  serieId: string;
}

interface SerieDetailPageProps {
  serieId: string;
  serieIssues: Issue[];
  period: string | null;
  serieInfo: {
    id: string;
    title: string;
    year: string | number;
    image: string;
    issueCount: number;
    issues: Issue[];
  } | null;
}

export const getStaticPaths: GetStaticPaths<StaticParams> = async () => {
  try {
    const periods = await serverDataFetcher.fetchPeriods();
    const seriesSet = new Set<string>();

    for (const period of periods || []) {
      const issues = await serverDataFetcher.fetchIssuesByPeriod(period.id);
      (issues || []).forEach((issue: Issue) => {
        const match = issue.title.match(/^(.*?) ?#?\d* ?\((\d{4})\)/);
        if (match) {
          const [, title, year] = match;
          const serieId =
            title
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9-]+/g, "_") +
            "_" +
            year;
          seriesSet.add(serieId);
        }
      });
    }

    const allPaths = Array.from(seriesSet).map((serieId) => ({
      params: { serieId },
    }));

    return {
      paths: allPaths,
      fallback: "blocking" as const,
    };
  } catch (error) {
    console.error("Error generating serie static paths:", error);
    return {
      paths: [],
      fallback: "blocking" as const,
    };
  }
};

export const getStaticProps: GetStaticProps<any, StaticParams> = async ({
  params,
}) => {
  if (!params?.serieId) {
    return {
      notFound: true,
    };
  }

  const { serieId } = params;
  const seriePrefix = serieId;

  try {
    const periods = await serverDataFetcher.fetchPeriods();
    const issuesPerPeriod = await Promise.all(
      (periods || []).map(async (p: Period) => ({
        id: p.id,
        issues: await serverDataFetcher.fetchIssuesByPeriod(p.id),
      }))
    );

    let allIssues: Issue[] = [];
    let period: string | null = null;

    for (const { id, issues } of issuesPerPeriod) {
      const filtered = (issues || []).filter((issue: Issue) =>
        issue.id.startsWith(seriePrefix + "_")
      );
      if (filtered.length > 0 && !period) period = id;
      allIssues.push(...filtered);
    }

    const sorted = allIssues.sort((a, b) => {
      const aIdParts = a.id.split("_");
      const bIdParts = b.id.split("_");

      const aId = aIdParts[aIdParts.length - 1];
      const bId = bIdParts[bIdParts.length - 1];

      if (!aId || !bId) return 0;

      const [aBase, aDec = 0] = aId.split(".").map(Number);
      const [bBase, bDec = 0] = bId.split(".").map(Number);
      return aBase !== bBase ? aBase - bBase : aDec - bDec;
    });

    const serieInfo = parseSerieInfo(sorted);
    const serieIssues = sanitizeIssues(sorted);

    const serieData = serieInfo
      ? {
          id: serieId,
          title: serieInfo.title,
          year: serieInfo.year,
          image: sorted[0]?.image || "",
          issueCount: serieIssues.length,
          issues: serieIssues,
        }
      : null;

    const sanitizedSerie = serieData
      ? {
          id: serieData.id,
          title: serieData.title,
          year: serieData.year,
          image: serieData.image,
          issueCount: serieData.issueCount,
          issues: serieData.issues,
        }
      : null;

    logger.info("Serie page generated", {
      serieId,
      issuesCount: serieIssues.length,
      period,
      hasSerieInfo: !!serieInfo,
    });

    return {
      props: {
        serieId,
        serieIssues,
        period,
        serieInfo: sanitizedSerie,
      },
      revalidate: 86400,
    };
  } catch (error) {
    logger.error("Failed to generate serie page", error, { serieId });

    return {
      props: {
        serieId,
        serieIssues: [],
        period: null,
        serieInfo: null,
      },
      revalidate: 86400,
    };
  }
};

const SerieDetailPage: React.FC<SerieDetailPageProps> = ({
  serieIssues,
  period,
  serieInfo,
}) => {
  if (!serieIssues.length) {
    return (
      <p className="text-center mt-12 text-gray-600">Série introuvable.</p>
    );
  }

  if (!serieInfo) {
    return (
      <p className="text-center mt-12 text-yellow-600">
        Titre non reconnu : {serieIssues[0]?.title}
      </p>
    );
  }

  return (
    <>
      <BackButton href={period ? `/period/${period}` : "/"} />
      <MetaTitle
        title={`${serieInfo.title} (${serieInfo.year}) | Comics Tracker`}
      />
      <div className="header-container">
        <h1 className="app-container separator">
          {serieInfo.title} ({serieInfo.year})
        </h1>
        <IssueList
          filteredIssues={serieIssues}
          useScroll={false}
          showBookmark={false}
        />
      </div>
    </>
  );
};

export default SerieDetailPage;
