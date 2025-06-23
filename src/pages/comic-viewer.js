import dynamic from "next/dynamic";
import useComicViewerState from "@/hooks/useComicViewerState";
import useMobileBreakpoint from "@/hooks/useMobileBreakpoint";

const ComicViewerDesktop = dynamic(() => import("@/components/comicViewer/ComicViewerDesktop"), { ssr: false });
const ComicViewerMobile = dynamic(() => import("@/components/comicViewer/ComicViewerMobile"), { ssr: false });

export default function ComicViewerPage() {
  const state = useComicViewerState();
  const isMobile = useMobileBreakpoint(932);

  return isMobile
    ? <ComicViewerMobile {...state} />
    : <ComicViewerDesktop {...state} />;
}
