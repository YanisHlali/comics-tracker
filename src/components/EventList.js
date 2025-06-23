import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import useMobileBreakpoint from "@/hooks/useMobileBreakpoint";
import useDisplayMode from "@/hooks/useDisplayMode";
import DisplayModeToggle from "@/components/DisplayModeToggle";

const EventCard = React.memo(({ event }) => {
  const isMobile = useMobileBreakpoint();
  return (
    <li className="transition-transform duration-300 hover:scale-105">
      <div className="flex flex-col items-center">
        <Link href={`/event/${event.id}`}>
          <Image
            src={event.image}
            alt={event.title || "Couverture de l'événement"}
            width={isMobile ? 150 : 200}
            height={isMobile ? 205 : 275}
            className="rounded-lg shadow-md mb-2"
            style={{ objectFit: "cover" }}
            loading="lazy"
          />
        </Link>
        <div className="text-gray-300 text-center mt-2 leading-tight text-sm md:leading-normal md:text-lg">
          <b className="font-bold">{event.title.toUpperCase()}</b>
        </div>
      </div>
    </li>
  );
});

const EventTextItem = React.memo(({ event }) => (
  <li className="text-left">
    <Link href={`/event/${event.id}`}>{event.title.toUpperCase()}</Link>
  </li>
));

const EventList = ({ events }) => {
  const { displayMode, toggleDisplayMode } = useDisplayMode("eventDisplayMode");

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [events]
  );

  return (
    <div className="w-full">
      <DisplayModeToggle displayMode={displayMode} onToggle={toggleDisplayMode} />
      {displayMode === "text" ? (
        <ul className="grid grid-cols-1 gap-4 p-4" aria-label="Liste des événements">
          {sortedEvents.map((event) => (
            <EventTextItem key={event.id} event={event} />
          ))}
        </ul>
      ) : (
        <ul
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4"
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
