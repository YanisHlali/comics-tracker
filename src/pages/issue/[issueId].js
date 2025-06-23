import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchPeriods } from "@/lib/periodsFetcher";
import { fetchIssuesByPeriod, fetchFrenchEditionsByIssue } from "@/lib/server/dataFetcher";
import BackButton from "@/components/BackButton";
import MetaTitle from "@/components/MetaTitle";
import useMobileBreakpoint from "@/hooks/useMobileBreakpoint";
import { fetchWriters, fetchPencillers } from "@/lib/dataFetcher";
import { openInViewer } from "@/utils/viewer";


function parseComicTitle(title, issueId) {
  const match = title.match(/^(.*?) \((\d{4})\)(?: #(\d+[.]?\d*)?)?/);
  if (!match) throw new Error("Format de titre invalide");
  const [, name, year, number] = match;
  const titleSerie = issueId.split("_").slice(0, -1).join("_");
  return { title: name, year, number, titleSerie };
}

export async function getStaticPaths() {
  const periods = await fetchPeriods();
  const issueIds = [];
  for (const period of periods) {
    const issues = await fetchIssuesByPeriod(period.id);
    issues.forEach(issue => issueIds.push(issue.id));
  }
  const paths = issueIds.map(issueId => ({ params: { issueId } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { issueId } = params;

  const periods = await fetchPeriods();
  let comicData = null;
  let period_id = null;
  for (const period of periods) {
    const issues = await fetchIssuesByPeriod(period.id);
    const found = issues.find(issue => issue.id === issueId);
    if (found) {
      comicData = found;
      period_id = period.id;
      break;
    }
  }
  if (!comicData) {
    return { notFound: true };
  }

  const frenchEditions = await fetchFrenchEditionsByIssue(period_id, issueId);

  const allWriters = await fetchWriters();
  const allPencillers = await fetchPencillers();

  const mapNames = (ids, ref) =>
    Array.isArray(ids)
      ? ids.map(id => ref.find(x => x.id === id)?.name || "Inconnu")
      : [];

  const enrichedComic = {
    ...comicData,
    writers: mapNames(comicData.writers, allWriters),
    pencillers: mapNames(comicData.pencillers, allPencillers),
  };

  return {
    props: {
      comic: enrichedComic,
      frenchEditions,
      period_id,
      issueId,
    },
    revalidate: 60,
  };
}

export default function IssueDetail({ comic, frenchEditions, issueId }) {
  const isMobile = useMobileBreakpoint();
  const parsed = useMemo(() => {
    try {
      return comic && issueId ? parseComicTitle(comic.title, issueId) : null;
    } catch {
      return null;
    }
  }, [comic, issueId]);

  if (!comic || !parsed) return <p className="text-center mt-12 text-yellow-600">Aucune donnée disponible.</p>;
  const { title, year, number, titleSerie } = parsed;
  return (
    <>
      <MetaTitle title={`${title} (${year}) #${number} | Comics Tracker`} />
      <div className="container mx-auto max-w-5xl py-12 bg-gray-900 text-white">
        <BackButton href={`/period/${comic.period_id}`} />
        <h1 className="w-full text-2xl sm:text-3xl font-bold text-red-400 mb-6 border-b-2 border-gray-600 pb-2">
          <Link href={`/serie/${titleSerie}`} className="hover:underline">
            {title} ({year})
          </Link>
          {number && <span className="text-white"> #{number}</span>}
        </h1>
        <div className="my-6 text-gray-200">
          <p className="text-base"><span className="font-semibold">Auteur :</span> {comic.writers.join(", ") || "Inconnu"}</p>
          <p className="text-base"><span className="font-semibold">Dessinateur :</span> {comic.pencillers.join(", ") || "Inconnu"}</p>
        </div>
        <h2 className="text-xl font-semibold text-white mb-6">Ces éditions contiennent ce numéro en français</h2>
        {frenchEditions.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {frenchEditions.map((edition) => (
              <div key={edition.id} className="flex flex-col items-center text-center">
                <button
                  onClick={() => openInViewer(edition.link, edition.french_title)}
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
}
