import requests
from bs4 import BeautifulSoup
import json
import os

def fetch_marvel_comic_data(url, order, period_id):
    try:
        print(f"Récupération des données depuis {url}...")
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        title_element = soup.select_one(".ComicMasthead__Title")
        title = title_element.text.strip() if title_element else ""

        writers = [
            {
                "id": a.text.strip().lower().replace(" ", "_"),
                "name": a.text.strip()
            }
            for a in soup.select("#themeProvider div.ComicMasthead__Content ul:nth-child(4) li:nth-child(1) span > a")
        ]

        pencillers = [
            {
                "id": a.text.strip().lower().replace(" ", "_"),
                "name": a.text.strip()
            }
            for a in soup.select("#themeProvider div.ComicMasthead__Content ul:nth-child(4) li:nth-child(2) span > a")
        ]

        result = {
            "id": url.split("/")[-1],
            "order": order,
            "pencillers": [p["id"] for p in pencillers],
            "period_id": period_id,
            "title": title,
            "writers": [w["id"] for w in writers],
        }

        return result, writers, pencillers
    except Exception as e:
        print(f"Erreur lors de la récupération des données depuis {url}: {e}")
        return None, [], []

def update_creators_json(file_path, new_creators):
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)
    else:
        data = []

    existing_ids = {item["id"] for item in data}
    added = False

    for creator in new_creators:
        if creator["id"] not in existing_ids:
            data.append(creator)
            added = True

    if added:
        with open(file_path, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=2, ensure_ascii=False)
        print(f"Fichier mis à jour : {file_path}")
    else:
        print(f"Aucun nouvel élément ajouté dans {file_path}.")

def add_issue_to_period(base_data_path, period_id, issue_data):
    base_path = os.path.join(base_data_path, period_id)
    period_path = os.path.join(base_path, "issues.json")

    os.makedirs(base_path, exist_ok=True)

    if os.path.exists(period_path):
        with open(period_path, "r", encoding="utf-8") as file:
            issues = json.load(file)
    else:
        issues = []

    max_order = max((issue.get("order", 0) for issue in issues), default=0)
    issue_data["order"] = max_order + 1

    if issue_data not in issues:
        issues.append(issue_data)
        with open(period_path, "w", encoding="utf-8") as file:
            json.dump(issues, file, indent=2, ensure_ascii=False)
        print(f"Issue ajoutée à {period_path} avec l'ordre {issue_data['order']}.")
    else:
        print(f"L'issue existe déjà dans {period_path}.")

if __name__ == "__main__":
    url = "https://www.marvel.com/comics/issue/121270/ultimate_wolverine_2025_1"
    period_id = "ultimate_universe"

    base_data_path = os.path.join("data")

    comic_data, writers, pencillers = fetch_marvel_comic_data(url, None, period_id)

    if comic_data:
        writers_file = os.path.join(base_data_path, "writers.json")
        pencillers_file = os.path.join(base_data_path, "pencillers.json")

        update_creators_json(writers_file, writers)
        update_creators_json(pencillers_file, pencillers)

        add_issue_to_period(base_data_path, period_id, comic_data)

        print(json.dumps(comic_data, indent=2, ensure_ascii=False))
