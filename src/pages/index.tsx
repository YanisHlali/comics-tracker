import { GetStaticProps } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import MetaTitle from "@/components/MetaTitle";
import { serverDataFetcher } from "@/lib/serverDataFetcher";
import { Period, HomePageProps } from "@/types";

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  try {
    const periods = await serverDataFetcher.fetchPeriods();
    
    return { 
      props: { 
        periods: periods || []
      } 
    };
  } catch (error) {
    console.error("Error fetching periods:", error);
    return {
      props: {
        periods: []
      }
    };
  }
};

export default function Home({ periods }: HomePageProps): React.ReactElement {
  const error = periods.length === 0;
  
  return (
    <>
      <MetaTitle title="Périodes | Comics Tracker" />
      <main className="container mx-auto py-12 bg-gray-900 text-white min-h-screen">
        <h1 className="text-4xl font-bold text-red-500 mb-8">
          Périodes
        </h1>
        {error ? (
          <div className="text-center text-red-400 text-lg my-8">
            Erreur lors du chargement des périodes.
          </div>
        ) : (
          <ul className="space-y-6" aria-label="Liste des périodes">
            {periods.map((period: Period) => (
              <li
                key={period.id}
                className="p-6 bg-gray-800 bg-opacity-90 rounded-lg shadow-lg border-2 mb-6 transform transition-transform duration-300"
              >
                <Link
                  href={`/period/${period.id}`}
                  className="text-xl font-semibold text-gray-300 hover:underline focus-visible:underline outline-none"
                  aria-label={`Accéder à la période ${period.name}`}
                >
                  {period.name}{" "}
                  <span className="text-gray-400 font-medium">
                    ({period.start_year} – {period.end_year})
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="fixed bottom-0 right-0 p-4 z-50">
          <Analytics />
        </div>
      </main>
    </>
  );
}