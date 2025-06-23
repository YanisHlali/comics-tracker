import { useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import Link from "next/link";
import IssueCard from "@/components/IssueCard";
import DisplayModeToggle from "@/components/DisplayModeToggle";
import useDisplayMode from "@/hooks/useDisplayMode";
import useResponsiveColumns from "@/hooks/useResponsiveColumns";
import useFrenchEditionsMap from "@/hooks/useFrenchEditionsMap";

const IssueList = ({
  filteredIssues,
  frenchEditionStyle,
  setMinReadingNumber,
  showBookmark,
  useScroll = true,
  frenchEditions = [],
}) => {
  const scrollParentRef = useRef(null);
  const { columns, isMobile } = useResponsiveColumns();
  const frenchEditionsMap = useFrenchEditionsMap(frenchEditions);

  const { displayMode, toggleDisplayMode } = useDisplayMode("displayMode");

  const handleSetMinReadingNumber = useCallback(
    (order) => {
      setMinReadingNumber(order);
      scrollParentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setMinReadingNumber]
  );

  const textVirtualizer = useVirtualizer({
    count: filteredIssues.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  const renderTextList = () =>
    !useScroll ? (
      <div>
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className="px-4 py-2 text-left"
            style={{ height: 48 }}
          >
            <Link href={`/issue/${issue.id}`}>
              <b>{issue.order}.</b> {issue.title.toUpperCase()}
            </Link>
          </div>
        ))}
      </div>
    ) : (
      <div
        ref={scrollParentRef}
        style={{ height: "calc(100vh - 80px)", overflow: "auto" }}
      >
        <div
          style={{
            height: `${textVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {textVirtualizer.getVirtualItems().map((virtualRow) => {
            const issue = filteredIssues[virtualRow.index];
            return (
              <div
                key={issue.id}
                ref={textVirtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "48px",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="px-4 py-2 text-left"
              >
                <Link href={`/issue/${issue.id}`}>
                  <b>{issue.order}.</b> {issue.title.toUpperCase()}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    );

  const renderImageList = () => {
    const columnClass =
      {
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
        5: "grid-cols-5",
      }[columns] || "grid-cols-1";

    return (
      <ul
        className={`grid gap-6 px-4 ${columnClass} list-none`}
        style={{ height: "calc(100vh - 80px)", overflow: "auto" }}
      >
        {filteredIssues.map((issue, index) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            index={index}
            isMobile={isMobile}
            hasFrenchEdition={!!frenchEditionsMap[issue.id]}
            onSetMinReadingNumber={handleSetMinReadingNumber}
            frenchEditionStyle={frenchEditionStyle}
            showBookmark={showBookmark}
          />
        ))}
      </ul>
    );
  };

  return (
    <div
      style={{ height: "100%", overflowX: "hidden" }}
      className="max-w-7xl mx-auto"
    >
      <DisplayModeToggle
        displayMode={displayMode}
        onToggle={toggleDisplayMode}
      />
      {displayMode === "text" ? renderTextList() : renderImageList()}
    </div>
  );
};

export default IssueList;
