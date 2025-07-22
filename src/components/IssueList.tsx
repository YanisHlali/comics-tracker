import { useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import Link from "next/link";
import { Issue, FrenchEdition } from "@/types";
import IssueCard from "@/components/IssueCard";
import useDisplayMode from "@/hooks/useDisplayMode";
import { useResponsiveColumns } from "@/hooks/useResponsive";
import useFrenchEditionsMap from "@/hooks/useFrenchEditionsMap";

const GRID_ROW_HEIGHT = 420;
const MOBILE_GRID_ROW_HEIGHT = 380;

interface IssueListProps {
  filteredIssues: Issue[];
  frenchEditionStyle?: "color" | "border" | "shadow";
  setMinReadingNumber?: (order: number) => void;
  showBookmark?: boolean;
  useScroll?: boolean;
  frenchEditions?: FrenchEdition[];
  periodId?: string | null;
}

export default function IssueList({
  filteredIssues,
  frenchEditionStyle = "color",
  setMinReadingNumber,
  showBookmark = false,
  useScroll = true,
  frenchEditions = [],
  periodId = null,
}: IssueListProps) {
  const scrollParentRef = useRef<HTMLDivElement>(null);
  const { columns, isMobile } = useResponsiveColumns();
  const frenchEditionsMap = useFrenchEditionsMap(frenchEditions, periodId);

  const { displayMode, toggleDisplayMode } = useDisplayMode();

  const onSetMinReadingNumber = useCallback(
    (order: number) => {
      setMinReadingNumber?.(order);
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

  const gridRowCount = Math.ceil(filteredIssues.length / columns);
  const rowHeight = isMobile ? MOBILE_GRID_ROW_HEIGHT : GRID_ROW_HEIGHT;

  const gridVirtualizer = useVirtualizer({
    count: gridRowCount,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  const renderTextList = () =>
    !useScroll ? (
      <div className="space-y-2">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className="flex items-center space-x-4 p-2 hover:bg-gray-800 rounded"
          >
            <span className="w-12 text-center text-sm text-gray-400">
              #{issue.order}
            </span>
            <Link
              href={`/issue/${issue.id}`}
              className="flex-1 hover:text-red-400 transition-colors"
            >
              {issue.title}
            </Link>
          </div>
        ))}
      </div>
    ) : (
      <div ref={scrollParentRef} className="issue-list-scroll-container">
        <div
          className="issue-list-virtual-container"
          style={{ height: `${textVirtualizer.getTotalSize()}px` }}
        >
          {textVirtualizer.getVirtualItems().map((virtualItem) => {
            const issue = filteredIssues[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                className="issue-list-text-virtual-item flex items-center space-x-4 p-2 hover:bg-gray-800 rounded"
                style={{
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <span className="w-12 text-center text-sm text-gray-400">
                  #{issue.order}
                </span>
                <Link
                  href={`/issue/${issue.id}`}
                  className="flex-1 hover:text-red-400 transition-colors"
                >
                  {issue.title}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    );

  const renderGridList = () =>
    !useScroll ? (
      <ul className="issue-list">
        {filteredIssues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            variant="default"
            showBookmark={showBookmark}
            showOrder={true}
            frenchEditionStyle={frenchEditionStyle}
            hasFrenchEdition={!!frenchEditionsMap[issue.id]}
            onBookmark={onSetMinReadingNumber}
          />
        ))}
      </ul>
    ) : (
      <div ref={scrollParentRef} className="issue-list-scroll-container">
        <div
          className="issue-list-virtual-container"
          style={{ height: `${gridVirtualizer.getTotalSize()}px` }}
        >
          <ul className="issue-list-virtualized">
            {gridVirtualizer.getVirtualItems().map((virtualRow) => {
              const startIndex = virtualRow.index * columns;
              const endIndex = Math.min(
                startIndex + columns,
                filteredIssues.length
              );
              const issues = filteredIssues.slice(startIndex, endIndex);

              return (
                <div
                  key={virtualRow.key}
                  className={`issue-list-virtual-row cols-${columns}`}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {issues.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      variant="default"
                      showBookmark={showBookmark}
                      showOrder={true}
                      frenchEditionStyle={frenchEditionStyle}
                      hasFrenchEdition={!!frenchEditionsMap[issue.id]}
                      onBookmark={onSetMinReadingNumber}
                    />
                  ))}
                </div>
              );
            })}
          </ul>
        </div>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-gray-400">
          {filteredIssues.length} issue{filteredIssues.length > 1 ? "s" : ""}
        </span>
        <button
          onClick={toggleDisplayMode}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          type="button"
          aria-label={
            displayMode === "grid"
              ? "Basculer vers la vue liste"
              : "Basculer vers la vue grille"
          }
        >
          {displayMode === "grid" ? "Vue liste" : "Vue grille"}
        </button>
      </div>

      {displayMode === "text" ? renderTextList() : renderGridList()}
    </div>
  );
}
