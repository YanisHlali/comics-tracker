import { fetchEventsByPeriod } from "@/lib/server/dataFetcher";
import { fetchPeriodById } from "@/lib/dataFetcher";
import EventList from "@/components/EventList";
import BackButton from "@/components/BackButton";
import MetaTitle from "@/components/MetaTitle";
import Link from "next/link";

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const { periodId } = params;
  const [events, periodData] = await Promise.all([
    fetchEventsByPeriod(periodId),
    fetchPeriodById(periodId),
  ]);
  return {
    props: {
      periodId,
      events: events || [],
      periodName: periodData?.name || "",
    },
  };
}

export default function PeriodEventsPage({ periodId, events, periodName }) {
  if (!events.length) return <p className="text-center mt-12 text-gray-500">Aucun événement pour cette période.</p>;
  return (
    <>
      <MetaTitle title={`Events · ${periodName} | Comics Tracker`} />
      <div className="container mx-auto py-12 bg-gray-900">
        <BackButton href={`/period/${periodId}`} />
        <h1 className="w-full text-2xl sm:text-3xl font-bold text-red-400 mb-6 border-b-2 border-gray-600 pb-2">
          <span className="text-white">Événements ·</span>{" "}
          <Link className="hover:underline" href={`/period/${periodId}`}>{periodName}</Link>
        </h1>
        <EventList events={events} />
      </div>
    </>
  );
}
