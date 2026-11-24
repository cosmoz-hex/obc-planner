---
title: Architecture - Base de données
description: Schéma PostgreSQL, contraintes, risques et dettes connus
inclusion: fileMatch
fileMatchPattern:
  - "**/*.sql"
  - "**/entities/**/*.java"
  - "**/repositories/**/*.java"
---

# Architecture — Base de données (OBC Planner)

> Complément de `architecture.md`. À mettre à jour à chaque modification de table/colonne/contrainte ou de dette connue.

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
Séance planifiée d'une semaine de programme. Recentrée sur la séance depuis la refonte en 3 niveaux (les colonnes exercice/série ont migré vers `programme_exercices` / `programme_series`).

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `programme_training_id` | `INTEGER` | PK | Identifiant auto-généré |
| `programme_week_id` | `INTEGER` | NOT NULL, FK → programme_weeks (`ON DELETE CASCADE`) | Semaine parente (index `idx_programme_trainings_1`) |
| `training_number` | `INTEGER` | NOT NULL, CHECK BETWEEN 1 AND 5 | Numéro de la séance hebdomadaire (1 à 5) |

---

#### `programme_exercices`
Exercice planifié dans une séance de programme. Côté « N » de la relation One-Many avec `programme_trainings`, porte lui-même ses séries (`programme_series`).

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `programme_exercice_id` | `INTEGER` | PK | Identifiant auto-généré (`GENERATED BY DEFAULT AS IDENTITY`) |
| `programme_training_id` | `INTEGER` | NOT NULL, FK → programme_trainings (`ON DELETE CASCADE`) | Séance parente (index `idx_programme_exercices_1`) |
| `exercice_order` | `INTEGER` | NOT NULL, CHECK > 0 | Ordre de l'exercice dans la séance (plusieurs exercices au même ordre = alternatives « Au choix ») |
| `exercice_name` | `VARCHAR(255)` | NOT NULL | Nom de l'exercice planifié (libellé libre, non lié au catalogue ; dimensionné pour les libellés composés Épaulé + Jeté) |

---

#### `programme_series`
Série d'un exercice planifié. Côté « N » de la relation One-Many avec `programme_exercices`.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `programme_series_id` | `INTEGER` | PK | Identifiant auto-généré (`GENERATED BY DEFAULT AS IDENTITY`) |
| `programme_exercice_id` | `INTEGER` | NOT NULL, FK → programme_exercices (`ON DELETE CASCADE`) | Exercice parent (index `idx_programme_series_1`) |
| `set_number` | `INTEGER` | CHECK (`set_number IS NULL OR set_number > 0`) | Nombre de séries. **Nullable** (cases sans série : RF, PC, « à définir ») |
| `rep_number` | `VARCHAR(50)` | — | Répétitions au format libre : `'6'`, `'30s'`, `'(1 + 1)'`, le libellé combiné Épaulé-Jeté, ou NULL. **Nullable** ; VARCHAR(50) pour absorber le libellé combiné (ex-`rep_label`) |
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
| `goal` | `VARCHAR(10)` | NOT NULL, CHECK (`chk_ref_exercices_3`) | Objectif : `EXT`, `CATCH`, `PATH` (technique), `KEEP`, `STR`, `SPD` (squat/tirage), `GEN` (Général), `LEGS` (Jambes), `POST` (Chaîne postérieure), `UPPER` (Haut du corps) (musculation) ; **renfo spécifique** (goals composés `{mouvement}_{objectif technique}`) : `SN_EXT`, `SN_CATCH`, `SN_PATH` (Arraché), `CL_EXT`, `CL_CATCH`, `CL_PATH` (Épaulé), `JK_EXT`, `JK_CATCH`, `JK_PATH` (Jeté). Les lignes `RF` sont seedées avec `week_type='F'` par convention (valeur non exploitée par le moteur pour `RF`, qui filtre sur `exercice_type='RF'` + `goal` composé) |
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
L'écran Référentiel > Protocoles et son schéma introduisent des valeurs dont l'exploitation par le **moteur de génération de programme** reste partielle :
- `ref_exercice_sets.rep_number` désormais **textuel** (`'30s'`, `'(1 + 1)'`, NULL…) : hors cas « complex » ci-dessous, le moteur le recopie tel quel dans `programme_series.rep_number` (VARCHAR) sans l'interpréter pour le calcul de volume.

> **Corrigé (combiné Épaulé-Jeté « complex »)** : le moteur distingue désormais, au sein d'une case `CJ`, les **séries combinées « complex »** des séries normales. Une série est « complex » lorsque, sur la série de l'Épaulé (`CL`), `set_number` est renseigné **et** `rep_number` est NULL (`ProgrammeGenerationServiceImpl.isComplexSet(...)`). Dans ce cas, `emitComplexSeries(...)` n'émet **qu'un seul** mouvement — le **point faible** de l'athlète : le Jeté (`JK`) si `preferJerkForComplex` est vrai (et qu'une série JK est présente), sinon l'Épaulé (`CL`). Le **nom** de l'exercice complex est alors celui du **seul mouvement retenu** (plus de concaténation « Épaulé + Jeté »). Les séries normales (`rep_number` renseigné) restent **combinées** CL + JK (comportement inchangé, label `combinedRepLabel`, charge sur la série CL, nom composé « {Épaulé} + {Jeté} »). L'arbitrage `preferJerkForComplex` est calculé en amont par `ProgrammeServiceImpl` à partir des charges réalisées en évaluation (`eval_details` : codes `exercice.clean.tech.simple` vs `exercice.jerk.tech.simple`) — vrai uniquement si les deux mesures sont présentes et CL > JK, sinon faux (repli déterministe sur l'Épaulé, y compris mesure manquante).

> **Corrigé (refonte modèle Programme 3 niveaux)** : les objectifs de musculation `GEN` / `LEGS` / `POST` / `UPPER` sont désormais exploités par le moteur. Une case Musculation (`MS`, semaine `F`) expose **plusieurs exercices alternatifs** « au choix » (un par orientation cochée, au même ordre de case), via `MusculationQueueBuilder.bitmaskToGoals(...)` + lookup `ref_exercices` par (`MS`, `F`, `goal`, ordre). L'ancienne file rotative « un exercice par semaine » (`MusculationQueue.rotate()`) a été supprimée.

Tant que le moteur n'a pas évolué sur les points restants ci-dessus, les exercices/séries saisis avec ces nouvelles valeurs peuvent ne pas être pris en compte (ou mal interprétés) lors de la génération d'un programme. Évolution du moteur à planifier hors périmètre de la feature Protocoles.

### Actualisation d'un programme : modifications manuelles écrasées
`POST /programmes/{id}/refresh` régénère l'intégralité du contenu (semaines → séances → exercices → séries) à partir de l'évaluation source **relue à son état courant** et des paramètres persistés : toute modification manuelle (édition de cellule) est **écrasée** sans possibilité de fusion ni d'annulation (avertissement affiché dans la confirmation côté front). Les identifiants des semaines/séances/exercices/séries sont **recréés** (seul `programme_id` est conservé) ; l'URL d'impression `/programmes/:id/impression` reste valide.

### Génération de programme en saisie libre : évaluations créées/dupliquées et cascade
- **Suppression en cascade** : `programmes.evaluation_id` référence `eval_summaries` via `fk_programmes_1` (`ON DELETE CASCADE`, cf. `V20260901_233100__athlete_cascade.sql`). Une évaluation pouvant être réutilisée (cas b) par plusieurs programmes, supprimer cette évaluation supprime **tous** les programmes qui en dépendent.
- **Accumulation d'évaluations** : chaque génération sans évaluation sélectionnée (a) ou avec synthèse modifiée (c) crée une nouvelle ligne `eval_summaries` (date du jour), sans marquage ni dédoublonnage : la liste des évaluations d'un athlète grossit à chaque génération, y compris pour des synthèses identiques. Les évaluations créées en (a) n'ont aucun `eval_details`.
- **Écart avec `product.md`** : la règle « une évaluation ayant déjà généré un plan n'est ni modifiable ni supprimable » n'est toujours **pas appliquée** (ni côté back, ni côté front) ; la réutilisation (b) rend l'écart plus visible.
- **Wizard d'évaluation et synthèse recalculée** : le wizard d'évaluation recalcule la synthèse depuis les mesures. Une évaluation sans mesures (créée en (a)) rouverte dans ce wizard voit donc sa synthèse recalculée (comportement accepté).
- Génération sans `eval_details` (a) : `preferJerkForComplex` retombe sur l'Épaulé ; en (b) l'arbitrage vient des mesures de l'évaluation, en (c) des mesures copiées à l'identique.

### Génération de programme : couverture incomplète de la trame
Le moteur de génération (`ProgrammeGenerationService`) construit l'arbre séance → exercice → série en mémoire puis le persiste en cascade. Il présente les limites suivantes, assumées dans le périmètre actuel :
- `PC` (pliométrie / cardio) **n'a aucun protocole** dans `ref_exercices` : les cases correspondantes sont générées avec un **libellé fixe en français stocké en base** (décision : application locale, libellé FR assumé, non internationalisé).
- Une **semaine de type `PC`** (pré-compétition) voit **toutes ses cases générées en « (à définir) »** : la trame spécifique de la semaine PC sera fournie ultérieurement (hors périmètre actuel).
- Si **aucun protocole** ne correspond à une combinaison (`exercice_type` / `week_type` / `goal` / ordre), la case est générée en **« (à définir) »**.

> **Corrigé (renfo spécifique, spec `.kiro/specs/renforcement-specifique/`)** : les cases `RF` sont résolues par `resolveRenfo(...)` (rotation hebdomadaire, détail dans `architecture.md`) ; repli « à définir » si l'objectif technique est absent ou si aucun protocole ne correspond. `PC` reste en libellé fixe (hors périmètre).
