import React from "react";

export default function SerieHeader({ title, year }) {
  return (
    <h1 className="w-full text-2xl sm:text-3xl font-bold text-red-400 mb-6 border-b-2 border-gray-600 pb-2">
      {title} ({year})
    </h1>
  );
}