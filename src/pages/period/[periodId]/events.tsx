import React from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import { ParsedUrlQuery } from "querystring";
import Link from "next/link";
import { serverDataFetcher } from "@/lib/serverDataFetcher";
import EventList from "@/components/EventList";
import BackButton from "@/components/BackButton";
import MetaTitle from "@/components/MetaTitle";
import { sanitizeEvents } from "@/utils/sanitize";
import { Period } from "@/types";

interface SanitizedEvent {
  id: string;
  title: string;
  order?: number;
  image: string;
  name: string;
  description?: string;
  period_id?: string;
  start_date?: string;
  end_date?: string;
  issue_ids?: string[];
}

interface StaticParams extends ParsedUrlQuery {
  periodId: string;
}

interface PeriodEventsPageProps {
  periodId: string;
  events: SanitizedEvent[];
  periodName: string;
}

export const getStaticPaths: GetStaticPaths<StaticParams> = async () => {
  try {
    const periods = await serverDataFetcher.fetchPeriods();
    
    return {
      paths: (periods || []).map((period: Period) => ({ 
        params: { periodId: period.id } 
      })),
      fallback: "blocking" as const,
    };
  } catch (error) {
    console.error("Error generating static paths:", error);
    return {
      paths: [],
      fallback: false,
    };
  }
};

export const getStaticProps: GetStaticProps<PeriodEventsPageProps, StaticParams> = async ({ params }) => {
  if (!params?.periodId) {
    return {
      notFound: true,
    };
  }

  const { periodId } = params;

  try {
    const [events, periodData] = await Promise.all([
      serverDataFetcher.fetchEventsByPeriod(periodId),
      serverDataFetcher.fetchPeriodById(periodId),
    ]);

    const safeEvents = sanitizeEvents(events || []);

    return {
      props: {
        periodId,
        events: safeEvents,
        periodName: periodData?.name ?? "",
      },
    };
  } catch (error) {
    console.error("Error fetching events data:", error);
    return {
      notFound: true,
    };
  }
};

const PeriodEventsPage: React.FC<PeriodEventsPageProps> = ({ 
  periodId, 
  events, 
  periodName 
}) => {
  if (!events.length) {
    return (
      <p className="text-center mt-12 text-gray-500">
        Aucun événement pour cette période.
      </p>
    );
  }

  return (
    <>
      <BackButton href={`/period/${periodId}`} />
      <MetaTitle title={`Events · ${periodName} | Comics Tracker`} />
      <div className="header-container">
        <h1 className="app-container separator">
          <span className="text-white">Événements ·</span>{" "}
          <Link className="hover:underline" href={`/period/${periodId}`}>
            {periodName}
          </Link>
        </h1>
        <EventList events={events} />
      </div>
    </>
  );
};

export default PeriodEventsPage;