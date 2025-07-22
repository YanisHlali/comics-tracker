import React from "react";
import dynamic from "next/dynamic";
import { useMobileBreakpoint } from "@/hooks/useResponsive";

const ComicViewerDesktop = dynamic(
  () => import("@/components/ComicViewer/ComicViewerDesktop"), 
  { ssr: false }
);

const ComicViewerMobile = dynamic(
  () => import("@/components/ComicViewer/ComicViewerMobile"), 
  { ssr: false }
);

export default function ComicViewerPage(): React.ReactElement {
  const isMobile = useMobileBreakpoint(932);

  return isMobile
    ? <ComicViewerMobile />
    : <ComicViewerDesktop />;
}