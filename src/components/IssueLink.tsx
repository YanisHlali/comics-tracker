import React from 'react';
import Link from 'next/link';
import { Issue } from '@/types';

interface IssueLinkProps {
  issue: Issue;
  children?: React.ReactNode;
  className?: string;
  showTitle?: boolean;
  showOrder?: boolean;
  target?: '_blank' | '_self' | '_parent' | '_top';
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

const IssueLink: React.FC<IssueLinkProps> = ({
  issue,
  children,
  className = '',
  showTitle = false,
  showOrder = false,
  target = '_self',
  onClick
}) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    if (onClick) {
      onClick(event);
    }
  };

  const linkContent = children || (
    <span className="issue-link-content">
      {showOrder && issue.order && (
        <span className="issue-order">#{issue.order}</span>
      )}
      {showTitle && issue.title && (
        <span className={`issue-title ${showOrder ? 'ml-2' : ''}`}>
          {issue.title}
        </span>
      )}
      {!children && !showTitle && !showOrder && (
        <span>{issue.title || `Issue #${issue.order || issue.id}`}</span>
      )}
    </span>
  );

  return (
    <Link
      href={`/issue/${issue.id}`}
      className={`issue-link hover:text-red-400 transition-colors ${className}`}
      target={target}
      onClick={handleClick}
      title={issue.title || `Issue #${issue.order || issue.id}`}
    >
      {linkContent}
    </Link>
  );
};

export default IssueLink;