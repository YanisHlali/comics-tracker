import os
import json

base_directory = "./data"

def format_french_editions(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8-sig') as f:
            data = json.load(f)

        if not isinstance(data, list):
            print(f"⚠️  Format inattendu dans {file_path}, ignoré.")
            return

        formatted_editions = []
        for edition in sorted(data, key=lambda x: x.get("id", "")):
            formatted_edition = {
                "id": edition["id"],
                "french_title": edition.get("french_title", "").strip(),
                "issue_ids": edition.get("issue_ids", []),
                "link": edition.get("link", "").strip(),
                "image": edition.get("image", "").strip(),
            }

            if "table_content" in edition:
                formatted_edition["table_content"] = edition["table_content"]
            if "labels" in edition:
                formatted_edition["labels"] = edition["labels"]

            formatted_editions.append(formatted_edition)

        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(formatted_editions, f, indent=4, ensure_ascii=False)

        print(f"✅ {file_path} formaté avec succès.")

    except FileNotFoundError:
        print(f"❌ Erreur : Fichier non trouvé - {file_path}")
    except json.JSONDecodeError:
        print(f"❌ Erreur : Impossible de décoder le fichier JSON - {file_path}")

def format_issues(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8-sig') as f:
            data = json.load(f)

        if not isinstance(data, list):
            print(f"⚠️  Format inattendu dans {file_path}, ignoré.")
            return

        issues_with_period = sorted(
            [issue for issue in data if 'period_id' in issue and 'order' in issue], 
            key=lambda x: x['order']
        )
        issues_without_period = [issue for issue in data if 'period_id' not in issue]

        for issue in issues_without_period:
            if 'order' in issue:
                del issue['order']

        if issues_with_period:
            previous_order = issues_with_period[0]['order']
            for issue in issues_with_period[1:]:
                expected_order = previous_order + 1
                if issue['order'] != expected_order:
                    issue['order'] = expected_order
                previous_order = issue['order']

        corrected_data = issues_with_period + issues_without_period

        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(corrected_data, f, indent=4, ensure_ascii=False)

        print(f"✅ {file_path} formaté avec succès.")

    except FileNotFoundError:
        print(f"❌ Erreur : Fichier non trouvé - {file_path}")
    except json.JSONDecodeError:
        print(f"❌ Erreur : Impossible de décoder le fichier JSON - {file_path}")

for root, _, files in os.walk(base_directory):
    for file in files:
        file_path = os.path.join(root, file)
        if file == "french_editions.json":
            format_french_editions(file_path)
        elif file == "issues.json":
            format_issues(file_path)
