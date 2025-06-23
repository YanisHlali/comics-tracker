import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchEventById, fetchIssuesByIds } from "@/lib/server/dataFetcher";
import MetaTitle from "@/components/MetaTitle";
import IssueCard from "@/components/IssueCard";
import useMobileBreakpoint from "@/hooks/useMobileBreakpoint";

const VIEW_MODES = {
  ALL_CHRONOLOGICAL: "all_chronological",
  MAIN_ONLY: "main_only",
  MAIN_AND_TIEINS: "main_and_tieins",
};

const ErrorMessage = ({ message }) => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="text-red-500 text-lg">{message}</div>
  </div>
);

const CategorySection = React.memo(({ category, showLabel = true, isMobile }) => (
  <div className="mb-8">
    {showLabel && (
      <h2 className="text-xl font-semibold text-red-400 mb-4 border-b-2 border-gray-600 pb-2 whitespace-normal sm:whitespace-nowrap break-words">
        {category.label}
      </h2>
    )}
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {category.issues?.map((issue, index) => (
        <IssueCard 
          key={issue.id} 
          issue={issue} 
          index={index}
          isMobile={isMobile}
          hasFrenchEdition={true}
          onSetMinReadingNumber={() => {}}
          frenchEditionStyle="color"
          showBookmark={false}
        />
      ))}
    </ul>
  </div>
));

const ViewModeSelector = ({ viewMode, onViewModeChange }) => (
  <div className="mb-6 flex justify-center gap-4">
    {Object.entries(VIEW_MODES).map(([key, value]) => (
      <button
        key={key}
        onClick={() => onViewModeChange(value)}
        className={`px-4 py-2 rounded-lg transition-colors ${
          viewMode === value
            ? "bg-red-600 text-white"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
        type="button"
      >
        {value === VIEW_MODES.ALL_CHRONOLOGICAL && "Ordre chronologique"}
        {value === VIEW_MODES.MAIN_ONLY && "Histoire principale"}
        {value === VIEW_MODES.MAIN_AND_TIEINS && "Principal + Tie-ins"}
      </button>
    ))}
  </div>
);

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const { eventId } = params;
  const eventData = await fetchEventById(eventId);
  if (!eventData) {
    return { notFound: true };
  }
  const categoriesData = await Promise.all(
    eventData.categories.map(async (category) => {
      const issues = await fetchIssuesByIds(eventData.period_id, category.issue_ids || []);
      return {
        ...category,
        issues: issues || [],
        type: category.type || "tie-in",
      };
    })
  );
  const event = { ...eventData, categories: categoriesData };
  return {
    props: {
      event,
    },
  };
}

const EventDetail = ({ event }) => {
  const [viewMode, setViewMode] = useState(VIEW_MODES.ALL_CHRONOLOGICAL);
  const isMobile = useMobileBreakpoint();
  const returnLink = `/period/${event?.period_id}/events`;
  const displayedContent = useMemo(() => {
    if (!event?.categories) return [];
    if (viewMode === VIEW_MODES.ALL_CHRONOLOGICAL) {
      const allIssues = event.categories.flatMap((cat) =>
        (cat.issues || []).map((issue) => ({ ...issue, categoryLabel: cat.label }))
      );
      return [
        {
          label: "Ordre chronologique",
          issues: allIssues.sort((a, b) => a.order - b.order),
        },
      ];
    }
    if (viewMode === VIEW_MODES.MAIN_ONLY) {
      return event.categories.filter((cat) => cat.type === "main");
    }
    return event.categories.filter((cat) => ["main", "tie-in"].includes(cat.type));
  }, [event, viewMode]);
  if (!event) return <ErrorMessage message="Aucun événement trouvé." />;
  return (
    <>
      <MetaTitle title={`${event.title} | Comics Tracker`} />
      <div className="container mx-auto px-8 py-12 bg-gray-900 text-white">
        <div className="mb-4">
          <Link href={returnLink} className="text-blue-300 hover:underline">
            &larr; Retour aux événements
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-red-400 mb-6 text-center">
          {event.title}
        </h1>
        <ViewModeSelector viewMode={viewMode} onViewModeChange={setViewMode} />
        <div className="flex flex-col items-center">
          <Image
            src={event.image}
            alt={event.title}
            width={400}
            height={600}
            priority
            className="rounded-lg shadow-md mb-6"
            style={{ objectFit: "cover" }}
          />
          <p className="text-base mb-8 text-center max-w-3xl">{event.description}</p>
        </div>
        <div>
          {displayedContent.map((category) => (
            <CategorySection
              key={category.label}
              category={category}
              eventId={event.id}
              showLabel={viewMode !== VIEW_MODES.ALL_CHRONOLOGICAL}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default EventDetail;