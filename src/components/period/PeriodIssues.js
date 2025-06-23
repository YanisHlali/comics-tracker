import React from "react";
import dynamic from "next/dynamic";

const IssueList = dynamic(() => import("@/components/IssueList"), { ssr: false });

export default function PeriodIssues({
  filteredIssues,
  frenchEditionStyle,
  setMinReadingNumber,
  showBookmark = true,
  frenchEditions = [],
}) {
  return (
    <IssueList
      filteredIssues={filteredIssues}
      frenchEditionStyle={frenchEditionStyle}
      setMinReadingNumber={setMinReadingNumber}
      showBookmark={showBookmark}
      frenchEditions={frenchEditions}
    />
  );
}