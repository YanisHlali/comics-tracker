#!/usr/bin/env python3
"""
Script pour remplir automatiquement les labels dans french_editions.json
en se basant sur les issue_ids et les données issues.json correspondantes.
"""

import json
import os
import re
from pathlib import Path


def load_issues_data(data_dir):
    """Charge tous les fichiers issues.json de toutes les périodes"""
    issues_db = {}
    
    for period_dir in Path(data_dir).iterdir():
        if period_dir.is_dir():
            issues_file = period_dir / "issues.json"
            if issues_file.exists():
                try:
                    with open(issues_file, 'r', encoding='utf-8') as f:
                        issues = json.load(f)
                        
                    for issue in issues:
                        if 'id' in issue and 'title' in issue:
                            issues_db[issue['id']] = issue['title']
                            
                except Exception as e:
                    print(f"⚠️  Erreur lors du chargement de {issues_file}: {e}")
                    
    return issues_db


def generate_label_from_id(issue_id, issues_db):
    """
    Génère un label à partir d'un issue_id.
    Priorité: utilise le titre depuis issues.json si disponible,
    sinon formate l'ID en titre lisible.
    """
    # Si on trouve le titre dans la base de données des issues
    if issue_id in issues_db:
        return issues_db[issue_id]
    
    # Sinon, on formate l'ID pour créer un titre lisible
    return format_id_to_title(issue_id)


def format_id_to_title(issue_id):
    """
    Transforme un issue_id en titre lisible.
    Exemple: "all-new_all-different_avengers_2015_9" 
    -> "All-New, All-Different Avengers (2015) #9"
    """
    # Remplace les underscores par des espaces
    formatted = issue_id.replace('_', ' ')
    
    # Pattern pour identifier le format série_année_numéro
    pattern = r'^(.+?)\s+(\d{4})\s+(.+)$'
    match = re.match(pattern, formatted)
    
    if match:
        series_part, year, issue_number = match.groups()
        
        # Formate la partie série (titre propre avec majuscules)
        series_title = format_series_title(series_part)
        
        # Gère les numéros spéciaux (0.1, annual, etc.)
        if '.' in issue_number:
            issue_num = f"#{issue_number}"
        elif issue_number.isdigit():
            issue_num = f"#{issue_number}"
        else:
            # Pour des cas comme "annual_1" -> "Annual #1"
            special_parts = issue_number.split(' ')
            if len(special_parts) > 1 and special_parts[-1].isdigit():
                issue_num = f"{special_parts[0].title()} #{special_parts[-1]}"
            else:
                issue_num = f"#{issue_number}"
        
        return f"{series_title} ({year}) {issue_num}"
    
    # Fallback si le pattern ne correspond pas
    return format_series_title(formatted)


def format_series_title(title):
    """
    Formate le titre de série avec les bonnes majuscules et ponctuation.
    """
    # Remplace les tirets par des virgules pour "all-new all-different"
    title = re.sub(r'\ball-new\s+all-different\b', 'All-New, All-Different', title, flags=re.IGNORECASE)
    
    # Mots à capitaliser spécialement
    special_words = {
        'x-men': 'X-Men',
        'x-force': 'X-Force',
        'x-factor': 'X-Factor',
        'spider-man': 'Spider-Man',
        'spider-woman': 'Spider-Woman',
        'iron-man': 'Iron-Man',
        'ant-man': 'Ant-Man',
        'she-hulk': 'She-Hulk',
        'ms': 'Ms.',
        'dr': 'Dr.',
        'all-new': 'All-New',
        'all-different': 'All-Different',
        'guardians of the galaxy': 'Guardians of the Galaxy',
        'fantastic four': 'Fantastic Four',
        'avengers standoff': 'Avengers Standoff',
        'assault on pleasant hill': 'Assault on Pleasant Hill',
        'omega': 'Omega'
    }
    
    # Applique la capitalisation normale
    words = title.split()
    formatted_words = []
    
    for word in words:
        # Vérifie les mots spéciaux
        word_lower = word.lower()
        if word_lower in special_words:
            formatted_words.append(special_words[word_lower])
        else:
            # Capitalise la première lettre
            formatted_words.append(word.capitalize())
    
    return ' '.join(formatted_words)


def process_french_editions_file(file_path, issues_db):
    """Traite un fichier french_editions.json pour remplir les labels."""
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            editions = json.load(f)
            
    except Exception as e:
        print(f"❌ Erreur lors du chargement de {file_path}: {e}")
        return False
    
    modified = False
    
    for edition in editions:
        if 'issue_ids' in edition:
            # Génère les labels à partir des issue_ids
            new_labels = []
            for issue_id in edition['issue_ids']:
                label = generate_label_from_id(issue_id, issues_db)
                new_labels.append(label)
            
            # Met à jour les labels seulement s'ils sont vides ou différents
            if 'labels' not in edition or edition['labels'] != new_labels:
                edition['labels'] = new_labels
                modified = True
                print(f"✅ Labels mis à jour pour '{edition.get('french_title', edition.get('id', 'Unknown'))}'")
    
    # Sauvegarde si modifié
    if modified:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(editions, f, indent=4, ensure_ascii=False)
            print(f"💾 Fichier {file_path} sauvegardé avec succès")
            return True
        except Exception as e:
            print(f"❌ Erreur lors de la sauvegarde de {file_path}: {e}")
            return False
    else:
        print(f"ℹ️  Aucune modification nécessaire pour {file_path}")
        return True


def main():
    """Fonction principale"""
    # Configuration
    data_dir = "./data"
    
    print("🚀 Démarrage du script de génération automatique des labels...")
    print(f"📁 Répertoire de données: {data_dir}")
    
    # Charge toutes les données d'issues
    print("📚 Chargement des données issues...")
    issues_db = load_issues_data(data_dir)
    print(f"✅ {len(issues_db)} issues chargées depuis tous les fichiers issues.json")
    
    # Trouve tous les fichiers french_editions.json
    french_editions_files = []
    for period_dir in Path(data_dir).iterdir():
        if period_dir.is_dir():
            french_file = period_dir / "french_editions.json"
            if french_file.exists():
                french_editions_files.append(french_file)
    
    print(f"📋 {len(french_editions_files)} fichiers french_editions.json trouvés")
    
    # Traite chaque fichier
    success_count = 0
    for file_path in french_editions_files:
        print(f"\n🔄 Traitement de {file_path}")
        if process_french_editions_file(file_path, issues_db):
            success_count += 1
    
    # Résumé
    print(f"\n🎉 Traitement terminé!")
    print(f"✅ {success_count}/{len(french_editions_files)} fichiers traités avec succès")
    
    if success_count < len(french_editions_files):
        print("⚠️  Certains fichiers n'ont pas pu être traités - vérifiez les erreurs ci-dessus")


if __name__ == "__main__":
    main()