import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import useMobileBreakpoint from "@/hooks/useResponsive";
import useDisplayMode from "@/hooks/useDisplayMode";
import { Event } from "@/types";

interface EventCardProps {
  event: Event;
}

interface EventTextItemProps {
  event: Event;
}

interface EventListProps {
  events: Event[];
  className?: string;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const isMobile = useMobileBreakpoint();
  
  return (
    <li className="transition-transform duration-300 hover:scale-105">
      <div className="flex flex-col items-center">
        <Link href={`/event/${event.id}`}>
          <Image
            src={event.image || '/placeholder-event.jpg'}
            alt={event.name || "Couverture de l'événement"}
            width={isMobile ? 150 : 200}
            height={isMobile ? 205 : 275}
            className="rounded-lg shadow-md mb-2 object-cover"
            loading="lazy"
          />
        </Link>
        <div className="text-gray-300 text-center mt-2 leading-tight text-sm md:leading-normal md:text-lg">
          <b className="font-bold">{(event.name || '').toUpperCase()}</b>
        </div>
      </div>
    </li>
  );
};

const EventTextItem: React.FC<EventTextItemProps> = ({ event }) => (
  <li className="text-left">
    <Link 
      href={`/event/${event.id}`}
      className="hover:text-red-400 transition-colors"
    >
      {(event.name || '').toUpperCase()}
    </Link>
  </li>
);

const EventList: React.FC<EventListProps> = ({ events, className = '' }) => {
  const { displayMode, toggleDisplayMode } = useDisplayMode();

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => {
      const orderA = (a as any).order || 0;
      const orderB = (b as any).order || 0;
      return orderA - orderB;
    }),
    [events]
  );

  if (!events || events.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <p className="text-center text-gray-500 py-8">
          Aucun événement disponible.
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleDisplayMode}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm"
          type="button"
        >
          {displayMode === "text" ? "Vue grille" : "Vue liste"}
        </button>
      </div>

      {displayMode === "text" ? (
        <ul className="grid grid-cols-1 gap-4 p-4" aria-label="Liste des événements">
          {sortedEvents.map((event) => (
            <EventTextItem key={event.id} event={event} />
          ))}
        </ul>
      ) : (
        <ul
          className="issue-list p-4"
          aria-label="Grille d'événements"
        >
          {sortedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventList;