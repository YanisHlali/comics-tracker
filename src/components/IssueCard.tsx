import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { PiBookmarkFill } from "react-icons/pi";
import { Issue } from "@/types";
import { useMobileBreakpoint } from "@/hooks/useResponsive";

interface IssueCardProps {
  issue: Issue;
  variant?: 'default' | 'compact' | 'featured' | 'detailed';
  showBookmark?: boolean;
  showOrder?: boolean;
  frenchEditionStyle?: 'color' | 'border' | 'shadow' | 'gray';
  hasFrenchEdition?: boolean;
  onBookmark?: (order: number) => void;
  className?: string;
}

interface IssueCardHeaderProps {
  order: number;
  showBookmark?: boolean;
  onBookmark?: () => void;
}

function IssueCardHeader({ order, showBookmark, onBookmark }: IssueCardHeaderProps): React.ReactElement {
  const isMobile = useMobileBreakpoint();
  
  return (
    <div className="relative w-[200px] h-8 mb-2 flex items-center justify-center">
      <span className="text-base font-bold text-gray-300">
        {order}.
      </span>
      {!isMobile && showBookmark && (
        <button
          onClick={onBookmark}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 opacity-0 group-hover:opacity-60 transition duration-200 focus:opacity-80 z-10"
          aria-label={`Marquer comme point de départ numéro ${order}`}
          type="button"
        >
          <PiBookmarkFill size={22} />
        </button>
      )}
    </div>
  );
}

interface IssueCardImageProps {
  issue: Issue;
  variant?: "default" | "compact" | "detailed" | "featured";
  frenchEditionStyle?: "color" | "gray" | "border" | "shadow";
  hasFrenchEdition?: boolean;
}

function IssueCardImage({ 
  issue, 
  variant = "default", 
  frenchEditionStyle, 
  hasFrenchEdition 
}: IssueCardImageProps): React.ReactElement {
  const shouldGrayscale = frenchEditionStyle === "gray" && !hasFrenchEdition;
  const altText = issue.title
    ? `Couverture de ${issue.title}`
    : `Couverture du numéro #${issue.order}`;

  return (
    <div className="issue-card-image-wrapper">
      <Image
        src={issue.image}
        alt={altText}
        width={140}
        height={210}
        className={`issue-card-image ${shouldGrayscale ? 'grayscale' : ''}`}
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        draggable={false}
      />
    </div>
  );
}

interface IssueCardTitleProps {
  issue: Issue;
  variant?: "default" | "compact" | "detailed" | "featured";
}

function IssueCardTitle({ issue, variant }: IssueCardTitleProps): React.ReactElement {
  const getTextSize = (): string => {
    switch (variant) {
      case "compact": return "text-xs";
      case "detailed": return "text-base";
      case "featured": return "text-base";
      default: return "text-sm";
    }
  };

  const getMinHeight = (): string => {
    switch (variant) {
      case "compact": return "min-h-[28px]";
      case "detailed": return "min-h-[40px]";
      case "featured": return "min-h-[40px]";
      default: return "min-h-[32px]";
    }
  };

  return (
    <div className={`flex items-center justify-center text-gray-300 text-center mt-1 leading-tight ${getTextSize()} ${getMinHeight()}`}>
      <b className="font-bold">
        {issue.title?.toUpperCase() || `#${issue.order}`}
      </b>
    </div>
  );
}

export default function IssueCard({
  issue,
  variant = "default",
  showBookmark = false,
  showOrder = true,
  frenchEditionStyle = "color",
  hasFrenchEdition = false,
  onBookmark,
  className = "",
}: IssueCardProps) {
  return (
    <li className={`issue-card transition-transform duration-300 hover:scale-105 relative group ${className}`}>
      {showOrder && (
        <IssueCardHeader 
          order={issue.order}
          showBookmark={showBookmark}
          onBookmark={() => onBookmark?.(issue.order)}
        />
      )}
      
      <Link href={`/issue/${issue.id}`} className="issue-card-link">
        <div className="issue-card-image-container">
          <IssueCardImage
            issue={issue}
            variant={variant}
            frenchEditionStyle={frenchEditionStyle}
            hasFrenchEdition={hasFrenchEdition}
          />
        </div>
        
        <div className="issue-card-title-container">
          <IssueCardTitle 
            issue={issue}
            variant={variant}
          />
        </div>
      </Link>
    </li>
  );
}