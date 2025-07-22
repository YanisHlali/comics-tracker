import React, { useMemo } from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import { ParsedUrlQuery } from "querystring";
import Link from "next/link";
import Image from "next/image";
import { serverDataFetcher } from "@/lib/serverDataFetcher";
import BackButton from "@/components/BackButton";
import MetaTitle from "@/components/MetaTitle";
import { useMobileBreakpoint } from "@/hooks/useResponsive";
import { openInViewer } from "@/utils/viewer";
import { enrichComicData, parseComicTitle } from "@/utils/issues";
import { Issue, FrenchEdition, Period } from "@/types";

interface EnrichedComic extends Issue {
  period_id: string;
  writers: string[];
  pencillers: string[];
}

interface ParsedComicTitle {
  title: string;
  year: string | null;
  number: string | null;
  titleSerie: string;
}

interface StaticParams extends ParsedUrlQuery {
  issueId: string;
}

interface IssueDetailPageProps {
  comic: EnrichedComic;
  frenchEditions: FrenchEdition[];
  issueId: string;
}

export const getStaticPaths: GetStaticPaths<StaticParams> = async () => {
  try {
    const periods = await serverDataFetcher.fetchPeriods();
    const allPaths: Array<{ params: { issueId: string } }> = [];
    
    for (const period of periods || []) {
      try {
        const issues = await serverDataFetcher.fetchIssuesByPeriod(period.id);

        if (issues) {
          issues.forEach((issue: Issue) => {
            if (issue.id && typeof issue.id === 'string') {
              allPaths.push({
                params: { issueId: issue.id }
              });
            } else {
              console.warn(`Invalid issue ID in ${period.id}:`, issue);
            }
          });
        }
        
      } catch (periodError: any) {
        console.error(`ERROR processing period ${period.id}:`, periodError.message);
        console.error('Full error:', periodError);
      }
    }

    return {
      paths: allPaths,
      fallback: false as const
    };
  } catch (error: any) {
    console.error('=== FATAL ERROR IN getStaticPaths ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    return {
      paths: [],
      fallback: 'blocking' as const
    };
  }
};

export const getStaticProps: GetStaticProps<IssueDetailPageProps, StaticParams> = async ({ params }) => {
  if (!params?.issueId) {
    return {
      notFound: true,
    };
  }

  const { issueId } = params;

  try {
    const periods = await serverDataFetcher.fetchPeriods();
    const issuesByPeriod = await Promise.all(
      (periods || []).map(async (p: Period) => ({ 
        id: p.id, 
        issues: await serverDataFetcher.fetchIssuesByPeriod(p.id) 
      }))
    );

    let comicData: Issue | null = null;
    let period_id: string | null = null;

    for (const { id, issues } of issuesByPeriod) {
      const found = (issues || []).find((issue: Issue) => issue.id === issueId);
      if (found) {
        comicData = found;
        period_id = id;
        break;
      }
    }

    if (!comicData || !period_id) {
      return { notFound: true };
    }

    const frenchEditions = await serverDataFetcher.fetchFrenchEditionsByIssue(period_id, issueId);

    const [allWriters, allPencillers] = await Promise.all([
      serverDataFetcher.fetchWriters(),
      serverDataFetcher.fetchPencillers(),
    ]);

    const enrichedComic = enrichComicData(comicData, allWriters, allPencillers, period_id);

    return {
      props: {
        comic: enrichedComic,
        frenchEditions: Array.isArray(frenchEditions) ? frenchEditions : [],
        issueId,
      },
      revalidate: 3600,
    };
  } catch (error: any) {
    console.error(`Error generating props for issue ${issueId}:`, error);
    return { notFound: true };
  }
};

const IssueDetail: React.FC<IssueDetailPageProps> = ({ comic, frenchEditions, issueId }) => {
  const isMobile = useMobileBreakpoint();
  
  const parsed = useMemo((): ParsedComicTitle | null => {
    return comic && issueId ? parseComicTitle(comic.title, issueId) : null;
  }, [comic, issueId]);

  if (!comic || !parsed) {
    return (
      <p className="text-center mt-12 text-yellow-600">
        Aucune donnée disponible.
      </p>
    );
  }

  const { title, year, number, titleSerie } = parsed;
  
  return (
    <>
      <BackButton href={`/period/${comic.period_id}`} />
      <MetaTitle title={`${title} (${year})${number ? ` #${number}` : ""} | Comics Tracker`} />
      <div className="header-container">
        <h1 className="app-container separator">
          <Link href={`/serie/${titleSerie}`} className="hover:underline">
            {title} {year ? `(${year})` : ""}
          </Link>
          {number && <span className="text-white"> #{number}</span>}
        </h1>
        <div className="my-6 text-gray-200">
          <p className="text-base">
            <span className="font-semibold">Auteur :</span> {comic.writers.join(", ") || "Inconnu"}
          </p>
          <p className="text-base">
            <span className="font-semibold">Dessinateur :</span> {comic.pencillers.join(", ") || "Inconnu"}
          </p>
        </div>
        <h2 className="text-xl font-semibold text-white mb-6">
          Ces éditions contiennent ce numéro en français
        </h2>
        {frenchEditions.length > 0 ? (
          <div className="issue-list">
            {frenchEditions.map((edition: FrenchEdition) => (
              <div key={edition.id} className="flex flex-col items-center text-center">
                <button
                  onClick={() => {
                    if (!openInViewer(edition.link, edition.french_title, edition.table_content, edition.labels)) {
                      alert("Impossible d'ouvrir une nouvelle fenêtre");
                    }
                  }}
                  className="block"
                  type="button"
                >
                  <Image
                    src={edition.image}
                    alt={edition.french_title}
                    width={isMobile ? 150 : 200}
                    height={isMobile ? 205 : 275}
                    className="rounded-lg shadow-gray-700 mb-2"
                    loading="lazy"
                  />
                </button>
                <p className="mt-2 text-red-400">{edition.french_title}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Aucune édition française trouvée.</p>
        )}
      </div>
    </>
  );
};

export default IssueDetail;