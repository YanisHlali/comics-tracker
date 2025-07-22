import React, { useMemo, useState } from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import { ParsedUrlQuery } from "querystring";
import Image from "next/image";
import { serverDataFetcher } from "@/lib/serverDataFetcher";
import MetaTitle from "@/components/MetaTitle";
import IssueCard from "@/components/IssueCard";
import BackButton from "@/components/BackButton";
import { Issue, Event } from "@/types";

const VIEW_MODES = {
  ALL_CHRONOLOGICAL: "all_chronological",
  MAIN_ONLY: "main_only",
  MAIN_AND_TIEINS: "main_and_tieins",
} as const;

type ViewMode = (typeof VIEW_MODES)[keyof typeof VIEW_MODES];

interface Category {
  label: string;
  issues: Issue[];
  type: string;
  fetchError?: boolean;
}

interface EventData extends Event {
  period_id: string;
  categories: Category[];
  description?: string;
  image: string;
  title: string;
}

interface StaticParams extends ParsedUrlQuery {
  eventId: string;
}

interface EventDetailPageProps {
  event: EventData | null;
  fetchError: boolean;
}

interface ErrorMessageProps {
  message: string;
}

interface CategorySectionProps {
  category: Category;
  showLabel?: boolean;
}

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="text-red-500 text-lg">{message}</div>
  </div>
);

const CategorySection: React.FC<CategorySectionProps> = React.memo(
  ({ category, showLabel = true }) => (
    <div className="mb-8">
      {showLabel && (
        <h2 className="text-xl font-semibold text-red-400 mb-4 border-b-2 border-gray-600 pb-2 whitespace-normal sm:whitespace-nowrap break-words">
          {category.label}
        </h2>
      )}
      <ul className="issue-list">
        {category.issues?.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            hasFrenchEdition={true}
            frenchEditionStyle="color"
            showBookmark={false}
          />
        ))}
      </ul>
      {category.fetchError && (
        <div className="text-yellow-500 text-sm mt-2">
          Certaines issues n&apos;ont pas pu être chargées pour cette catégorie.
        </div>
      )}
    </div>
  )
);

CategorySection.displayName = 'CategorySection';

const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({ viewMode, onViewModeChange }) => (
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

export const getStaticPaths: GetStaticPaths<StaticParams> = async () => {
  return { 
    paths: [], 
    fallback: "blocking" as const 
  };
};

export const getStaticProps: GetStaticProps<any, StaticParams> = async ({ params }) => {
  if (!params?.eventId) {
    return {
      notFound: true,
    };
  }

  const { eventId } = params;

  try {
    const eventData = await serverDataFetcher.fetchEventById(eventId);
    if (!eventData) {
      return { notFound: true };
    }

    const categoriesData = await Promise.all(
      ((eventData as any).categories || []).map(async (category: any) => {
        try {
          const issues = await serverDataFetcher.fetchIssuesByIds(
            eventData.period_id,
            category.issue_ids || []
          );
          return {
            ...category,
            issues: issues || [],
            type: category.type || "tie-in",
          };
        } catch (catErr) {
          return {
            ...category,
            issues: [],
            type: category.type || "tie-in",
            fetchError: true,
          };
        }
      })
    );

    const event = { ...eventData, categories: categoriesData };

    return {
      props: {
        event,
        fetchError: false,
      },
      revalidate: 60,
    };
  } catch (err) {
    console.error("Error fetching event data:", err);
    return {
      props: {
        event: null,
        fetchError: true,
      },
      revalidate: 60,
    };
  }
};

const EventDetail: React.FC<EventDetailPageProps> = ({ event, fetchError }) => {
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODES.ALL_CHRONOLOGICAL);
  const returnLink = `/period/${event?.period_id || ""}/events`;

  const displayedContent = useMemo(() => {
    if (!event?.categories) return [];
    
    if (viewMode === VIEW_MODES.ALL_CHRONOLOGICAL) {
      const allIssues = event.categories.flatMap((cat) =>
        (cat.issues || []).map((issue) => ({
          ...issue,
          categoryLabel: cat.label,
        }))
      );
      return [
        {
          label: "Ordre chronologique",
          issues: allIssues.sort((a, b) => (a.order || 0) - (b.order || 0)),
          type: "chronological",
        },
      ];
    }
    
    if (viewMode === VIEW_MODES.MAIN_ONLY) {
      return event.categories.filter((cat) => cat.type === "main");
    }
    
    return event.categories.filter((cat) =>
      ["main", "tie-in"].includes(cat.type)
    );
  }, [event, viewMode]);

  if (fetchError) {
    return (
      <ErrorMessage message="Impossible de charger cet événement. Veuillez réessayer plus tard." />
    );
  }

  if (!event) {
    return <ErrorMessage message="Aucun événement trouvé." />;
  }

  return (
    <>
      <MetaTitle title={`${event.title} | Comics Tracker`} />
      <div className="container mx-auto px-8 py-12 bg-gray-900 text-white">
        <BackButton href={returnLink} />
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
            className="rounded-lg shadow-md mb-6 object-cover"
          />
          <p className="text-base mb-8 text-center max-w-3xl">
            {event.description}
          </p>
        </div>
        <div>
          {displayedContent.map((category) => (
            <CategorySection
              key={category.label}
              category={category}
              showLabel={viewMode !== VIEW_MODES.ALL_CHRONOLOGICAL}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default EventDetail;