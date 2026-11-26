---
title: Architecture - API REST
description: Tableau des endpoints REST et contrats associés
inclusion: fileMatch
fileMatchPattern:
  - "**/controllers/**/*.java"
  - "**/dto/**/*.java"
  - "**/services/**/*.ts"
  - "**/models/**/*.ts"
---

# Architecture — API REST (OBC Planner)

> Complément de `architecture.md`. À mettre à jour à chaque ajout/modification d'endpoint ou de DTO. Les DTOs de création de programme sont décrits dans `architecture.md` (section Backend).

### API REST

Base URL: `/api`

### AthleteController

Préfixe de route : `/athletes`.

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/athletes` | Liste paginée, filtrée (sexe, catégorie d'âge) et triée. `size=0` désactive la pagination |
| `GET` | `/athletes/{id}` | Consultation d'un athlète |
| `POST` | `/athletes` | Création (catégorie de poids cohérente avec le sexe — 409 sinon) |
| `PUT` | `/athletes/{id}` | Modification (cohérence poids/sexe contrôlée) |
| `DELETE` | `/athletes/{id}` | Suppression d'un athlète (évaluations/programmes liés supprimés en cascade) |

### RefArchetypeController

Préfixe de route : `/ref-archetypes`.

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/ref-archetypes` | Liste paginée, filtrée (archétype, force-vitesse, technique, endurance) et triée. `size=0` désactive la pagination |
| `GET` | `/ref-archetypes/{id}` | Consultation d'un archétype de référence |
| `POST` | `/ref-archetypes` | Création (combinaison de profils unique — 409 sinon) |
| `PUT` | `/ref-archetypes/{id}` | Modification (unicité de la combinaison contrôlée) |
| `DELETE` | `/ref-archetypes/{id}` | Suppression d'un archétype de référence |

### RefPlanningController

Préfixe de route : `/ref-plannings`.

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/ref-plannings` | Liste paginée, filtrée (format hebdomadaire `weeksNumbers`, numéro de séance `trainingOrder`) et triée (tri par défaut numéro d'exercice `exerciceOrder`). `size=0` désactive la pagination |
| `GET` | `/ref-plannings/{id}` | Consultation d'une ligne de planning de référence |
| `POST` | `/ref-plannings` | Création d'une ligne de planning de référence |
| `PUT` | `/ref-plannings/{id}` | Modification d'une ligne de planning de référence. Introuvable → 404 |
| `DELETE` | `/ref-plannings/{id}` | Suppression d'une ligne de planning de référence. Introuvable → 404 |

### RefExerciceController

Préfixe de route : `/ref-exercices`.

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/ref-exercices` | Liste paginée, filtrée (`exerciceType`, `weekType`, `goal`, `archetype`) et triée (tri par défaut `exerciceType`, `weekType`, `goal`, `trainingOrder`) ; réponse imbriquée exercice + ses séries (`sets`). `size=0` désactive la pagination |
| `GET` | `/ref-exercices/{id}` | Consultation d'un exercice de référence (avec ses séries). Introuvable → 404 |
| `POST` | `/ref-exercices` | Création d'un exercice de référence et de ses séries (201) |
| `PUT` | `/ref-exercices/{id}` | Modification d'un exercice de référence : libellé + remplacement en bloc des séries des archétypes présents dans le payload (les autres archétypes restent intacts). Introuvable → 404 |
| `DELETE` | `/ref-exercices/{id}` | Suppression d'un exercice de référence et de toutes ses séries (cascade). Introuvable → 404 |
| `DELETE` | `/ref-exercices/{id}/sets?archetype=` | Suppression des séries d'un archétype donné ; si l'exercice n'a plus aucune série, il est supprimé. Introuvable → 404 |

### EvaluationController

Préfixe de route : `/evaluations`.

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/evaluations` | Liste paginée et triée des évaluations (lecture seule, une ligne par évaluation ; tri par défaut date décroissante). `size=0` désactive la pagination |
| `GET` | `/evaluations/{id}` | Relecture complète d'une évaluation (bilan `eval_summaries` + détail `eval_details`) pour l'édition. Évaluation introuvable → 404 |
| `POST` | `/evaluations` | Création d'une évaluation : bilan synthétique (`eval_summaries`, points faibles techniques `snatch`/`clean`/`jerk`) + détail des mesures (`eval_details`). Athlète introuvable → 404 |
| `PUT` | `/evaluations/{id}` | Modification d'une évaluation : bilan mis à jour en place (PK et FK préservées, points faibles techniques `snatch`/`clean`/`jerk`), détail `eval_details` entièrement remplacé (delete + insert). Évaluation introuvable → 404 |
| `DELETE` | `/evaluations/{id}` | Suppression d'une évaluation (détail `eval_details` supprimé en cascade). Évaluation introuvable → 404 |

### ProgrammeController

Préfixe de route : `/programmes`.

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/programmes` | Liste paginée, filtrée (`athleteId`) et triée (tri par défaut date de début décroissante `startDate,DESC`) ; une ligne par programme avec nom/prénom de l'athlète joint. `size=0` désactive la pagination |
| `GET` | `/programmes/{id}` | Détail imbriqué d'un programme à **3 niveaux** : semaines → séances (`trainings[] : { programmeTrainingId, trainingNumber, exercices[] }`) → exercices (`{ programmeExerciceId, exerciceOrder, exerciceName, series[] }`) → séries (`{ programmeSeriesId, setNumber, repNumber, minWeight, maxWeight }`). L'en-tête (`ProgrammeDetailResponse`) expose aussi, après `cjGoal`, les 4 objectifs `frontSquatGoal`, `backSquatGoal`, `snatchPullGoal`, `cjPullGoal`. Introuvable → 404 |
| `POST` | `/programmes` | Génère un programme complet (201). Body `ProgrammeCreateRequest` : `{ athleteId, evaluationId \| null, profile, weeks, frequency, duration, startDate, snatchGoal, cjGoal, frontSquatGoal, backSquatGoal, snatchPullGoal, cjPullGoal }`. Les 4 derniers objectifs (Flexion Avant, Flexion Nuque, Tirage Arraché, Tirage Épaulé, en kg) sont **obligatoires** (`@NotNull @Min(1)`, absent/nul/< 1 → 400 `VALIDATION_ERROR`) : changement cassant, front et back à livrer ensemble. Le moteur les utilise tels quels avec `snatchGoal` / `cjGoal` comme 6 cibles finales (plus de coefficients côté back). `profile` (`ProgrammeProfileRequest`, 10 champs) : `archetype`, `strengthSpeed`, `technique`, `endurance`, `squat`, `pull` (obligatoires), `musculation` (bitmask 0..15, nul = 0), `snatch`, `clean`, `jerk` (`EXT`/`CATCH`/`PATH` ou nul) ; pas de psychologie. **Résolution de l'évaluation** (`EvaluationService#resolveForProgramme`) : (a) `evaluationId` nul → création d'une évaluation (date du jour, sans `eval_details`, psychologie vide) ; (b) évaluation sélectionnée dont la synthèse (10 champs) est identique au `profile` → réutilisation, aucune écriture ; (c) évaluation sélectionnée dont la synthèse diffère → duplication (nouvelle évaluation à la date du jour avec la synthèse modifiée, copie de tous les `eval_details` sans recalcul de `result`, psychologie recopiée) ; l'évaluation d'origine n'est jamais modifiée. Évaluation d'un autre athlète → 400 ; athlète ou évaluation introuvable → 404 ; paramètres hors domaine (`weeks` ∉ {8,12,16}, `frequency` ∉ {3,4,5}, `duration` ∉ {90,120,150}), `profile` absent ou valeur d'enum/JSON illisible → 400. Résolution de l'évaluation et création du programme dans **une seule transaction** (toute erreur annule aussi l'évaluation et les `eval_details` créés) |
| `POST` | `/programmes/{id}/refresh` | Actualise un programme : régénère **sur place** (même `programme_id`, même en-tête) son contenu semaines → séances → exercices → séries à partir de son évaluation source (relue à son état courant) et de ses paramètres persistés (`weeks`, `frequency`, `duration`, `startDate`, `snatchGoal`, `cjGoal`, `frontSquatGoal`, `backSquatGoal`, `snatchPullGoal`, `cjPullGoal`) ; `endDate` recalculée. Sans corps de requête. 200 + `ProgrammeResponse`. Atomique (`@Transactional`) : génération en mémoire avant toute purge, puis `clear()` des semaines + `flush()` et réinsertion en cascade (toute erreur laisse le programme intact). Programme ou évaluation source introuvable → 404 ; paramètres persistés hors domaine ou objectif Arraché / Épaulé-Jeté nul → 400. Les modifications manuelles sont écrasées |
| `PUT` | `/programmes/{id}/cell` | Édition en bloc d'une case (`weekNumber` × `trainingNumber` × `exerciceOrder`) : body `ProgrammeCellUpdateRequest.exercices[]` (`CellExerciceRequest` : `programmeExerciceId` nullable, `exerciceName`, `series[]` de `CellSeriesRequest`). Remplacement en bloc par identifiant à chaque niveau (suppression/MAJ/insertion exercices puis séries) ; renvoie le détail à jour. Programme ou semaine introuvable → 404 |
| `DELETE` | `/programmes/{id}` | Suppression d'un programme (semaines + séances supprimées en cascade). 204. Introuvable → 404 |
