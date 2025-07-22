import os
import json

# Dossier contenant les fichiers JSON
base_directory = "./data"

# Fonction pour vérifier les issue_ids dans events.json par rapport à issues.json
def verify_issue_ids(events_file, issues_file):
    try:
        print(f"Chargement des fichiers : {events_file} et {issues_file}")

        # Charger les fichiers JSON
        with open(events_file, 'r', encoding='utf-8-sig') as f:
            events = json.load(f)
        with open(issues_file, 'r', encoding='utf-8-sig') as f:
            issues = json.load(f)
        print("Fichiers chargés avec succès.")

        # Filtrer les événements pour ne traiter que ceux de 'marvel_now'
        marvel_now_events = [event for event in events if event.get('period_id') == 'marvel_now']
        if not marvel_now_events:
            print("❌ Aucun événement avec period_id 'marvel_now' trouvé.")
            return

        print(f"{len(marvel_now_events)} événement(s) trouvés avec period_id 'marvel_now'.")

        # Affichage d'un extrait pour vérifier la structure
        print("Extrait des événements filtrés :")
        for event in marvel_now_events[:2]:
            print(json.dumps(event, indent=4, ensure_ascii=False))
        
        # Extraction des issue_ids depuis les catégories (ou directement s'ils existent)
        all_event_issue_ids = []
        for event in marvel_now_events:
            print(f"Traitement de l'événement : {event.get('title', 'Sans titre')}")
            issue_ids = []
            if 'issue_ids' in event:
                issue_ids = event['issue_ids']
            elif 'categories' in event:
                for category in event.get('categories', []):
                    issue_ids.extend(category.get('issue_ids', []))
            print(f"  Issue IDs trouvés : {issue_ids}")
            all_event_issue_ids.extend(issue_ids)

        print(f"Vérification des {len(all_event_issue_ids)} issue_ids extraits des événements...")

        # Création d'un ensemble des IDs des issues pour une recherche rapide
        issue_ids_in_issues = {issue['id'] for issue in issues}
        
        # Vérification de l'existence de chaque issue_id et affichage uniquement des non trouvés
        not_found = []
        for issue_id in all_event_issue_ids:
            if issue_id not in issue_ids_in_issues:
                not_found.append(issue_id)

        if not_found:
            print("Issue IDs non trouvés :")
            for issue_id in not_found:
                print(f" - {issue_id}")
        else:
            print("Toutes les issue IDs extraites existent dans issues.json.")

    except FileNotFoundError:
        print("❌ Erreur : Fichier non trouvé.")
    except json.JSONDecodeError:
        print("❌ Erreur : Impossible de décoder le fichier JSON.")
    except Exception as e:
        print(f"❌ Erreur inconnue : {e}")

# Recherche des fichiers events.json et issues.json dans l'arborescence,
# en ne considérant que ceux dont le chemin contient "marvel_now"
events_file_path = None
issues_file_path = None

for root, _, files in os.walk(base_directory):
    if "marvel_now" not in root:
        continue
    for file in files:
        file_path = os.path.join(root, file)
        if file == "events.json":
            events_file_path = file_path
        elif file == "issues.json":
            issues_file_path = file_path

if events_file_path and issues_file_path:
    print(f"Fichiers trouvés :\n - {events_file_path}\n - {issues_file_path}")
    verify_issue_ids(events_file_path, issues_file_path)
else:
    print("❌ Fichiers events.json ou issues.json non trouvés dans un répertoire 'marvel_now'.")
