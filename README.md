
# Comics Tracker

Comics Tracker est une application web développée avec [Next.js](https://nextjs.org/) et TypeScript, permettant de suivre, explorer et visualiser les comics Marvel par périodes, séries, issues, événements et éditions françaises.

## Fonctionnalités principales

- **Navigation par périodes** : Parcours chronologique des comics Marvel.
- **Liste des issues** : Visualisation détaillée des issues, avec filtres avancés (auteurs, titre, édition française, etc.).
- **Séries** : Regroupement des issues par séries, avec recherche et statistiques de traduction.
- **Événements** : Accès aux grands événements Marvel, avec catégorisation des issues principales et tie-ins.
- **Éditions françaises** : Identification visuelle des issues traduites et accès aux informations d’édition.
- **Comic Viewer** : Lecteur d’images optimisé pour desktop et mobile, avec navigation, zoom, et gestion des pages doubles.
- **Filtres et recherche** : Filtres dynamiques pour affiner la recherche par titre, auteur, période, etc.
- **Interface moderne** : UI responsive, dark mode, animations, et navigation fluide.

## Structure du projet

```
src/
  components/         // Composants React réutilisables (IssueCard, EventList, ComicViewer, etc.)
  contexts/           // Contextes globaux (AppContext)
  hooks/              // Hooks personnalisés (useFilters, useComicViewerState, etc.)
  lib/                // Fonctions utilitaires pour la récupération des données (serverDataFetcher, dataFetcher)
  pages/              // Pages Next.js (index, comic-viewer, event, issue, period, serie, api)
  styles/             // Fichiers CSS (globals.css)
  types/              // Types TypeScript pour les entités du projet
  utils/              // Fonctions utilitaires (filters, issues, sanitize, series, viewer)
public/               // Images et assets statiques
scripts/              // Scripts Node.js pour le nettoyage et l’analyse du code
```

## Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/YanisHlali/comics-tracker-dev.git
   cd comics-tracker-dev
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configurer les variables d’environnement**
   - Créer un fichier `.env.local` à la racine et définir l’URL de l’API :
     ```
     NEXT_PUBLIC_API_BASE_URL=https://ton-api-marvel.com/
     ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```
   Accède à [http://localhost:3000](http://localhost:3000) pour voir l’application.

## Scripts utiles

- `npm run build` : Build de l’application pour la production.
- `npm run start` : Démarrage du serveur Next.js en mode production.
- `npm run lint` : Linting du code.
- `npm run type-check` : Vérification des types TypeScript.
- `npm run cleanup:all` : Nettoyage et analyse du code (imports/exports).

## Technologies utilisées

- **Next.js** (React, SSR, SSG)
- **TypeScript**
- **TailwindCSS** (UI moderne et responsive)
- **Framer Motion** (animations)
- **Lucide React** et **React Icons** (icônes)
- **Vercel Analytics** (statistiques)

## Déploiement

Le projet est optimisé pour un déploiement sur [Vercel](https://vercel.com/). Suivre la documentation Next.js pour la mise en production.

## Licence

Ce projet est sous licence ISC.
