import json
import requests
import time

# Charger le fichier JSON
json_path = "data/marvel_now/french_editions.json"

with open(json_path, "r", encoding="utf-8") as file:
    data = json.load(file)

def log(message):
    """ Affiche un message avec un timestamp """
    print(f"[{time.strftime('%H:%M:%S')}] {message}")

def check_url(url):
    """ Vérifie si une URL est accessible. Retourne True si OK, False sinon. """
    log(f"🔍 Vérification de l'URL : {url}")
    try:
        response = requests.head(url, allow_redirects=True, timeout=5)
        status = response.status_code
        if status == 200:
            log(f"✅ URL accessible : {url}")
            return True
        else:
            log(f"⚠️ URL inaccessible (Code {status}) : {url}")
            return False
    except requests.RequestException as e:
        log(f"❌ Erreur lors de l'accès à {url} : {e}")
        return False

# Vérification des liens
log("🚀 Début de la vérification des liens...")
dead_links = []
dead_images = []
total_items = len(data)

for index, item in enumerate(data, start=1):
    edition_id = item.get("id", "Inconnu")
    log(f"\n📖 Vérification de l'édition {edition_id} ({index}/{total_items})")

    link = item.get("link", "").strip()
    if link:
        if not check_url(link):
            dead_links.append((edition_id, link))

    image = item.get("image", "").strip()
    if image:
        if not check_url(image):
            dead_images.append((edition_id, image))

# Résumé des résultats
log("\n📊 Résumé des vérifications :")

if dead_links:
    log("\n🔴 Liens morts (link) :")
    for edition, url in dead_links:
        log(f"- {edition}: {url}")

if dead_images:
    log("\n🟠 Images mortes (image) :")
    for edition, url in dead_images:
        log(f"- {edition}: {url}")

if not dead_links and not dead_images:
    log("\n✅ Aucun lien mort détecté.")

log("🎯 Vérification terminée !")
