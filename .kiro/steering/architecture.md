---
title: Architecture
inclusion: always
---

# Architecture — OBC Planner

> Ce fichier doit être mis à jour à chaque modification structurelle (libs, packages, tables, APIs).

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
└── utils/              # Utilitaires transversaux (dates, strings, numbers, objects)
```

### API REST

Base URL: `/api`

| Méthode | Endpoint | Java Class | Description |
|---|---|---|---|
| `GET` | `/athletes` | `AthleteController` | Liste paginée, filtrée (sexe, catégorie d'âge) et triée. `size=0` désactive la pagination |
| `GET` | `/athletes/{id}` | `AthleteController` | Consultation d'un athlète |
| `POST` | `/athletes` | `AthleteController` | Création (catégorie de poids cohérente avec le sexe — 409 sinon) |
| `PUT` | `/athletes/{id}` | `AthleteController` | Modification (cohérence poids/sexe contrôlée) |
| `DELETE` | `/athletes/{id}` | `AthleteController` | Suppression d'un athlète (évaluations/programmes liés supprimés en cascade) |
| `GET` | `/ref-archetypes` | `RefArchetypeController` | Liste paginée, filtrée (archétype, force-vitesse, technique, endurance) et triée. `size=0` désactive la pagination |
| `GET` | `/ref-archetypes/{id}` | `RefArchetypeController` | Consultation d'un archétype de référence |
| `POST` | `/ref-archetypes` | `RefArchetypeController` | Création (combinaison de profils unique — 409 sinon) |
| `PUT` | `/ref-archetypes/{id}` | `RefArchetypeController` | Modification (unicité de la combinaison contrôlée) |
| `DELETE` | `/ref-archetypes/{id}` | `RefArchetypeController` | Suppression d'un archétype de référence |
| `GET` | `/ref-plannings` | `RefPlanningController` | Liste paginée, filtrée (format hebdomadaire `weeksNumbers`, numéro de séance `trainingOrder`) et triée (tri par défaut numéro d'exercice `exerciceOrder`). `size=0` désactive la pagination |
| `GET` | `/ref-plannings/{id}` | `RefPlanningController` | Consultation d'une ligne de planning de référence |
| `POST` | `/ref-plannings` | `RefPlanningController` | Création d'une ligne de planning de référence |
| `PUT` | `/ref-plannings/{id}` | `RefPlanningController` | Modification d'une ligne de planning de référence. Introuvable → 404 |
| `DELETE` | `/ref-plannings/{id}` | `RefPlanningController` | Suppression d'une ligne de planning de référence. Introuvable → 404 |
| `GET` | `/evaluations` | `EvaluationController` | Liste paginée et triée des évaluations (lecture seule, une ligne par évaluation ; tri par défaut date décroissante). `size=0` désactive la pagination |
| `GET` | `/evaluations/{id}` | `EvaluationController` | Relecture complète d'une évaluation (bilan `eval_summaries` + détail `eval_details`) pour l'édition. Évaluation introuvable → 404 |
| `POST` | `/evaluations` | `EvaluationController` | Création d'une évaluation : bilan synthétique (`eval_summaries`, points faibles techniques `snatch`/`clean`/`jerk`) + détail des mesures (`eval_details`). Athlète introuvable → 404 |
| `PUT` | `/evaluations/{id}` | `EvaluationController` | Modification d'une évaluation : bilan mis à jour en place (PK et FK préservées, points faibles techniques `snatch`/`clean`/`jerk`), détail `eval_details` entièrement remplacé (delete + insert). Évaluation introuvable → 404 |
| `DELETE` | `/evaluations/{id}` | `EvaluationController` | Suppression d'une évaluation (détail `eval_details` supprimé en cascade). Évaluation introuvable → 404 |

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
│   └── wizard/         # Wizard à étapes générique : contenu projeté (app-wizard-step),
│                       # avancement (barre + compteur), navigation précédent/suivant/valider
├── pages/              # Pages principales
│   ├── athletes/       # Gestion des athlètes (liste + modale CRUD)
│   ├── evaluations/    # Consultation des évaluations + wizard de saisie
│   └── referentiel/    # Référentiel avec onglets routés
│       ├── archetypes/ # Profils archétypes (liste + modale CRUD)
│       └── planning/   # Grille pivot hebdomadaire du planning de référence, édition inline par cellule
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
| `/referentiel` | `ReferentielComponent` | Conteneur onglets référentiel |
| `/referentiel/archetypes` | `ArchetypesComponent` | Profils archétypes |
| `/referentiel/planning` | `PlanningComponent` | Grille pivot hebdomadaire du planning de référence, édition inline par cellule (persistance immédiate) |

---

## Base de données — PostgreSQL 17

### Schéma

#### `athletes`
Fiche athlète OBC.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `athlete_id` | `INTEGER` | PK | Identifiant auto-généré |
| `first_name` | `VARCHAR(50)` | NOT NULL | Prénom |
| `last_name` | `VARCHAR(50)` | NOT NULL | Nom de famille |
| `sexe` | `VARCHAR(1)` | NOT NULL | `M` = Masculin, `F` = Féminin |
| `age_categorie` | `VARCHAR(10)` | — | Catégorie d'âge : `U15`, `U17`, `U20`, `SEN`, `MASTER` |
| `weight_categorie` | `INTEGER` | — | Catégorie de poids (kg). Hommes : 51, 55, 60, 65, 70, 75, 85, 95, 110, 999. Femmes : 41, 45, 49, 53, 57, 61, 69, 77, 86, 999 |
| `comp_level` | `VARCHAR(10)` | — | Niveau de compétition : `DEB`, `DPT`, `REG`, `IRG`, `HON`, `NAT`, `EUR`, `MON` |

---

#### `ref_archetypes`
Table de référence des archétypes de profil athlète.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `ref_archetype_id` | `INTEGER` | PK | Identifiant auto-généré |
| `archetype` | `VARCHAR(10)` | NOT NULL | Archétype : `MID`, `ROUGH`, `TECH`, `CYCLE`, `LEARN` |
| `strength_speed` | `VARCHAR(10)` | NOT NULL | Niveau force-vitesse : `STRENGTH`, `MID`, `SPEED` |
| `technique` | `VARCHAR(10)` | NOT NULL | Niveau technique : `LOW`, `MID`, `HIGH` |
| `endurance` | `VARCHAR(10)` | NOT NULL | Niveau endurance : `LOW`, `MID`, `HIGH` |

---

#### `eval_summaries`
Bilan synthétique d'une évaluation athlète.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `evaluation_id` | `INTEGER` | PK | Identifiant auto-généré |
| `athlete_id` | `INTEGER` | NOT NULL, FK → athletes | Athlète évalué |
| `evaluation_date` | `DATE` | NOT NULL | Date de l'évaluation |
| `archetype` | `VARCHAR(10)` | — | Archétype résultant : `MID`, `ROUGH`, `TECH`, `CYCLE`, `LEARN` |
| `strength_speed` | `VARCHAR(10)` | — | Profil force-vitesse : `STRENGTH`, `MID`, `SPEED` |
| `technique` | `VARCHAR(10)` | — | Profil technique : `LOW`, `MID`, `HIGH` |
| `endurance` | `VARCHAR(10)` | — | Profil endurance : `LOW`, `MID`, `HIGH` |
| `squat` | `VARCHAR(10)` | — | Profil squat : `STRENGTH`, `MID`, `SPEED` |
| `pull` | `VARCHAR(10)` | — | Profil tirage : `STRENGTH`, `MID`, `SPEED` |
| `musculation` | `INTEGER` | NOT NULL, DEFAULT 0 | Bitmask des orientations de musculation : `GENERAL` (1), `LEGS` (2), `POSTERIOR_CHAIN` (4), `UPPER_BODY` (8) |
| `snatch` | `VARCHAR(100)` | — | Point faible technique à l'arraché : `EXT`, `CATCH`, `PATH` |
| `clean` | `VARCHAR(100)` | — | Point faible technique à l'épaulé : `EXT`, `CATCH`, `PATH` |
| `jerk` | `VARCHAR(100)` | — | Point faible technique au jeté : `EXT`, `CATCH`, `PATH` |
| `psycho_strength` | `VARCHAR(100)` | — | Point fort psychologique : `CALM`, `CONFIDENT`, `MOTIVATED`, `FOCUSED`, `COMPETITIVE`, `CHALLENGER`, `INDEPENDANT` |
| `psycho_weakness` | `VARCHAR(100)` | — | Point faible psychologique : `EMOTIONAL`, `ANXIOUS`, `INDIFFERENT`, `DISTRACTED`, `HEDONISTIC`, `PRAGMATIC`, `RULE` |

---

#### `eval_details`
Détail des mesures réalisées lors d'une évaluation.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `evaluation_detail_id` | `INTEGER` | PK | Identifiant auto-généré |
| `evaluation_id` | `INTEGER` | NOT NULL, FK → eval_summaries | Évaluation parente |
| `eval_categorie` | `VARCHAR(10)` | NOT NULL | Catégorie de l'évaluation : `STRENGTH`, `TECH`, `CARDIO`, `PSYCHO` |
| `exercice_code` | `VARCHAR(50)` | — | Code de l'exercice évalué |
| `real_value` | `NUMERIC(10, 4)` | — | Valeur mesurée (kg, m/s, %, reps, etc.) |
| `result` | `INTEGER` | — | Résultat calculé : `LOW` (-1), `MID` (0), `HIGH` (1) |

---

#### `programmes`
Programme d'entraînement généré pour un athlète.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `programme_id` | `INTEGER` | PK | Identifiant auto-généré |
| `evaluation_id` | `INTEGER` | NOT NULL, FK → eval_summaries | Évaluation source du programme |
| `weeks` | `INTEGER` | NOT NULL | Nombre de semaines : `8`, `12`, `16` |
| `frequency` | `INTEGER` | NOT NULL | Nombre de séances par semaine : `3`, `4`, `5` |
| `duration` | `INTEGER` | — | Durée d'une séance en minutes : `90`, `120`, `150` |
| `start_date` | `DATE` | NOT NULL | Date de début du programme |
| `end_date` | `DATE` | NOT NULL | Date de fin du programme |
| `snatch_goal` | `INTEGER` | — | Objectif arraché en kg |
| `cj_goal` | `INTEGER` | — | Objectif épaulé-jeté en kg |

---

#### `programme_weeks`
Découpage hebdomadaire d'un programme.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `programme_week_id` | `INTEGER` | PK | Identifiant auto-généré |
| `programme_id` | `INTEGER` | NOT NULL, FK → programmes | Programme parent |
| `week_number` | `INTEGER` | NOT NULL | Numéro de semaine (1 à 16), UNIQUE avec `programme_id` |
| `start_date` | `DATE` | NOT NULL | Date de début de la semaine |
| `end_date` | `DATE` | NOT NULL | Date de fin de la semaine |
| `week_type` | `VARCHAR(50)` | NOT NULL | Type de semaine : `F` (Volume), `T` (Tech), `S` (Strength), `A` (Peak), `D` (Deload), `PC` (Pré-Compétition) |
| `base_percent` | `NUMERIC(4, 2)` | NOT NULL | Pourcentage de l'objectif final |
| `snatch_goal` | `INTEGER` | NOT NULL | Base arraché de la semaine (kg) |
| `cj_goal` | `INTEGER` | NOT NULL | Base épaulé-jeté de la semaine (kg) |
| `back_squat_goal` | `INTEGER` | NOT NULL | Base squat nuque de la semaine (kg) |
| `front_squat_goal` | `INTEGER` | NOT NULL | Base squat clavicule de la semaine (kg) |
| `snatch_pull_goal` | `INTEGER` | NOT NULL | Base tirage arraché de la semaine (kg) |
| `cj_pull_goal` | `INTEGER` | NOT NULL | Base tirage épaulé de la semaine (kg) |

---

#### `programme_trainings`
Exercices planifiés dans une semaine de programme.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `programme_training_id` | `INTEGER` | PK | Identifiant auto-généré |
| `programme_week_id` | `INTEGER` | NOT NULL, FK → programme_weeks | Semaine parente |
| `training_number` | `INTEGER` | NOT NULL | Numéro de la séance hebdomadaire (1 à 5) |
| `exercice_order` | `INTEGER` | NOT NULL | Ordre de l'exercice dans la séance (même ordre = "Au choix") |
| `exercice_name` | `VARCHAR(100)` | NOT NULL | Nom de l'exercice planifié (libellé libre, non lié au catalogue) |
| `set_number` | `INTEGER` | NOT NULL | Nombre de séries |
| `rep_number` | `INTEGER` | NOT NULL | Nombre de répétitions par série |
| `rep_label` | `VARCHAR(20)` | — | Label des répétitions si complexe (ex : "30s + 10 reps") |
| `min_weight` | `NUMERIC(6, 2)` | — | Charge minimale en kg |
| `max_weight` | `NUMERIC(6, 2)` | — | Charge maximale en kg |

---

#### `ref_timelines`
Timelines de référence par archétype et durée de programme.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `ref_timeline_id` | `INTEGER` | PK | Identifiant auto-généré |
| `archetype` | `VARCHAR(10)` | NOT NULL | Archétype de l'athlète : `MID`, `ROUGH`, `TECH`, `CYCLE`, `LEARN`, UNIQUE avec `weeks` |
| `weeks` | `INTEGER` | NOT NULL | Durée du programme : `8`, `12`, `16` |
| `timeline` | `VARCHAR(255)` | NOT NULL | Séquence de types de semaines : `F` (Volume), `T` (Tech), `S` (Strength), `A` (Peak), `D` (Deload), `PC` (Pré-Compétition) |

---

#### `ref_plannings`
Planning de référence du moteur de génération : séances type par nombre de séances hebdomadaires. Table autonome (aucune FK).

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `ref_planning_id` | `INTEGER` | PK | Identifiant auto-généré (`GENERATED BY DEFAULT AS IDENTITY`) |
| `weeks_numbers` | `INTEGER` | NOT NULL, CHECK IN (3, 4, 5) | Nombre de séances par semaine : `3`, `4`, `5` |
| `training_order` | `INTEGER` | NOT NULL, CHECK BETWEEN 1 AND 5 | Numéro de la séance dans la semaine (1 à 5) |
| `exercice_order` | `INTEGER` | NOT NULL, CHECK BETWEEN 1 AND 6 | Ordre de l'exercice dans la séance (même ordre = "Au choix") |
| `exercice_type` | `VARCHAR(10)` | NOT NULL, CHECK | Type d'exercice attendu : `SN`, `CJ`, `SQ`, `PL`, `RF`, `MS`, `PC` (`PC` = Pliométrie / Cardio) |

---

#### `ref_exercices`
Catalogue de référence des exercices du moteur de génération. Table autonome (aucune FK).

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `ref_exercice_id` | `INTEGER` | PK | Identifiant auto-généré (`GENERATED BY DEFAULT AS IDENTITY`) |
| `exercice_type` | `VARCHAR(10)` | NOT NULL, CHECK | Type d'exercice : `SN`, `CJ`, `SQ`, `PL`, `RF`, `MS` |
| `week_type` | `VARCHAR(10)` | NOT NULL, CHECK | Type de semaine : `F` (Volume), `T` (Tech), `S` (Strength), `A` (Peak), `D` (Deload) |
| `goal` | `VARCHAR(10)` | NOT NULL, CHECK | Objectif : `EXT`, `CATCH`, `PATH`, `KEEP`, `STR`, `SPD` |
| `training_order` | `INTEGER` | NOT NULL, CHECK > 0 | Ordre de l'exercice dans la séance |
| `exercice_name` | `VARCHAR(100)` | NOT NULL | Nom de l'exercice de référence |
| `reference` | `VARCHAR(10)` | NOT NULL, CHECK | Exercice de référence pour le calcul de charge : `SN`, `CJ`, `FS`, `BS`, `SP`, `CP` |

---

#### `ref_exercice_sets`
Séries/répétitions de référence par exercice et archétype.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `ref_exercice_set_id` | `INTEGER` | PK | Identifiant auto-généré (`GENERATED BY DEFAULT AS IDENTITY`) |
| `ref_exercice_id` | `INTEGER` | NOT NULL, FK → ref_exercices | Exercice de référence parent (index `idx_ref_exercice_sets_1`) |
| `archetype` | `VARCHAR(10)` | NOT NULL, CHECK | Archétype de l'athlète : `MID`, `ROUGH`, `TECH`, `CYCLE`, `LEARN` |
| `set_number` | `INTEGER` | NOT NULL, CHECK > 0 | Nombre de séries de référence |
| `rep_number` | `INTEGER` | NOT NULL, CHECK > 0 | Nombre de répétitions de référence |
| `weight` | `NUMERIC(6, 2)` | — | Charge de référence en kg (ou % selon usage du moteur) |