import { fetchPeriods } from "@/lib/periodsFetcher";

const fetchWriters = async () => {
  try {
    const writersData = await import("../../data/writers.json");
    return writersData.default;
  } catch (error) {
    console.error("Erreur lors du chargement des writers :", error);
    return [];
  }
};

const fetchPencillers = async () => {
  try {
    const pencillersData = await import("../../data/pencillers.json");
    return pencillersData.default;
  } catch (error) {
    console.error("Erreur lors du chargement des pencillers :", error);
    return [];
  }
};

const fetchPeriodById = async (periodId) => {
  try {
    const periodsData = await fetchPeriods();
    const period = periodsData.find((period) => period.id === periodId);
    return period || null;
  } catch (error) {
    console.error("Erreur lors de la récupération de la période :", error);
    return null;
  }
};

export {
  fetchWriters,
  fetchPencillers,
  fetchPeriodById
};
