const fetchPeriods = async () => {
  try {
    const periodsData = await import("../../data/periods.json");
    return periodsData.default;
  } catch (error) {
    console.error("Erreur lors du chargement des périodes :", error);
    return [];
  }
};

export { fetchPeriods }; 