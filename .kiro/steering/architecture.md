---
title: Architecture
inclusion: always
---

# Architecture — OBC Planner

> Ce fichier doit être mis à jour à chaque modification structurelle (libs, packages, tables, APIs). Historique des évolutions : .kiro/archive/architecture-changelog.md

> Pour le détail : voir `architecture-api.md` (endpoints REST, DTOs) et `architecture-db.md` (schéma des tables, risques & dettes). Ils sont chargés à l'ouverture des fichiers concernés (controllers/dto/services/models ; sql/entities/repositories).

---

## Backend — Spring Boot 4.1 / Java 25

### Structure des packages

```
com.example.backend
├── BackEndApplication.java
├── annotations/        # Annotations custom : contrôle d'accès, AOP, validators (email, téléphone)
├── aspects/            # Implémentations AOP des annotations (logs, activation conditionnelle)
├── configuration/      # Sécurité Spring, CORS, JWT filter chain
├── controllers/        # Endpoints REST — délèguent aux services, aucune logique métier
├── dto/                # Objets de transfert (*Request / *Response)
├── entities/           # Entités JPA mappées sur les tables PostgreSQL
├── filter/             # Filtres HTTP (validation JWT sur chaque requête)
├── interceptor/        # Intercepteurs MVC (contrôle d'accès par annotation)
├── repositories/       # Interfaces Spring Data JPA
├── services/           # Interfaces métier + implémentations (sous-dossier impl/)
│                       #   dont le moteur de génération de programme
│                       #   (ProgrammeGenerationService) + le service CRUD (ProgrammeService)
└── utils/              # Utilitaires transversaux (dates, strings, numbers, objects)
                        #   dont les calculateurs de génération : WeekPercentCalculator,
                        #   ProgrammeChargeCalculator, MusculationQueueBuilder
                        #   (réduit à bitmaskToGoals : conversion du bitmask de
                        #    musculation en objectifs ; la file rotative a été retirée)
```

Entités JPA de la génération de programme : `Programme` **1 — N** `ProgrammeWeek` **1 — N** `ProgrammeTraining` (séance) **1 — N** `ProgrammeExercice` (exercice) **1 — N** `ProgrammeSeries` (série) — relations `@OneToMany` en cascade ALL + `orphanRemoval`, fetch `LAZY`, `@BatchSize` sur chaque collection (`ProgrammeWeek.programmeTrainings`, `ProgrammeTraining.programmeExercices`, `ProgrammeExercice.programmeSeries`) permettant la descente des 3 niveaux via un seul `@EntityGraph` sur `programmeWeeks`, relations exclues de `equals`/`hashCode`/`toString`. `RefTimeline` mappe la table `ref_timelines` (seedée) consommée par le moteur. Enum `ProgrammeWeekType {F,T,S,A,D,PC}` (distinct de `WeekTypeRef`, sans `PC`). Exception `ValidationException` → HTTP 400 (domaine fonctionnel hors bornes), mappée dans l'advice existant. `ApiExceptionHandler` gère aussi `HttpMessageNotReadableException` → 400 `VALIDATION_ERROR` (« Corps de requête invalide. », sans écho du JSON reçu) sur **tous** les endpoints (auparavant 500).

DTOs de création de programme : `ProgrammeCreateRequest` (payload API, validé : `athleteId` et `profile` obligatoires, `evaluationId` optionnel) ; `ProgrammeProfileRequest` (synthèse saisie, 10 champs) ; `ProgrammeGenerationRequest` (paramètres internes `evaluationId`/`weeks`/`frequency`/`duration`/`startDate`/`snatchGoal`/`cjGoal`, non exposé par l'API, consommé par `ProgrammeGenerationService.generate`, `validateDomain` et `refresh` via `toCreateRequest`). `ProgrammeCreateRequest#toGenerationRequest(evaluationId)` projette la requête sur l'évaluation résolue. `EvaluationMapper` porte la comparaison de synthèse (`matches`, normalisation `musculation` nul → 0 et points faibles vides → nul) et les constructions `toNewSummary` / `toDuplicatedSummary` / `copyDetail`.

Cases **Renfo spécifique** (`RF`) du moteur : résolues par `ProgrammeGenerationServiceImpl.resolveRenfo(...)` (émission d'un **seul** exercice, pas d'alternatives « ou »), choisi par **rotation hebdomadaire** `index = (weekNumber - 1) % taille_liste`. Trois files/curseurs **indépendants** par mouvement (Arraché `SN`, Épaulé `CL`, Jeté `JK`) associés dans l'ordre d'apparition aux 3 cases RF de la semaine ; chaque file est l'ensemble des exercices `RF` du goal composé `{mouvement}_{objectif technique de l'éval}` (`composeRenfoGoal(...)` → `findRenfoExercices(...)` via `RefExerciceRepository.findByExerciceTypeAndGoalOrderByRefExerciceIdAsc`, tri `refExerciceId` déterministe, `@EntityGraph` sur `sets`). Charges calculées par `emitExercice(...)` (référence `SN`/`CJ` + pourcentage). Repli « à définir » si l'objectif technique est absent, si aucun protocole ne correspond, ou si le rang de case dépasse 3.

---

## Frontend — Angular 22

### Structure des modules

```
src/app/
├── app.component.*     # Composant racine (bootstrap, détection langue navigateur)
├── app.config.ts       # Configuration standalone (providers, i18n, HTTP)
├── app.routes.ts       # Définition des routes (lazy-loaded)
├── components/         # Composants communs / réutilisables
│   ├── layout/         # Shell principal : header, sidebar (wa-page), footer, sélecteur de langue
│   ├── data-grid/      # Grille générique (pagination/tri côté serveur, colonnes projetables)
│   ├── confirm-dialog/ # Modale de confirmation générique
│   └── wizard/         # Modale de wizard à étapes générique : app-wizard-dialog possède le
│                       # wa-dialog (largeur 70vw, hauteur adaptée au contenu, max 90vh) ;
│                       # header fixe (libellé, compteur, app-wizard-stepper : fragments
│                       # cliquables avec tooltip, saut libre entre étapes) et footer fixe
│                       # (précédent/suivant/valider) ; contenu projeté (app-wizard-step,
│                       # masqué par [hidden] mais monté). Garde wa-after-hide, retour à
│                       # l'étape 1 et événement close centralisés. Ancien app-wizard et
│                       # barre de progression supprimés
├── pages/              # Pages principales
│   ├── athletes/       # Gestion des athlètes (liste + modale CRUD)
│   ├── evaluations/    # Consultation des évaluations + wizard de saisie (modale basée sur app-wizard-dialog)
│   ├── programmes/     # Programmes d'entraînement générés : liste + 3 popups
│   │                   #   (programme-create-dialog : création/génération, wizard à 2 étapes
│   │                   #    (1 Profil + Évaluation, 2 Format) basé sur app-wizard-dialog (components/wizard) ;
│   │                   #    programme-detail-dialog : consultation/édition, grille
│   │                   #    hebdomadaire (CSS display:grid, role table/row/cell ;
│   │                   #    exercices alternatifs séparés par « ou », séries empilées,
│   │                   #    libellé multi-lignes, pas de scroll horizontal) ;
│   │                   #    programme-cell-dialog : édition hiérarchique d'une case
│   │                   #    (nom d'exercice + ses séries, ajout/suppression des deux) ;
│   │                   #    programme-impression/ : vue imprimable (route hors layout)
│   │                   #    de toutes les semaines en lecture seule, tables sémantiques,
│   │                   #    rupture de page CSS par semaine (impression navigateur) ;
│   │                   #    programme-grid.util.ts : pivot pur partagé (dialog + impression),
│   │                   #    trainingNumbersOf/gridRowsOf + types ProgrammeGridRow/Cell)
│   └── referentiel/    # Référentiel avec onglets routés
│       ├── archetypes/ # Profils archétypes (liste + modale CRUD)
│       ├── planning/   # Grille pivot hebdomadaire du planning de référence, édition inline par cellule
│       └── protocoles/ # Exercices de référence et leurs séries par mouvement
│                       # (liste + modale protocole-form-dialog)
├── models/             # Interfaces TypeScript correspondant aux DTOs backend
├── services/           # Services HTTP par domaine métier + loader i18n custom
├── directives/         # Directives transverses (ex. value accessors Signal Forms pour les composants WebAwesome)
└── pipes/              # Pipes transverses (ex. date localisée, HTML assaini)
```

### Routes

| Path | Composant | Description |
|---|---|---|
| `/` | redirect → `/athletes` | Redirection par défaut |
| `/athletes` | `AthletesComponent` | Liste et gestion des athlètes |
| `/evaluations` | `EvaluationsComponent` | Consultation des évaluations |
| `/programmes` | `ProgrammesComponent` | Liste des programmes générés (grille serveur, filtre athlète, tri) + popups de création/génération (wizard à 2 étapes dans `app-wizard-dialog`, navigation libre par fragments cliquables : **1 Profil + Évaluation** — Athlète obligatoire, Évaluation optionnelle effaçable, synthèse (archétype, force-vitesse, technique, endurance, squat, tirage, musculation, points faibles techniques) dupliquée dans le template sans composant partagé avec le wizard d'évaluation, pré-remplie par un handler explicite à la sélection d'une évaluation (vider la sélection ou changer d'athlète ne réinitialise pas la synthèse ; changer d'athlète ne vide que l'évaluation qui ne lui appartient pas) ; **2 Format** — semaines, fréquence, durée, début, objectifs ; émet `ProgrammeCreateRequest` avec `athleteId`, `evaluationId` nul ou numérique et `profile`), de consultation/édition (grille hebdomadaire calquée sur l'écran Planning, sélecteur de semaines) et d'édition de cellule. Le menu d'actions de ligne propose **Modifier / Actualiser / Imprimer / Supprimer** : « Actualiser » (`POST /programmes/{id}/refresh`, `ProgrammeService.refresh` côté front) ouvre une confirmation (`app-confirm-dialog`) avertissant que les modifications manuelles seront perdues, puis recharge la grille et affiche un toast de succès (`wa-toast` unique partagé succès/erreur) ; garde anti double soumission, grille en `loading` pendant l'opération |
| `/programmes/:id/impression` | `ProgrammeImpressionComponent` | Vue imprimable d'un programme (toutes les semaines, lecture seule, **hors du conteneur `LayoutComponent`** — page nue, ouverte dans un nouvel onglet ; impression via le navigateur, rupture de page par semaine) |
| `/referentiel` | `ReferentielComponent` | Conteneur onglets référentiel (Archétypes, Planning, Protocoles) |
| `/referentiel/archetypes` | `ArchetypesComponent` | Profils archétypes |
| `/referentiel/planning` | `PlanningComponent` | Grille pivot hebdomadaire du planning de référence, édition inline par cellule (persistance immédiate) |
| `/referentiel/protocoles` | `ProtocolesComponent` | Exercices de référence et leurs séries par mouvement : grille serveur (une ligne par exercice × archétype), filtres Mouvement / Semaine Type / Objectif (dynamique selon le mouvement) / Archétype, édition inline restreinte (libellé + séries) et modale d'ajout complète, suppression. Référence non affichée (déduite dans la modale). Le mouvement **Renfo spécifique (`RF`)** est géré à l'écran (consultation, filtre, édition inline, modale d'ajout, suppression) avec ses 9 objectifs composés `{mouvement}_{objectif technique}` (`SN_`/`CL_`/`JK_` × `EXT`/`CATCH`/`PATH`) ; sa référence de charge est déduite du préfixe du goal (`SN_`→`SN`, `CL_`/`JK_`→`CJ`) et reste en lecture seule. `CJ` et `PC` restent exclus de l'écran |
