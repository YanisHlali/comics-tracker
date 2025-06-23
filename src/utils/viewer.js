export function openInViewer(link, title) {
  if (typeof window === "undefined") return;
  localStorage.setItem("driveLink", link);
  localStorage.setItem("editionTitle", title);
  window.open("/comic-viewer", "_blank");
}
