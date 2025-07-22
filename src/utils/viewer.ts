import { logger } from "@/lib/errorHandler";

interface ViewerData {
  link: string;
  title: string;
  table_content?: number[];
  labels?: string[];
}

export function openInViewer(
  link: string, 
  title: string, 
  table_content?: number[], 
  labels?: string[]
): boolean {
  if (typeof window === "undefined") return false;

  logger.info("Opening viewer", { 
    title, 
    hasTableContent: !!table_content, 
    hasLabels: !!labels 
  });
  
  try {
    localStorage.setItem("driveLink", link);
    localStorage.setItem("editionTitle", title);
    localStorage.setItem("tableContents", JSON.stringify(table_content || []));
    localStorage.setItem("labels", JSON.stringify(labels || []));
    
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    localStorage.setItem("comicViewerReturnUrl", currentUrl);
    localStorage.setItem("comicViewerLastSession", Date.now().toString());
    localStorage.setItem("comicViewerLastPage", "0");
  } catch (error) {
    logger.warn("Failed to write to localStorage", { 
      error: (error as Error).message 
    });
  }

  let newWindow: Window | null = null;
  try {
    newWindow = window.open("/comic-viewer", "_blank");
  } catch (error) {
    logger.error("Failed to open new window", error);
    newWindow = null;
  }

  if (!newWindow) {
    window.location.href = "/comic-viewer";
    return false;
  }
  return true;
}

export function getViewerData(): ViewerData | null {
  if (typeof window === "undefined") return null;

  try {
    const link = localStorage.getItem("driveLink");
    const title = localStorage.getItem("editionTitle");
    const tableContent = localStorage.getItem("tableContents");
    const labels = localStorage.getItem("labels");

    if (!link || !title) return null;

    return {
      link,
      title,
      table_content: tableContent ? JSON.parse(tableContent) : undefined,
      labels: labels ? JSON.parse(labels) : undefined,
    };
  } catch (error) {
    logger.error("Failed to get viewer data", error);
    return null;
  }
}

export function clearViewerData(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("driveLink");
    localStorage.removeItem("editionTitle");
    localStorage.removeItem("tableContents");
    localStorage.removeItem("labels");
    localStorage.removeItem("comicViewerReturnUrl");
    localStorage.removeItem("comicViewerLastSession");
    localStorage.removeItem("comicViewerLastPage");
  } catch (error) {
    logger.warn("Failed to clear viewer data", { error: (error as Error).message });
  }
}