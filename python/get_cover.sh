#!/bin/bash

# Vérifier si un fichier CBR ou CBZ est présent (ignorer les fichiers en cours de téléchargement)
cbr_file=$(ls *.cbr 2>/dev/null | grep -v ".crdownload" | head -n 1)
cbz_file=$(ls *.cbz 2>/dev/null | grep -v ".crdownload" | head -n 1)

archive="${cbr_file:-$cbz_file}"

if [[ -z "$archive" ]]; then
    echo "Aucun fichier .cbr ou .cbz trouvé."
    exit 1
fi

echo "📦 Extraction de : $archive"

# Vérifier si les outils nécessaires sont installés
if ! command -v file &>/dev/null; then
    echo "❌ 'file' n'est pas installé. Installe-le avec : sudo apt install file"
    exit 1
fi
if ! command -v unrar &>/dev/null; then
    echo "❌ 'unrar' n'est pas installé. Installe-le avec : sudo apt install unrar"
    exit 1
fi
if ! command -v unzip &>/dev/null; then
    echo "❌ 'unzip' n'est pas installé. Installe-le avec : sudo apt install unzip"
    exit 1
fi
if ! command -v convert &>/dev/null; then
    echo "❌ 'convert' (ImageMagick) n'est pas installé. Installe-le avec : sudo apt install imagemagick"
    exit 1
fi

# Détecter le type réel du fichier
file_type=$(file --mime-type -b "$archive")

# Créer un dossier d'extraction
extract_dir="output"
mkdir -p "$extract_dir"

case "$file_type" in
    application/x-rar)
        echo "📂 Format RAR détecté"
        unrar x -o+ "$archive" "$extract_dir/" ;;
    application/zip)
        echo "📂 Format ZIP détecté (CBZ possible)"
        unzip -o "$archive" -d "$extract_dir/" ;;
    *)
        echo "❌ Format inconnu : $file_type"
        exit 1 ;;
esac

if [[ ! "$(ls -A "$extract_dir")" ]]; then
    echo "❌ Aucune extraction réussie."
    exit 1
fi

first_image=$(find "$extract_dir" -type f \( -iname "*.jpg" -o -iname "*.png" -o -iname "*.webp" \) \
    | grep -Ev "thumb|cover_small" \
    | sort | head -n 1)

if [[ -z "$first_image" ]]; then
    echo "❌ Aucune image trouvée après extraction."
    exit 1
fi

echo "📷 Première image trouvée : $first_image"

output_name=$(basename "$archive" .cbr)
output_name=$(basename "$output_name" .cbz)
output_image="${output_name}.webp"

if [[ "$first_image" == *.webp ]]; then
    echo "✅ L'image est déjà en WebP, copie directe."
    cp "$first_image" "$output_image"
else
    echo "🎨 Conversion en WebP..."
    convert "$first_image" -quality 90 "$output_image"
fi

echo "✅ Traitement terminé : $output_image"
