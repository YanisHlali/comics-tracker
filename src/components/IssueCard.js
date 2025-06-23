import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { PiBookmarkFill } from "react-icons/pi";

const IssueCard = React.memo(({
  issue,
  index,
  isMobile,
  hasFrenchEdition,
  onSetMinReadingNumber,
  frenchEditionStyle,
  showBookmark
}) => {
  const imageStyle =
    frenchEditionStyle === "gray" && !hasFrenchEdition
      ? { filter: "grayscale(100%)" }
      : {};

  const altText = issue.title ? issue.title : "Issue cover";

  return (
    <li className="transition-transform duration-300 hover:scale-105 relative group flex flex-col items-center h-full pt-3">
      <Link
        href={`/issue/${issue.id}`}
        tabIndex={0}
        className="w-full flex flex-col items-center h-full"
      >
        <div className="relative w-[200px] h-8 mb-2 flex items-center justify-center">
          <span className="text-base font-bold text-gray-300">
            {issue.order}.
          </span>
          {!isMobile && showBookmark && (
            <button
              tabIndex={0}
              onClick={e => {
                e.preventDefault();
                onSetMinReadingNumber(issue.order);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 opacity-0 group-hover:opacity-60 transition duration-200 focus:opacity-80 z-10"
              aria-label={`Marquer comme point de départ numéro ${issue.order}`}
            >
              <PiBookmarkFill size={22} />
            </button>
          )}
        </div>
        <Image
          src={issue.image}
          alt={altText}
          width={isMobile ? 150 : 200}
          height={isMobile ? 205 : 275}
          priority={index < 20}
          loading={index >= 20 ? "lazy" : undefined}
          className="rounded-lg shadow-md mb-1"
          style={{ objectFit: "cover", ...imageStyle }}
          draggable={false}
        />
        <div className="flex items-center justify-center text-gray-300 text-center mt-1 leading-tight text-base min-h-[44px]">
          <b className="font-bold">{issue.title.toUpperCase()}</b>
        </div>
      </Link>
    </li>
  );
});

export default IssueCard;
