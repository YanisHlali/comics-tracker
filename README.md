# 📚 Comics Tracker

**Comics Tracker** est une application web Next.js pour explorer, filtrer et lire des comics, avec des données organisées par périodes éditoriales. Elle gère également les éditions françaises et permet l'ouverture rapide de lectures via Google Drive.

## ✨ Fonctionnalités principales

* 🔎 **Navigation par période** (Marvel Now, All-New All-Different, Ultimate...)
* 📖 **Affichage des issues** (couvertures, ordre de lecture)
* 🇫🇷 **Éditions françaises** : détection et visualisation
* 🖼️ **Lecteur intégré** avec gestion du défilement, double page, navigation au clavier et suivi de progression
* 📀 **État persistant** (mode d'affichage, dernières entrées...)
* ⚙️ **Responsive et mobile-friendly**

## 🤩 Architecture & Hooks personnalisés

### 🔧 Hooks UI & Comportement

* `useResponsiveColumns` : ajuste dynamiquement les colonnes selon la taille d’écran
* `useMobileBreakpoint` : détection du mode mobile
* `useDisplayMode` : bascule entre les vues image/texte avec persistance
* `useArrowNavigation` : navigation au clavier (← →)
* `useDebouncedValue` : pour les champs de recherche ou de filtrage

### 📊 Données

* `useFrenchEditionsMap` : crée une map rapide des issues dispos en édition française
* `dataFetcher.js` / `periodsFetcher.js` : prévus pour charger dynamiquement des données (non incluses dans ce dépôt)

### 📖 Lecture

* `useComicViewerState` : logique complète du lecteur (préchargement, navigation, progression, ping keep-alive)
* `usePollingTask` : gestion du polling backend sur les tâches asynchrones
* `useViewerKeepAlive` : ping périodique pour garder les sessions actives

## 📂 Données (non incluses)

Les fichiers de données nécessaires au fonctionnement complet de l’application (issues, événements, éditions françaises, etc.) ont été volontairement exclus de ce dépôt. Ils constituent un corpus structuré et enrichi manuellement, représentant une part essentielle de la valeur du projet.

Cette version est destinée à la démonstration de l’architecture technique, de l’interface et de l’expérience utilisateur.

Pour obtenir un aperçu ou discuter d’un accès limité à ces données dans un cadre privé ou professionnel, vous pouvez me contacter. un aperçu ou discuter d’un accès limité à ces données dans un cadre privé ou professionnel, vous pouvez me contacter.

## 🚀 Démarrage

```bash
git clone https://github.com/ton-pseudo/comics-tracker.git
cd comics-tracker
npm install
npm run dev
```

> ⚠️ Le projet démarre mais ne fonctionnera pas pleinement sans les fichiers de données. Un message de substitution ou une version de démo peut être ajoutée si besoin.

## 🛠️ Stack Technique

* **Next.js** + **React**
* **Tailwind CSS** pour le style
* **Hooks personnalisés** pour la logique d’UI et de lecteur
* **Fetch API** et proxy backend pour lecture Google Drive

## 📌 TODO / pistes d'amélioration

* Amélioration de la lecture en ligne
* Afficher plus de périodes
* Navigation plus fluide et responsive