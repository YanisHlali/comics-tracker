import React from "react";
import Link from "next/link";

export default function PeriodHeader({ title, events, periodId, issueCounts }) {
  return (
    <div className="mx-auto px-4 max-w-screen-lg">
      <h1 className="w-full text-2xl sm:text-3xl font-bold text-red-400 mb-4 border-b-2 border-gray-600 pb-2">
        {title}
        <span className="text-white"> · Reading Order · </span>
        {events && events.length > 0 && (
          <>
            <Link className="hover:underline" href={`/period/${periodId}/events`}>
              Events
            </Link>
            <span className="text-white"> · </span>
          </>
        )}
        <Link className="hover:underline" href={`/period/${periodId}/series`}>
          Series
        </Link>
      </h1>
      <h2 className="text-xl font-semibold text-red-400 mb-4 border-b-2 border-gray-600 pb-2">
        <span className="text-green-400">
          {issueCounts?.with ?? 0} issues disponibles
        </span>
        <span className="text-gray-400">
          {" "}
          · {issueCounts?.without ?? 0} non traduites
        </span>
      </h2>
    </div>
  );
}