export function parseSerieInfo(issues) {
    const firstTitle = issues[0]?.title || "";
    const match = firstTitle.match(/^(.*?) \((\d{4})\)/);
    if (match) return { title: match[1], year: match[2] };
    return null;
}

export function getSeriePrefix(serieId) {
    const parts = serieId.split("_");
    if (parts.length >= 3 && /^\d{4}$/.test(parts.at(-1))) {
        return parts.slice(0, -1).join("_") + "_" + parts.at(-1);
    }
    return serieId;
}

export function parseSeriesFromIssues(issues) {
    const seriesMap = new Map();
    issues.forEach((issue) => {
        const match = issue.title.match(/^(.*?) ?#?\d* ?\((\d{4})\)/);
        if (!match) return;
        const [, title, year] = match;
        const serieId =
            title.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "_") + "_" + year;
        if (!seriesMap.has(serieId)) {
            seriesMap.set(serieId, { title, year, id: serieId, issues: [] });
        }
        seriesMap.get(serieId).issues.push(issue);
    });

    return Array.from(seriesMap.values()).map((serie) => {
        serie.issues.sort((a, b) => a.order - b.order);
        const firstIssue = serie.issues[0];
        return {
            ...serie,
            issueCount: serie.issues.length,
            image: firstIssue.image,
        };
    });
}