import React from "react";
import IssueList from "@/components/IssueList";

export default function SerieIssues({ issues, frenchEditionStyle }) {
  return (
    <IssueList
      filteredIssues={issues}
      frenchEditionStyle={frenchEditionStyle}
      useScroll={false}
      showBookmark={false}
    />
  );
}
