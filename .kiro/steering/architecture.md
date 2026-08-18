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

---

## Frontend — Angular 20

### Structure des modules

```
src/app/
├── app.component.*     # Composant racine (bootstrap, détection langue navigateur)
├── app.config.ts       # Configuration standalone (providers, i18n, HTTP)
├── app.routes.ts       # Définition des routes (lazy-loaded)
├── components/         # Composants communs / réutilisables
│   └── layout/         # Shell principal : header, sidebar (wa-page), footer, sélecteur de langue
├── pages/              # Pages principales
│   ├── athletes/       # Gestion des athlètes
│   └── referentiel/    # Référentiel avec onglets routés
│       ├── exercices/
│       ├── correctifs/
│       ├── archetypes/
│       └── trame-generale/
├── models/             # Interfaces TypeScript correspondant aux DTOs backend
└── services/           # Services HTTP par domaine métier + loader i18n custom
```

### Routes

| Path | Composant | Description |
|---|---|---|
| `/` | redirect → `/athletes` | Redirection par défaut |
| `/athletes` | `AthletesComponent` | Liste et gestion des athlètes |
| `/referentiel` | `ReferentielComponent` | Conteneur onglets référentiel |
| `/referentiel/exercices` | `ExercicesComponent` | Catalogue des exercices |
| `/referentiel/correctifs` | `CorrectifsComponent` | Exercices correctifs |
| `/referentiel/archetypes` | `ArchetypesComponent` | Profils archétypes |
| `/referentiel/trame-generale` | `TrameGeneraleComponent` | Trame générale de programmation |

---

## Base de données — PostgreSQL 17

### Schéma

#### `exercices`
Catalogue des exercices de référence.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `exercice_id` | `INTEGER` | PK | Identifiant auto-généré |
| `exercice_ref` | `INTEGER` | FK → exercices | Référence vers un exercice parent (auto-référence) |
| `type_exercice` | `VARCHAR(10)` | NOT NULL | Type d'exercice : `SQUAT`, `PULL`, `SNATCH`, `CLEAN`, `JERK` |
| `categorie_exercice` | `VARCHAR(10)` | NOT NULL | Catégorie / groupe musculaire : `TECH`, `COMBI`, `SEMI_LEGER`, `SEMI_LOURD`, `RENFO`, `CARDIO`, `PLYO`, `BACK`, `FRONT` |
| `exercice_code` | `VARCHAR(50)` | NOT NULL, UNIQUE | Code unique identifiant l'exercice (libellé dans les fichiers i18n) |
| `estimate_value` | `NUMERIC(4, 2)` | — | Charge théorique (% de l'exercice de référence) |

---

#### `corrections`
Exercices correctifs associés à un exercice principal.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `exercice_id` | `INTEGER` | PK, FK → exercices | Exercice principal |
| `correction_id` | `INTEGER` | PK, FK → exercices | Exercice correctif associé |

---

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
| `snatch_strength` | `VARCHAR(100)` | — | Point fort à l'arraché |
| `snatch_weakness` | `VARCHAR(100)` | — | Point faible à l'arraché |
| `clean_strength` | `VARCHAR(100)` | — | Point fort à l'épaulé |
| `clean_weakness` | `VARCHAR(100)` | — | Point faible à l'épaulé |
| `jerk_strength` | `VARCHAR(100)` | — | Point fort au jeté |
| `jerk_weakness` | `VARCHAR(100)` | — | Point faible au jeté |
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
| `exercice_code` | `VARCHAR(50)` | NOT NULL | Code unique identifiant l'exercice (libellé dans les fichiers i18n) |
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
Planning de référence des séances type par archétype et type de semaine.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `ref_planning_id` | `BIGINT` | PK | Identifiant auto-généré |
| `archetype` | `VARCHAR(10)` | NOT NULL | Archétype de l'athlète : `MID`, `ROUGH`, `TECH`, `CYCLE`, `LEARN` |
| `week_type` | `VARCHAR(50)` | NOT NULL | Type de semaine : `F` (Volume), `T` (Tech), `S` (Strength), `A` (Peak), `D` (Deload) |
| `day_of_week` | `INTEGER` | NOT NULL | Numéro de la séance dans la semaine (1 à 5) |
| `exercice_order` | `INTEGER` | NOT NULL | Ordre de passage dans la séance (même ordre = "Au choix") |
| `categorie_exercice` | `VARCHAR(100)` | NOT NULL | Catégorie d'exercice attendue |
| `type_exercice` | `VARCHAR(100)` | — | Type d'exercice attendu |
| `strength_weakness` | `VARCHAR(10)` | — | `STRENGTH` = point fort, `WEAKNESS` = point faible |
| `set_number` | `INTEGER` | — | Nombre de séries de référence |
| `rep_number` | `INTEGER` | — | Nombre de répétitions de référence |
| `rep_label` | `VARCHAR(20)` | — | Label des répétitions de référence |

---

#### `ref_squats`
Exercices de squat de référence par archétype, objectif et type de semaine.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `ref_squat_id` | `INTEGER` | PK | Identifiant auto-généré |
| `goal` | `VARCHAR(10)` | NOT NULL | Objectif : `STRENGTH` = Force, `SPEED` = Vitesse, `KEEP` = Maintien |
| `archetype` | `VARCHAR(10)` | NOT NULL | Archétype de l'athlète : `MID`, `ROUGH`, `TECH`, `CYCLE`, `LEARN` |
| `week_type` | `VARCHAR(50)` | NOT NULL | Type de semaine : `F` (Volume), `T` (Tech), `S` (Strength), `A` (Peak), `D` (Deload), `PC` (Pré-Compétition) |
| `training_number` | `INTEGER` | NOT NULL | Numéro de la séance dans la semaine (1 à 3) |
| `squat_type` | `VARCHAR(50)` | NOT NULL | Type de squat : `BACK`, `FRONT` |
| `exercice_code` | `VARCHAR(50)` | NOT NULL | Code unique identifiant l'exercice (libellé dans les fichiers i18n) |
| `set_number` | `INTEGER` | NOT NULL | Nombre de séries de référence |
| `rep_number` | `INTEGER` | NOT NULL | Nombre de répétitions de référence |
| `rep_label` | `VARCHAR(20)` | — | Label des répétitions si complexe (ex : "30s + 10 reps") |
| `estimate_value` | `NUMERIC(4, 2)` | — | Pourcentage de charge estimée par rapport à l'objectif de squat |

---

#### `ref_pulls`
Exercices de tirage de référence par archétype, objectif et type de semaine.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `ref_pull_id` | `INTEGER` | PK | Identifiant auto-généré |
| `goal` | `VARCHAR(10)` | NOT NULL | Objectif : `STRENGTH` = Force, `SPEED` = Vitesse, `KEEP` = Maintien |
| `archetype` | `VARCHAR(10)` | NOT NULL | Archétype de l'athlète : `MID`, `ROUGH`, `TECH`, `CYCLE`, `LEARN` |
| `week_type` | `VARCHAR(50)` | NOT NULL | Type de semaine : `F` (Volume), `T` (Tech), `S` (Strength), `A` (Peak), `D` (Deload), `PC` (Pré-Compétition) |
| `training_number` | `INTEGER` | NOT NULL | Numéro de la séance dans la semaine (1 à 3) |
| `pull_type` | `VARCHAR(50)` | NOT NULL | Type de tirage : `SNATCH_PULL`, `CJ_PULL`, etc. |
| `exercice_code` | `VARCHAR(50)` | NOT NULL | Code unique identifiant l'exercice (libellé dans les fichiers i18n) |
| `set_number` | `INTEGER` | NOT NULL | Nombre de séries de référence |
| `rep_number` | `INTEGER` | NOT NULL | Nombre de répétitions de référence |
| `rep_label` | `VARCHAR(20)` | — | Label des répétitions si complexe (ex : "30s + 10 reps") |
| `estimate_value` | `NUMERIC(4, 2)` | — | Pourcentage de charge estimée par rapport à l'objectif de tirage |