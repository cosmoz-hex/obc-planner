# Architecture Technique - OBC Planner

## 🏗️ Vue d'Ensemble du Système

Le projet **OBC Planner** repose sur une architecture découplée **Client-Serveur** moderne et évolutive :

*   **Front-end :** Application SPA (Single Page Application) développée avec **Angular 20**, basée exclusivement sur des composants autonomes (*Standalone Components*), des *Signals* pour la réactivité et Tailwind CSS v4 pour l'interface.
*   **Back-end :** API REST développée avec **Spring Boot (Java)**, assurant la logique métier, la validation des données et les accès sécurisés à la base de données.
*   **Base de Données & Migrations :** Système relationnel SQL versionné avec **Flyway** pour garantir l'exécution séquentielle des scripts de migration.

---

## 🧩 Composants Front-end

L'interface utilisateur est découpée en composants modulaires et réutilisables situés dans `front-end/src/app/components/` :

*   **`AthleteListComponent` (`athlete-list/`) :** Composant principal qui gère la vue centrale, l'affichage du tableau des athlètes, le formulaire de filtrage dynamique en temps réel, ainsi que les actions de modification et de suppression.
*   **`AthleteFormModalComponent` (`athlete-form-modal/`) :** Modale réutilisable dédiée à la création et à l'édition des fiches athlètes à l'aide des formulaires réactifs d'Angular.
*   **`LayoutComponent` (`layout/`) :** Composant structurel englobant l'entête, le menu de navigation et le conteneur principal.

---

## ⚡ Gestion de l'État avec les Signals

Angular 20 introduit l'utilisation des **Signals**, implémentés dans l'application pour une gestion d'état réactive et performante :

*   **`signal()` :** Gère les états locaux simples (ouverture/fermeture des modales, sélection d'un identifiant d'athlète à supprimer).
*   **`toSignal()` :** Convertit les flux asynchrones (observables provenant des services HTTP et des formulaires) directement en signaux synchronisés.
*   **`computed()` :** Recalcule de manière optimale la liste filtrée des athlètes à chaque modification des critères de recherche ou des catégories sans surcharge de rendu.

---

## 🎨 Styles et Design System

*   **Tailwind CSS v4 :** Permet un stylisme rapide, moderne, entièrement responsive et adapté au mode sombre (*dark mode*).
*   **Web Awesome / Font Awesome :** Fournit les icônes vectorielles et éléments visuels intégrés de manière typée via TypeScript.
*   **Internationalisation (i18n) :** Prise en charge multilingue (français/anglais) gérée par `custom-translate.loader.ts` et les fichiers JSON dans `assets/i18n/`.

---

## 📂 Arborescence Complète du Projet

```text
obc-planner/
├── back-end/
│   ├── .mvn/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/                   <-- Entités, Contrôleurs et Services Spring Boot
│   │   │   └── resources/
│   │   │       ├── db.migration/       <-- Migrations SQL (Flyway)
│   │   │       │   ├── V20260628_202300__init.sql
│   │   │       │   └── V20260722_161600__F01_S02.sql  <-- Schéma & Seeding principal
│   │   │       ├── application.properties
│   │   │       └── secure-application.properties
│   │   └── test/
│   ├── mvnw / mvnw.cmd
│   ├── pom.xml                         <-- Dépendances Java (Maven)
│   └── start.sh / start.cmd
│
├── front-end/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/             <-- Interface Utilisateur (UI)
│   │   │   │   ├── athlete-form-modal/ <-- Formulaire de création / édition
│   │   │   │   │   ├── athlete-form-modal.component.css
│   │   │   │   │   ├── athlete-form-modal.component.html
│   │   │   │   │   ├── athlete-form-modal.component.spec.ts
│   │   │   │   │   └── athlete-form-modal.component.ts
│   │   │   │   ├── athlete-list/       <-- Vue tableau & filtres dynamiques
│   │   │   │   └── layout/             <-- Conteneur principal
│   │   │   ├── models/                 <-- Interfaces TypeScript (athlete.model.ts)
│   │   │   ├── services/               <-- Communication HTTP & Logique métier
│   │   │   │   ├── athlete.service.ts  <-- CRUD des athlètes
│   │   │   │   ├── custom-translate.loader.ts
│   │   │   │   └── test.service.ts
│   │   │   ├── app.component.ts
│   │   │   ├── app.config.ts           <-- Providers globaux
│   │   │   └── app.routes.ts           <-- Configuration du routage
│   │   ├── assets/
│   │   │   └── i18n/                   <-- Dictionnaires (fr.json, en.json)
│   │   ├── styles.css
│   │   └── webawesome.ts
│   ├── angular.json
│   ├── package.json
│   └── proxy.conf.json                 <-- Configuration Proxy dev (Contournement CORS)
│
├── docs/                               <-- Documentation technique
│   ├── architecture.md
│   ├── base-de-donnees.md
│   └── fonctionnalites.md
└── README.md