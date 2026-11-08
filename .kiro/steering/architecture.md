---
title: Architecture
inclusion: always
---

# Architecture — OBC Planner

> Ce fichier doit être mis à jour à chaque modification structurelle (libs, packages, tables, APIs).

> **Traçabilité** — MàJ Documentaliste (skills `git-diff` + `doc-writer`) pour la feature « Référentiel > Protocoles » (spec `.kiro/specs/referentiel-protocoles/`) : API `/ref-exercices`, route `/referentiel/protocoles`, évolutions de schéma `ref_exercices` / `ref_exercice_sets` et relation One-Many associée. État documenté = état réel du code.

> **Traçabilité** — MàJ Documentaliste (skills `git-diff` + `code-explorer` + `doc-writer`) pour la feature « Génération de programme d'entraînement » (spec `.kiro/specs/generation-programme/`) : API `/programmes` (`ProgrammeController`, 5 endpoints), route `/programmes` + module `pages/programmes/` (liste + 3 popups), entités `Programme` / `ProgrammeWeek` / `ProgrammeTraining` (One-Many en cascade) et `RefTimeline` (mappage de `ref_timelines`), enum `ProgrammeWeekType`, moteur de génération (`ProgrammeGenerationService`) + utilitaires, exception `ValidationException` (400), évolution de schéma `programme_trainings` (`rep_number` VARCHAR nullable, `set_number` nullable). État documenté = état réel du code.

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
```

Entités JPA de la génération de programme : `Programme` **1 — N** `ProgrammeWeek` **1 — N** `ProgrammeTraining` (relations `@OneToMany` en cascade ALL + `orphanRemoval`, fetch `LAZY`, `@BatchSize` sur `ProgrammeWeek.programmeTrainings`, relations exclues de `equals`/`hashCode`/`toString`). `RefTimeline` mappe la table `ref_timelines` (seedée) consommée par le moteur. Enum `ProgrammeWeekType {F,T,S,A,D,PC}` (distinct de `WeekTypeRef`, sans `PC`). Exception `ValidationException` → HTTP 400 (domaine fonctionnel hors bornes), mappée dans l'advice existant.

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
| `GET` | `/ref-exercices` | `RefExerciceController` | Liste paginée, filtrée (`exerciceType`, `weekType`, `goal`, `archetype`) et triée (tri par défaut `exerciceType`, `weekType`, `goal`, `trainingOrder`) ; réponse imbriquée exercice + ses séries (`sets`). `size=0` désactive la pagination |
| `GET` | `/ref-exercices/{id}` | `RefExerciceController` | Consultation d'un exercice de référence (avec ses séries). Introuvable → 404 |
| `POST` | `/ref-exercices` | `RefExerciceController` | Création d'un exercice de référence et de ses séries (201) |
| `PUT` | `/ref-exercices/{id}` | `RefExerciceController` | Modification d'un exercice de référence : libellé + remplacement en bloc des séries des archétypes présents dans le payload (les autres archétypes restent intacts). Introuvable → 404 |
| `DELETE` | `/ref-exercices/{id}` | `RefExerciceController` | Suppression d'un exercice de référence et de toutes ses séries (cascade). Introuvable → 404 |
| `DELETE` | `/ref-exercices/{id}/sets?archetype=` | `RefExerciceController` | Suppression des séries d'un archétype donné ; si l'exercice n'a plus aucune série, il est supprimé. Introuvable → 404 |
| `GET` | `/evaluations` | `EvaluationController` | Liste paginée et triée des évaluations (lecture seule, une ligne par évaluation ; tri par défaut date décroissante). `size=0` désactive la pagination |
| `GET` | `/evaluations/{id}` | `EvaluationController` | Relecture complète d'une évaluation (bilan `eval_summaries` + détail `eval_details`) pour l'édition. Évaluation introuvable → 404 |
| `POST` | `/evaluations` | `EvaluationController` | Création d'une évaluation : bilan synthétique (`eval_summaries`, points faibles techniques `snatch`/`clean`/`jerk`) + détail des mesures (`eval_details`). Athlète introuvable → 404 |
| `PUT` | `/evaluations/{id}` | `EvaluationController` | Modification d'une évaluation : bilan mis à jour en place (PK et FK préservées, points faibles techniques `snatch`/`clean`/`jerk`), détail `eval_details` entièrement remplacé (delete + insert). Évaluation introuvable → 404 |
| `DELETE` | `/evaluations/{id}` | `EvaluationController` | Suppression d'une évaluation (détail `eval_details` supprimé en cascade). Évaluation introuvable → 404 |
| `GET` | `/programmes` | `ProgrammeController` | Liste paginée, filtrée (`athleteId`) et triée (tri par défaut date de début décroissante `startDate,DESC`) ; une ligne par programme avec nom/prénom de l'athlète joint. `size=0` désactive la pagination |
| `GET` | `/programmes/{id}` | `ProgrammeController` | Détail imbriqué d'un programme (semaines + séances planifiées). Introuvable → 404 |
| `POST` | `/programmes` | `ProgrammeController` | Génère un programme complet à partir d'une évaluation (201). Évaluation introuvable → 404 ; paramètres hors domaine (`weeks` ∉ {8,12,16}, `frequency` ∉ {3,4,5}, `duration` ∉ {90,120,150}) → 400 |
| `PUT` | `/programmes/{id}/cell` | `ProgrammeController` | Édition en bloc d'une case (nom/séries/répétitions/charges des alternatives) ; renvoie le détail à jour. Programme ou semaine introuvable → 404 |
| `DELETE` | `/programmes/{id}` | `ProgrammeController` | Suppression d'un programme (semaines + séances supprimées en cascade). 204. Introuvable → 404 |

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
│   ├── programmes/     # Programmes d'entraînement générés : liste + 3 popups
│   │                   #   (programme-create-dialog : création/génération ;
│   │                   #    programme-detail-dialog : consultation/édition, grille
│   │                   #    hebdomadaire + sélecteur de semaines ;
│   │                   #    programme-cell-dialog : édition d'une cellule)
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
| `/programmes` | `ProgrammesComponent` | Liste des programmes générés (grille serveur, filtre athlète, tri) + popups de création/génération, de consultation/édition (grille hebdomadaire calquée sur l'écran Planning, sélecteur de semaines) et d'édition de cellule |
| `/referentiel` | `ReferentielComponent` | Conteneur onglets référentiel (Archétypes, Planning, Protocoles) |
| `/referentiel/archetypes` | `ArchetypesComponent` | Profils archétypes |
| `/referentiel/planning` | `PlanningComponent` | Grille pivot hebdomadaire du planning de référence, édition inline par cellule (persistance immédiate) |
| `/referentiel/protocoles` | `ProtocolesComponent` | Exercices de référence et leurs séries par mouvement : grille serveur (une ligne par exercice × archétype), filtres Mouvement / Semaine Type / Objectif (dynamique selon le mouvement) / Archétype, édition inline restreinte (libellé + séries) et modale d'ajout complète, suppression. Référence non affichée (déduite dans la modale) |

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
| `set_number` | `INTEGER` | CHECK (`set_number IS NULL OR set_number > 0`) | Nombre de séries. **Nullable** (cases sans série : RF, PC, « à définir ») |
| `rep_number` | `VARCHAR(20)` | — | Répétitions au format libre : `'6'`, `'30s'`, `'(1 + 1)'`, ou NULL (aligné sur `ref_exercice_sets.rep_number`). **Nullable** ; CHECK `rep_number > 0` supprimé |
| `rep_label` | `VARCHAR(20)` | — | Label des répétitions si complexe (ex : "30s + 10 reps") |
| `min_weight` | `NUMERIC(6, 2)` | — | Charge minimale en kg |
| `max_weight` | `NUMERIC(6, 2)` | CHECK (`max_weight IS NULL OR max_weight >= min_weight`) | Charge maximale en kg |

---

#### `ref_timelines`
Timelines de référence par archétype et durée de programme. Mappée par l'entité JPA `RefTimeline` (repository `RefTimelineRepository`) depuis la feature « Génération de programme » ; table autonome (aucune relation), consommée par le moteur de génération.

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
Catalogue de référence des exercices du moteur de génération. Porte la collection de ses séries (`ref_exercice_sets`) en relation **One-Many** (1 — N) exposée par l'API (exercice + ses séries). Aucune FK sortante.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `ref_exercice_id` | `INTEGER` | PK | Identifiant auto-généré (`GENERATED BY DEFAULT AS IDENTITY`) |
| `exercice_type` | `VARCHAR(10)` | NOT NULL, CHECK (`chk_ref_exercices_1`) | Type d'exercice : `SN`, `CJ`, `CL`, `JK`, `SQ`, `PL`, `RF`, `MS`. `CJ` = Clean & Jerk (épaulé-jeté complet, conservé) ; `CL` = Clean / Épaulé et `JK` = Jerk / Jeté distinguent les deux mouvements en cohérence avec le wizard |
| `week_type` | `VARCHAR(10)` | NOT NULL, CHECK | Type de semaine : `F` (Volume), `T` (Tech), `S` (Strength), `A` (Peak), `D` (Deload) |
| `goal` | `VARCHAR(10)` | NOT NULL, CHECK (`chk_ref_exercices_3`) | Objectif : `EXT`, `CATCH`, `PATH` (technique), `KEEP`, `STR`, `SPD` (squat/tirage), `GEN` (Général), `LEGS` (Jambes), `POST` (Chaîne postérieure), `UPPER` (Haut du corps) (musculation) |
| `training_order` | `INTEGER` | NOT NULL, CHECK > 0 | Ordre de l'exercice dans la séance |
| `exercice_name` | `VARCHAR(100)` | NOT NULL | Nom de l'exercice de référence |
| `reference` | `VARCHAR(10)` | NULL, CHECK (`chk_ref_exercices_5`) | Exercice de référence pour le calcul de charge : `SN`, `CJ`, `FS`, `BS`, `SP`, `CP` (domaine inchangé). **Nullable** : NULL pour la Musculation |

Index : `idx_ref_exercices_1 (exercice_type, week_type, goal, training_order)` pour le filtre/tri serveur.

---

#### `ref_exercice_sets`
Séries/répétitions de référence par exercice et archétype. Côté « N » de la relation One-Many avec `ref_exercices`.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `ref_exercice_set_id` | `INTEGER` | PK | Identifiant auto-généré (`GENERATED BY DEFAULT AS IDENTITY`) |
| `ref_exercice_id` | `INTEGER` | NOT NULL, FK → ref_exercices | Exercice de référence parent (index `idx_ref_exercice_sets_1`) |
| `archetype` | `VARCHAR(10)` | NOT NULL, CHECK | Archétype de l'athlète : `MID`, `ROUGH`, `TECH`, `CYCLE`, `LEARN` |
| `set_number` | `INTEGER` | NOT NULL, CHECK > 0 | Nombre de séries de référence |
| `rep_number` | `VARCHAR(20)` | — | Répétitions de référence au format libre : `'6'`, `'30s'`, `'12m'`, `'(1 + 1)'`, `'6 / 6'`, ou NULL (combinés / volumes sans reps). **Nullable** ; CHECK `rep_number > 0` supprimé |
| `weight` | `NUMERIC(6, 2)` | — | Charge de référence en kg (ou % selon usage du moteur) |

---

## Risques & dettes connus

### Moteur de génération vs données « Protocoles »
L'écran Référentiel > Protocoles et son schéma introduisent de nouvelles valeurs que le **moteur de génération de programme n'exploite pas encore** :
- `exercice_type` `CL` (Épaulé) et `JK` (Jeté) — le moteur raisonne encore sur l'ancien domaine ;
- objectifs de musculation `GEN` / `LEGS` / `POST` / `UPPER` sur `ref_exercices.goal` ;
- `ref_exercice_sets.rep_number` désormais **textuel** (`'30s'`, `'(1 + 1)'`, NULL…) alors que le moteur attendait un entier.

Tant que le moteur n'a pas évolué, les exercices/séries saisis avec ces nouvelles valeurs peuvent ne pas être pris en compte (ou mal interprétés) lors de la génération d'un programme. Évolution du moteur à planifier hors périmètre de la feature Protocoles.

### Génération de programme : couverture incomplète de la trame
Le moteur de génération (`ProgrammeGenerationService`) présente les limites suivantes, assumées dans le périmètre actuel :
- `RF` (renfo spécifique) et `PC` (pliométrie / cardio) **n'ont aucun protocole** dans `ref_exercices` : les cases correspondantes sont générées avec des **libellés fixes en français stockés en base** (décision : application locale, libellés FR assumés, non internationalisés).
- Une **semaine de type `PC`** (pré-compétition) voit **toutes ses cases générées en « (à définir) »** : la trame spécifique de la semaine PC sera fournie ultérieurement (hors périmètre actuel).
- Si **aucun protocole** ne correspond à une combinaison (`exercice_type` / `week_type` / `goal` / ordre), la case est générée en **« (à définir) »**.
