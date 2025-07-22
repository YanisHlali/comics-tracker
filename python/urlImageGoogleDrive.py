import json
import re
from pathlib import Path

def convert_google_drive_url(url):
    """Convertit une URL Google Drive en un lien de téléchargement direct."""
    if "uc?id=" in url:  # Déjà au bon format
        return url
    match = re.search(r"(?:/d/|id=)([a-zA-Z0-9_-]+)", url)
    if match:
        file_id = match.group(1)
        return f"https://drive.google.com/uc?&id={file_id}"
    return url  # Retourne l'URL d'origine si pas de correspondance

def process_editions_file(file_path):
    """Traite un fichier french_editions.json pour convertir les URLs."""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    modified = False
    for edition in data:
        if 'image' in edition:
            new_url = convert_google_drive_url(edition['image'])
            if new_url != edition['image']:
                edition['image'] = new_url
                modified = True
        if 'link' in edition:
            new_url = convert_google_drive_url(edition['link'])
            if new_url != edition['link']:
                edition['link'] = new_url
                modified = True
    
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        print(f"✅ Fichier mis à jour : {file_path}")
    else:
        print(f"ℹ️ Aucune modification nécessaire pour : {file_path}")

def main():
    """Fonction principale qui traite tous les fichiers french_editions.json."""
    base_path = Path("data")
    edition_files = list(base_path.rglob("french_editions.json"))
    
    print(f"🔍 {len(edition_files)} fichiers french_editions.json trouvés")
    for file_path in edition_files:
        process_editions_file(file_path)

if __name__ == "__main__":
    main()
