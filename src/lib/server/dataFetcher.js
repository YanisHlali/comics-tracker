import path from "path";
import fs from "fs/promises";

export const loadPeriodData = async (periodName, fileType) => {
  try {
    const filePath = path.join(process.cwd(), "data", periodName, `${fileType}.json`);
    const fileContents = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Erreur lors du chargement du fichier de données :", error);
    return null;
  }
};

const fetchIssuesByPeriod = async (periodName) =>
  await loadPeriodData(periodName, "issues");

const fetchEventsByPeriod = async (periodName) =>
  await loadPeriodData(periodName, "events");

const fetchFrenchEditionsByPeriod = async (periodName) => {
  try {
    return await loadPeriodData(periodName, "french_editions");
  } catch (error) {
    console.error("Erreur lors du chargement des éditions françaises :", error);
    return [];
  }
};

const fetchFrenchEditionsByIssue = async (periodName, issueId) => {
  try {
    const frenchEditions = await fetchFrenchEditionsByPeriod(periodName);
    return frenchEditions.filter(
      (edition) =>
        Array.isArray(edition.issue_ids) && edition.issue_ids.includes(issueId)
    );
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des éditions françaises :",
      error
    );
    return [];
  }
};

const fetchEventById = async (eventId) => {
  const periods = [
    "marvel_now",
    "ultimate_universe",
    "all_new_all_different"
  ];
  for (const period of periods) {
    const events = await loadPeriodData(period, "events");
    if (Array.isArray(events)) {
      const found = events.find(e => e.id === eventId);
      if (found) return { ...found, period_id: period };
    }
  }
  return null;
};

const fetchIssuesByIds = async (periodId, issueIds) => {
  const issues = await loadPeriodData(periodId, "issues");
  if (!Array.isArray(issues)) return [];
  return issues.filter(issue => issueIds.includes(issue.id));
};

export {
  fetchIssuesByPeriod,
  fetchEventsByPeriod,
  fetchFrenchEditionsByPeriod,
  fetchFrenchEditionsByIssue,
  fetchEventById,
  fetchIssuesByIds,
}; 