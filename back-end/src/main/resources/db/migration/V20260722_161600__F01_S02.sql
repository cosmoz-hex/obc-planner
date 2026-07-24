-- 1. Table des athlètes
CREATE TABLE IF NOT EXISTS "athletes" (
    "id" varchar(255) NOT NULL,
    "prenom" varchar(255),
    "nom" varchar(255),
    "sexe" varchar(255),
    "date_naissance" date,
    PRIMARY KEY("id")
    );

-- 2. Catalogue d'exercices
CREATE TABLE IF NOT EXISTS "catalogue_exercices" (
    "id" serial NOT NULL,
    "type_mouvement" varchar(255),
    "categorie" varchar(255),
    "nom_exercice" varchar(255),
    "id_exercice_reference" int REFERENCES "catalogue_exercices"("id"),
    "pct_charge_theorique" decimal,
    PRIMARY KEY("id")
    );

-- 2. Insertion des données : Profil Technique (Table de Baroga)
DELETE FROM "catalogue_exercices";

INSERT INTO "catalogue_exercices" ("id", "type_mouvement", "categorie", "nom_exercice", "id_exercice_reference", "pct_charge_theorique") VALUES

-- Exercice Racine
(1, 'TOTAL', 'Profil technique', 'Total', NULL, 100.00),

-- Mouvements Principaux (Dépendent du Total - ID 1)
(2, 'ARR', 'TECH', 'Arraché (x1)', 1, 44.00),
(13, 'EP', 'TECH', 'Épaulé (x1)', 1, 56.00),
(24, 'JT', 'TECH', 'Jeté Fente', 1, 56.00),

-- Dérivés de l'Arraché (Dépendent d'Arraché (x1) - ID 2)
(3, 'ARR', 'SEMI_TECH_LOURD', 'Arraché flexion', 2, 100.00),
(4, 'ARR', 'SEMI_TECH_LOURD', 'Arraché debout', 2, 85.00),
(5, 'ARR', 'SEMI_TECH_LOURD', 'Arraché plots', 2, 95.00),
(6, 'ARR', 'SEMI_TECH_LOURD', 'Arraché suspension', 2, 95.00),
(7, 'ARR', 'SEMI_TECH_LOURD', 'Arraché puissance', 2, 92.00),
(8, 'ARR', 'SEMI_TECH_LEGER', 'Arraché force', 2, 63.00),
(9, 'ARR', 'SEMI_TECH_LOURD', 'Chute arraché', 2, 100.00),
(10, 'ARR', 'SEMI_TECH_LEGER', 'Passage arraché', 2, 56.00),
(11, 'TIRAGE', 'RENFO_SPE', 'Tirage arraché (x1)', 2, 120.00),
(12, 'TIRAGE', 'RENFO_SPE', 'Tirage haut arraché', 2, 100.00),

-- Dérivés de l'Épaulé (Dépendent d'Épaulé (x1) - ID 13)
(14, 'EP', 'SEMI_TECH_LOURD', 'Épaulé flexion', 13, 100.00),
(15, 'EP', 'SEMI_TECH_LOURD', 'Épaulé debout', 13, 84.00),
(16, 'EP', 'SEMI_TECH_LOURD', 'Épaulé plots', 13, 95.00),
(17, 'EP', 'SEMI_TECH_LOURD', 'Épaulé suspension', 13, 95.00),
(18, 'EP', 'SEMI_TECH_LOURD', 'Épaulé puissance', 13, 92.00),
(19, 'EP', 'SEMI_TECH_LEGER', 'Épaulé force', 13, 63.00),
(20, 'EP', 'SEMI_TECH_LEGER', 'Passage épaulé', 13, 62.00),
(21, 'TIRAGE', 'RENFO_SPE', 'Tirage épaulé (x1)', 13, 130.00),
(22, 'SQUAT', 'RENFO_SPE', 'Flexion nuque (x1)', 13, 135.00),
(23, 'SQUAT', 'RENFO_SPE', 'Flexion clavicule (x1)', 13, 114.00),

-- Dérivés du Jeté (Dépendent de Jeté Fente - ID 24)
(25, 'JT', 'SEMI_TECH_LOURD', 'Jeté debout', 24, 92.00),
(26, 'JT', 'SEMI_TECH_LOURD', 'Jeté puissance', 24, 90.00),
(27, 'JT', 'SEMI_TECH_LEGER', 'Jeté force', 24, 71.00),

-- Correctifs et Combinés Arraché (IDs 28 - 66)
(28, 'ARR', 'SEMI_TECH_LEGER', 'Arraché Bassin', 2, 75.00),
(29, 'ARR', 'COMBINE', '1 Arraché Debout + 2 Flexion d’Arraché + 1 Arraché Flexion', 2, 70.00),
(30, 'ARR', 'CORRECTIF', 'Arraché Pause', 2, 80.00),
(31, 'ARR', 'CORRECTIF', 'Chute Arraché (avec élan)', 2, 70.00),
(32, 'ARR', 'CORRECTIF', 'Chute Arraché (sans élan)', 2, 60.00),
(33, 'ARR', 'CORRECTIF', 'Développé Arraché Flexion', 2, 50.00),
(34, 'ARR', 'CORRECTIF', 'Flexion Arraché avec Élastique', 2, 50.00),
(35, 'ARR', 'COMBINE', '3 x (1 Tirage Haut Arraché + 1 Arraché Debout Suspension)', 2, 75.00),
(36, 'ARR', 'COMBINE', '2 Tirage Lourd Arraché + 2 Arraché Debout', 2, 80.00),
(37, 'ARR', 'SEMI_TECH_LOURD', 'Arraché Plot', 2, 90.00),
(38, 'ARR', 'CORRECTIF', 'Arraché Debout Départ Lent', 2, 75.00),
(39, 'ARR', 'CORRECTIF', 'Arraché Force Prise Épaulé', 2, 60.00),
(40, 'ARR', 'CORRECTIF', 'Arraché Debout Bassin', 2, 75.00),
(41, 'TIRAGE', 'RENFO_SPE', 'Tirage Bras Arraché', 2, 85.00),
(42, 'ARR', 'CORRECTIF', 'Développé Arraché Debout', 2, 50.00),
(43, 'ARR', 'COMBINE', '3 x (1 Tirage Haut Arraché + 1 Arraché Suspension)', 2, 75.00),
(44, 'ARR', 'COMBINE', '1 Arraché + 1 Arraché Suspension + 1 Arraché', 2, 80.00),
(45, 'ARR', 'CORRECTIF', 'Arraché Déficit', 2, 85.00),
(46, 'ARR', 'CORRECTIF', 'Arraché Force Plots', 2, 65.00),
(47, 'ARR', 'CORRECTIF', 'Arraché Puissance Debout Bassin', 2, 80.00),
(48, 'RENFO', 'RENFO_SPE', 'Rowing Prise Arraché', 2, 80.00),
(49, 'ARR', 'COMBINE', '3 x (1 Tirage Haut Arraché + 1 Arraché Suspension) - Alt', 2, 75.00),
(50, 'ARR', 'COMBINE', '1 Arraché + 1 Arraché Suspension + 1 Arraché - Alt', 2, 80.00),
(51, 'ARR', 'CORRECTIF', 'Arraché Force Suspension', 2, 65.00),
(52, 'ARR', 'COMBINE', '2 x (1 Tirage Arraché + 1 Arraché Puissance + 1 Flexion)', 2, 75.00),
(53, 'ARR', 'COMBINE', '1 Arraché Puissance Bassin + 1 Arraché Puissance Susp. + 1 Arraché Puissance', 2, 75.00),
(54, 'ARR', 'CORRECTIF', 'Arraché Puissance Bassin', 2, 85.00),
(55, 'ARR', 'CORRECTIF', 'Arraché Départ Lent', 2, 80.00),
(56, 'ARR', 'CORRECTIF', 'Passage Arraché Pied Plat', 2, 55.00),
(57, 'ARR', 'COMBINE', '3 x (1 Tirage Haut Arraché + 1 Arraché Debout Suspension) - Alt', 2, 75.00),
(58, 'ARR', 'COMBINE', '3 x (1 Arraché Force + 1 Chute Arraché avec élan)', 2, 60.00),
(59, 'ARR', 'CORRECTIF', 'Arraché Debout Plot', 2, 80.00),
(60, 'ARR', 'CORRECTIF', 'Arraché Force sans contact', 2, 60.00),
(61, 'ARR', 'COMBINE', '3 x (1 Arraché Force + 1 Chute Arraché avec élan) - Alt', 2, 60.00),
(62, 'ARR', 'COMBINE', '1 Arraché Debout + 2 Flexion d’Arraché + 1 Arraché Flexion - Alt', 2, 70.00),
(63, 'ARR', 'CORRECTIF', 'Arraché Bassin (Chute)', 2, 75.00),
(64, 'ARR', 'CORRECTIF', 'Arraché Flexion (pause réception)', 2, 85.00),
(65, 'ARR', 'COMBINE', '2 x (1 Tirage Haut Arraché + 1 Arraché Bassin + 1 Chute Arraché)', 2, 75.00),
(66, 'ARR', 'COMBINE', '1 Arraché + 1 Arraché Suspension Basse + 1 Arraché Suspension Haute', 2, 80.00),

-- Correctifs et Combinés Épaulé (IDs 67 - 96)
(67, 'EP', 'COMBINE', '1 Épaulé Debout + 2 Flexion + 1 Jeté + 1 Épaulé Flexion + 1 Jeté', 13, 75.00),
(68, 'EP', 'COMBINE', '1 Épaulé Bassin + 1 Épaulé Susp. H. + 1 Épaulé Susp. B. + 1 Jeté', 13, 75.00),
(69, 'EP', 'CORRECTIF', 'Épaulé Pause', 13, 85.00),
(70, 'EP', 'CORRECTIF', 'Épaulé Bassin', 13, 80.00),
(71, 'EP', 'CORRECTIF', 'Épaulé Puissance Flexion Bassin', 13, 85.00),
(72, 'EP', 'CORRECTIF', 'Passage Épaulé Pied Plat', 13, 60.00),
(73, 'RENFO', 'RENFO_SPE', 'Rowing Prise Épaulé', 13, 85.00),
(74, 'EP', 'COMBINE', '2 x (1 Tirage Épaulé Bassin + 1 Épaulé Debout) + 1 Jeté', 13, 75.00),
(75, 'EP', 'COMBINE', '1 Épaulé Deb. Susp. H. + 1 Épaulé Deb. Susp. B. + 1 Épaulé Debout + 1 Jeté', 13, 75.00),
(76, 'EP', 'SEMI_TECH_LOURD', 'Épaulé Plot', 13, 90.00),
(77, 'EP', 'CORRECTIF', 'Épaulé Puissance Debout', 13, 85.00),
(78, 'EP', 'CORRECTIF', 'Épaulé Debout Bassin', 13, 80.00),
(79, 'TIRAGE', 'RENFO_SPE', 'Tirage Bras Épaulé', 13, 90.00),
(80, 'EP', 'COMBINE', '2 x (1 Tirage Épaulé Bassin + 1 Épaulé Debout) + 1 Jeté - Alt 1', 13, 75.00),
(81, 'EP', 'COMBINE', '1 Épaulé Debout + 1 Épaulé Susp. B. + 1 Épaulé Susp. H. + 1 Jeté', 13, 75.00),
(82, 'EP', 'CORRECTIF', 'Épaulé Déficit', 13, 85.00),
(83, 'EP', 'CORRECTIF', 'Épaulé Force Plots', 13, 65.00),
(84, 'EP', 'CORRECTIF', 'Épaulé Puissance Debout Bassin', 13, 80.00),
(85, 'EP', 'COMBINE', '2 x (1 Tirage Épaulé Bassin + 1 Épaulé Debout) + 1 Jeté - Alt 2', 13, 75.00),
(86, 'EP', 'COMBINE', '1 Épaulé Debout + 1 Épaulé Susp. B. + 1 Épaulé Susp. H. + 1 Jeté - Alt', 13, 75.00),
(87, 'EP', 'CORRECTIF', 'Épaulé Force Suspension', 13, 65.00),
(88, 'EP', 'COMBINE', '2 x (1 Épaulé Puissance Debout + 1 Flexion + 1 Jeté)', 13, 75.00),
(89, 'EP', 'COMBINE', '2 x (1 Tirage Épaulé + 1 Épaulé Puissance Suspension + 1 Jeté)', 13, 75.00),
(90, 'EP', 'CORRECTIF', 'Épaulé Puissance Bassin', 13, 85.00),
(91, 'EP', 'COMBINE', '2 x (1 Tirage Épaulé Bassin + 1 Épaulé Debout) + 1 Jeté - Alt 3', 13, 75.00),
(92, 'EP', 'COMBINE', '1 Épaulé Deb. Susp. H. + 1 Épaulé Deb. Susp. B. + 1 Épaulé Debout + 1 Jeté - Alt', 13, 75.00),
(93, 'EP', 'CORRECTIF', 'Épaulé Debout Plot', 13, 80.00),
(94, 'EP', 'CORRECTIF', 'Épaulé Force sans contact', 13, 60.00),
(95, 'EP', 'COMBINE', '2 x (1 Épaulé Plot + 1 Flexion) + 1 Jeté', 13, 75.00),
(96, 'EP', 'COMBINE', '1 Épaulé Debout + 2 Flexion + 1 Jeté + 1 Épaulé Flexion + 1 Jeté - Alt', 13, 75.00),

-- Correctifs et Combinés Jeté (IDs 97 - 113)
(97, 'JT', 'COMBINE', '1 Épaulé Debout + 1 Jeté Debout + 1 Épaulé + 1 Jeté Fente', 24, 75.00),
(98, 'JT', 'COMBINE', '1 Épaulé Debout + 2 Flexion + 1 Jeté Pause + 1 Épaulé Flexion + 1 Jeté', 24, 75.00),
(99, 'JT', 'CORRECTIF', 'Jeté Pause', 24, 85.00),
(100, 'JT', 'CORRECTIF', 'Jeté Fente (Appel Fente)', 24, 80.00),
(101, 'JT', 'CORRECTIF', 'Va-et-viens Jeté', 24, 70.00),
(102, 'JT', 'CORRECTIF', 'Chute de Jeté', 24, 60.00),
(103, 'JT', 'RENFO_SPE', 'Développé Fente', 24, 50.00),
(104, 'JT', 'RENFO_SPE', 'Fente à la barre', 24, 70.00),
(105, 'JT', 'COMBINE', '1 Épaulé Debout + 2 Jeté Force + 1 Épaulé Debout + 1 Jeté Debout', 24, 75.00),
(106, 'JT', 'COMBINE', '1 Épaulé Debout + 2 Flexion + 1 Jeté Pause + 1 Épaulé Flexion + 1 Jeté - Alt 1', 24, 75.00),
(107, 'JT', 'RENFO_SPE', 'Développé Nuque', 24, 60.00),
(108, 'JT', 'CORRECTIF', 'Appel de Jeté ou Gainage Barre', 24, 90.00),
(109, 'JT', 'COMBINE', '1 Épaulé Puissance Debout + 2 Jeté Force + 1 Puissance Debout + 1 Jeté Puissance', 24, 75.00),
(110, 'JT', 'COMBINE', '1 Épaulé Debout + 2 Flexion + 1 Jeté Pause + 1 Épaulé Flexion + 1 Jeté - Alt 2', 24, 75.00),
(111, 'JT', 'COMBINE', '5s Appel Jeté + 3 Jeté Force', 24, 70.00),
(112, 'JT', 'COMBINE', '1 Épaulé Puissance Debout + 2 Jeté Force + 1 Puissance Debout + 1 Jeté Puissance - Alt', 24, 75.00),
(113, 'JT', 'RENFO_SPE', 'Développé Militaire', 24, 65.00);

-- 3. Évaluations (dépend des athlètes)
CREATE TABLE IF NOT EXISTS "evaluations" (
    "id" varchar(255) NOT NULL,
    "id_athlete" varchar(255) REFERENCES "athletes"("id"),
    "date_evaluation" date,
    "poids_kg" decimal,
    "niveau" varchar(255),
    PRIMARY KEY("id")
    );

-- 4. Profil force-vitesse
CREATE TABLE IF NOT EXISTS "profils_force_vitesse" (
    "id_evaluation" varchar(255) NOT NULL REFERENCES "evaluations"("id"),
    "detente_avec_elan_cm" decimal,
    "detente_seche_cm" decimal,
    "squat_30pct_mps" decimal,
    "squat_50pct_mps" decimal,
    "squat_70pct_mps" decimal,
    "tirage_haut_80pct_mps" decimal,
    "ratio_3rm_front_squat" decimal,
    "ratio_3rm_back_squat" decimal,
    "ratio_3rm_tirage_arrache" decimal,
    "ratio_3rm_tirage_epj" decimal,
    "grip_pct_bw" decimal,
    "profil_resultat" varchar(255),
    PRIMARY KEY("id_evaluation")
    );

-- 5. Profil technique
CREATE TABLE IF NOT EXISTS "profils_techniques" (
    "id_evaluation" varchar(255) NOT NULL REFERENCES "evaluations"("id"),
    "taux_reussite_arrache" decimal,
    "taux_reussite_epj" decimal,
    "taux_reussite_1er_essai_arrache" decimal,
    "taux_reussite_1er_essai_epj" decimal,
    "points_forts" varchar(255),
    "points_faibles" varchar(255),
    "profil_resultat" varchar(255),
    PRIMARY KEY("id_evaluation")
    );

-- 6. Profil neuromusculaire
CREATE TABLE IF NOT EXISTS "profils_neuromusculaires" (
    "id_evaluation" varchar(255) NOT NULL REFERENCES "evaluations"("id"),
    "type_protocole" int,
    "bpm_tension_au_repos" varchar(255),
    "bpm_tension_sous_fatigue" varchar(255),
    "duree_du_protocole" varchar(255),
    "duree_de_recuperation" varchar(255),
    "max_reps_squat_nuque_70pct" int,
    "max_reps_tirage_epaule_70pct" int,
    "pct_arrache_3reps" decimal,
    "pct_arrache_2reps" decimal,
    "pct_epj_3reps" decimal,
    "pct_epj_2reps" decimal,
    "gainage_planche_sec" int,
    "gainage_planche_50pct_bw_sec" int,
    "gainage_planche_100pct_bw_sec" int,
    "profil_resultat_cardio" varchar(255),
    "profil_resultat_musculaire" varchar(255),
    PRIMARY KEY("id_evaluation")
    );


-- 7. Profil psychologique
CREATE TABLE IF NOT EXISTS "profils_psychologiques" (
    "id_evaluation" varchar(255) NOT NULL REFERENCES "evaluations"("id"),
    "score_gestion_emotionnelle" int,
    "score_confiance" int,
    "score_motivation" int,
    "score_concentration" int,
    "score_competition" int,
    "score_rapport_echec" int,
    "score_autonomie" int,
    "forces" varchar(255),
    "faiblesses" varchar(255),
    PRIMARY KEY("id_evaluation")
    );

-- ============================================================================
-- 8. Exercices correctifs (dépend du catalogue d'exercices)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "exercices_correctifs" (
    "id_exercice" int NOT NULL REFERENCES "catalogue_exercices"("id") ON DELETE CASCADE,
    "id_exercice_correctif" int NOT NULL REFERENCES "catalogue_exercices"("id") ON DELETE CASCADE,
    PRIMARY KEY ("id_exercice", "id_exercice_correctif")
    );

-- Script idempotent : DELETE sans WHERE avant chaque INSERT
DELETE FROM "exercices_correctifs";

INSERT INTO "exercices_correctifs" ("id_exercice", "id_exercice_correctif")
VALUES (3, 28),   -- Arraché flexion -> 1 Tirage Haut Arraché + 2 Arraché Bassin + 2 Chute Arraché
       (3, 29),   -- Arraché flexion -> 1 Arraché Debout + 2 Flexion d’Arraché + 1 Arraché Flexion
       (3, 30),   -- Arraché flexion -> Arraché Pause
       (3, 31),   -- Arraché flexion -> Chute Arraché (avec élan)
       (3, 3),    -- Arraché flexion -> Arraché flexion
       (3, 32),   -- Arraché flexion -> Chute Arraché (sans élan)
       (3, 10),   -- Arraché flexion -> Passage Arraché
       (3, 33),   -- Arraché flexion -> Développé Arraché Flexion
       (3, 34),   -- Arraché flexion -> Flexion Arraché avec Élastique
       (4, 35),   -- Arraché debout -> 3 x (1 Tirage Haut Arraché + 1 Arraché Debout Suspension)
       (4, 36),   -- Arraché debout -> 2 Tirage Lourd Arraché + 2 Arraché Debout
       (4, 37),   -- Arraché debout -> Arraché Plot
       (4, 38),   -- Arraché debout -> Arraché Debout Départ Lent
       (4, 4),    -- Arraché debout -> Arraché Debout
       (4, 39),   -- Arraché debout -> Arraché Force Prise Épaulé
       (4, 40),   -- Arraché debout -> Arraché Debout Bassin
       (4, 41),   -- Arraché debout -> Tirage Bras Arraché
       (4, 42),   -- Arraché debout -> Développé Arraché Debout
       (5, 43),   -- Arraché plots -> 3 x (1 Tirage Haut Arraché + 1 Arraché Suspension)
       (5, 44),   -- Arraché plots -> 1 Arraché + 1 Arraché Suspension + 1 Arraché
       (5, 6),    -- Arraché plots -> Arraché Suspension
       (5, 45),   -- Arraché plots -> Arraché Déficit
       (5, 5),    -- Arraché plots -> Arraché Plots
       (5, 46),   -- Arraché plots -> Arraché Force Plots
       (5, 47),   -- Arraché plots -> Arraché Puissance Debout Bassin
       (5, 48),   -- Arraché plots -> Rowing Prise Arraché
       (5, 41),   -- Arraché plots -> Tirage Bras Arraché
       (6, 49),   -- Arraché suspension -> 3 x (1 Tirage Haut Arraché + 1 Arraché Suspension)
       (6, 50),   -- Arraché suspension -> 1 Arraché + 1 Arraché Suspension + 1 Arraché
       (6, 5),    -- Arraché suspension -> Arraché Plots
       (6, 45),   -- Arraché suspension -> Arraché Déficit
       (6, 6),    -- Arraché suspension -> Arraché Suspension
       (6, 51),   -- Arraché suspension -> Arraché Force Suspension
       (6, 47),   -- Arraché suspension -> Arraché Puissance Debout Bassin
       (6, 48),   -- Arraché suspension -> Rowing Prise Arraché
       (6, 41),   -- Arraché suspension -> Tirage Bras Arraché
       (7, 52),   -- Arraché puissance -> 2 x (1 Tirage Arraché + 1 Arraché Puissance + 1 Flexion)
       (7, 53),   -- Arraché puissance -> 1 Arraché Puissance Bassin + 1 Arraché Puissance Susp. + 1 Arraché Puissance
       (7, 54),   -- Arraché puissance -> Arraché Puissance Bassin
       (7, 55),   -- Arraché puissance -> Arraché Départ Lent
       (7, 7),    -- Arraché puissance -> Arraché puissance
       (7, 8),    -- Arraché puissance -> Arraché Force
       (7, 10),   -- Arraché puissance -> Passage Arraché
       (7, 56),   -- Arraché puissance -> Passage Arraché Pied Plat
       (7, 48),   -- Arraché puissance -> Rowing Prise Arraché
       (8, 57),   -- Arraché force -> 3 x (1 Tirage Haut Arraché + 1 Arraché Debout Suspension)
       (8, 58),   -- Arraché force -> 3 x (1 Arraché Force + 1 Chute Arraché avec élan)
       (8, 59),   -- Arraché force -> Arraché Debout Plot
       (8, 7),    -- Arraché force -> Arraché Puissance
       (8, 60),   -- Arraché force -> Arraché Force sans contact
       (8, 47),   -- Arraché force -> Arraché Puissance Debout Bassin
       (8, 8),    -- Arraché force -> Arraché Force
       (8, 48),   -- Arraché force -> Rowing Prise Arraché
       (8, 41),   -- Arraché force -> Tirage Bras Arraché
       (9, 61),   -- Chute arraché -> 3 x (1 Arraché Force + 1 Chute Arraché avec élan)
       (9, 62),   -- Chute arraché -> 1 Arraché Debout + 2 Flexion d’Arraché + 1 Arraché Flexion
       (9, 63),   -- Chute arraché -> Arraché Bassin
       (9, 64),   -- Chute arraché -> Arraché Flexion (pause réception)
       (9, 9),    -- Chute arraché -> Chute arraché
       (9, 32),   -- Chute arraché -> Chute Arraché (sans élan)
       (9, 10),   -- Chute arraché -> Passage Arraché
       (9, 33),   -- Chute arraché -> Développé Arraché Flexion
       (9, 34),   -- Chute arraché -> Flexion Arraché avec Élastique
       (10, 65),  -- Passage arraché -> 2 x (1 Tirage Haut Arraché + 1 Arraché Bassin + 1 Chute Arraché)
       (10, 66),  -- Passage arraché -> 1 Arraché + 1 Arraché Suspension Basse + 1 Arraché Suspension Haute
       (10, 63),  -- Passage arraché -> Arraché Bassin
       (10, 6),   -- Passage arraché -> Arraché Suspension
       (10, 32),  -- Passage arraché -> Chute Arraché (sans élan)
       (10, 51),  -- Passage arraché -> Arraché Force Suspension
       (10, 10),  -- Passage arraché -> Passage arraché
       (10, 41),  -- Passage arraché -> Tirage Bras Arraché
       (10, 56),  -- Passage arraché -> Passage Arraché Pied Plat
       (14, 67),  -- Épaulé flexion -> 1 Épaulé Debout + 2 Flexion + 1 Jeté + 1 Épaulé Flexion + 1 Jeté
       (14, 68),  -- Épaulé flexion -> 1 Épaulé Bassin + 1 Épaulé Susp. H. + 1 Épaulé Susp. B. + 1 Jeté
       (14, 69),  -- Épaulé flexion -> Épaulé Pause
       (14, 70),  -- Épaulé flexion -> Épaulé Bassin
       (14, 14),  -- Épaulé flexion -> Épaulé Flexion
       (14, 20),  -- Épaulé flexion -> Passage Épaulé
       (14, 71),  -- Épaulé flexion -> Épaulé Puissance Flexion Bassin
       (14, 72),  -- Épaulé flexion -> Passage Épaulé Pied Plat
       (14, 73),  -- Épaulé flexion -> Rowing Prise Épaulé
       (15, 74),  -- Épaulé debout -> 2 x (1 Tirage Épaulé Bassin + 1 Épaulé Debout) + 1 Jeté
       (15, 75),  -- Épaulé debout -> 1 Épaulé Deb. Susp. H. + 1 Épaulé Deb. Susp. B. + 1 Épaulé Debout + 1 Jeté
       (15, 76),  -- Épaulé debout -> Épaulé Plot
       (15, 77),  -- Épaulé debout -> Épaulé Puissance Debout
       (15, 15),  -- Épaulé debout -> Épaulé Debout
       (15, 78),  -- Épaulé debout -> Épaulé Debout Bassin
       (15, 19),  -- Épaulé debout -> Épaulé Force
       (15, 79),  -- Épaulé debout -> Tirage Bras Épaulé
       (15, 73),  -- Épaulé debout -> Rowing Prise Épaulé
       (16, 80),  -- Épaulé plots -> 2 x (1 Tirage Épaulé Bassin + 1 Épaulé Debout) + 1 Jeté
       (16, 81),  -- Épaulé plots -> 1 Épaulé Debout + 1 Épaulé Susp. B. + 1 Épaulé Susp. H. + 1 Jeté
       (16, 17),  -- Épaulé plots -> Épaulé Suspension
       (16, 82),  -- Épaulé plots -> Épaulé Déficit
       (16, 16),  -- Épaulé plots -> Épaulé Plots
       (16, 83),  -- Épaulé plots -> Épaulé Force Plots
       (16, 84),  -- Épaulé plots -> Épaulé Puissance Debout Bassin
       (16, 79),  -- Épaulé plots -> Tirage Bras Épaulé
       (16, 73),  -- Épaulé plots -> Rowing Prise Épaulé
       (17, 85),  -- Épaulé suspension -> 2 x (1 Tirage Épaulé Bassin + 1 Épaulé Debout) + 1 Jeté
       (17, 86),  -- Épaulé suspension -> 1 Épaulé Debout + 1 Épaulé Susp. B. + 1 Épaulé Susp. H. + 1 Jeté
       (17, 16),  -- Épaulé suspension -> Épaulé Plots
       (17, 82),  -- Épaulé suspension -> Épaulé Déficit
       (17, 17),  -- Épaulé suspension -> Épaulé Suspension
       (17, 87),  -- Épaulé suspension -> Épaulé Force Suspension
       (17, 84),  -- Épaulé suspension -> Épaulé Puissance Debout Bassin
       (17, 79),  -- Épaulé suspension -> Tirage Bras Épaulé
       (17, 73),  -- Épaulé suspension -> Rowing Prise Épaulé
       (18, 88),  -- Épaulé puissance -> 2 x (1 Épaulé Puissance Debout + 1 Flexion + 1 Jeté)
       (18, 89),  -- Épaulé puissance -> 2 x (1 Tirage Épaulé + 1 Épaulé Puissance Suspension + 1 Jeté)
       (18, 90),  -- Épaulé puissance -> Épaulé Puissance Bassin
       (18, 69),  -- Épaulé puissance -> Épaulé Pause
       (18, 18),  -- Épaulé puissance -> Épaulé Puissance
       (18, 19),  -- Épaulé puissance -> Épaulé Force
       (18, 20),  -- Épaulé puissance -> Passage Épaulé
       (18, 72),  -- Épaulé puissance -> Passage Épaulé Pied Plat
       (18, 73),  -- Épaulé puissance -> Rowing Prise Épaulé
       (19, 91),  -- Épaulé force -> 2 x (1 Tirage Épaulé Bassin + 1 Épaulé Debout) + 1 Jeté
       (19, 92),  -- Épaulé force -> 1 Épaulé Deb. Susp. H. + 1 Épaulé Deb. Susp. B. + 1 Épaulé Debout + 1 Jeté
       (19, 93),  -- Épaulé force -> Épaulé Debout Plot
       (19, 18),  -- Épaulé force -> Épaulé Puissance
       (19, 94),  -- Épaulé force -> Épaulé Force sans contact
       (19, 84),  -- Épaulé force -> Épaulé Puissance Debout Bassin
       (19, 19),  -- Épaulé force -> Épaulé Force
       (19, 79),  -- Épaulé force -> Tirage Bras Épaulé
       (19, 73),  -- Épaulé force -> Rowing Prise Épaulé
       (20, 95),  -- Passage Épaulé -> 2 x (1 Épaulé Plot + 1 Flexion) + 1 Jeté
       (20, 96),  -- Passage Épaulé -> 1 Épaulé Debout + 2 Flexion + 1 Jeté + 1 Épaulé Flexion + 1 Jeté
       (20, 70),  -- Passage Épaulé -> Épaulé Bassin
       (20, 17),  -- Passage Épaulé -> Épaulé Suspension
       (20, 71),  -- Passage Épaulé -> Épaulé Puissance Flexion Bassin
       (20, 87),  -- Passage Épaulé -> Épaulé Force Suspension
       (20, 20),  -- Passage Épaulé -> Passage Épaulé
       (20, 72),  -- Passage Épaulé -> Passage Épaulé Pied Plat
       (20, 79),  -- Passage Épaulé -> Tirage Bras Épaulé
       (24, 97),  -- Jeté Fente -> 1 Épaulé Debout + 1 Jeté Debout + 1 Épaulé + 1 Jeté Fente
       (24, 98),  -- Jeté Fente -> 1 Épaulé Debout + 2 Flexion + 1 Jeté Pause + 1 Épaulé Flexion + 1 Jeté
       (24, 99),  -- Jeté Fente -> Jeté Pause
       (24, 100), -- Jeté Fente -> Jeté Fente (Appel Fente)
       (24, 24),  -- Jeté Fente -> Jeté Fente
       (24, 101), -- Jeté Fente -> Va-et-viens Jeté
       (24, 102), -- Jeté Fente -> Chute de Jeté
       (24, 103), -- Jeté Fente -> Développé Fente
       (24, 104), -- Jeté Fente -> Fente à la barre
       (25, 105), -- Jeté Debout -> 1 Épaulé Debout + 2 Jeté Force + 1 Épaulé Debout + 1 Jeté Debout
       (25, 106), -- Jeté Debout -> 1 Épaulé Debout + 2 Flexion + 1 Jeté Pause + 1 Épaulé Flexion + 1 Jeté
       (25, 26),  -- Jeté Debout -> Jeté Puissance
       (25, 99),  -- Jeté Debout -> Jeté Pause
       (25, 25),  -- Jeté Debout -> Jeté Debout
       (25, 27),  -- Jeté Debout -> Jeté Force
       (25, 107), -- Jeté Debout -> Développé Nuque
       (25, 108), -- Jeté Debout -> Appel de Jeté ou Gainage Barre
       (26, 109), -- Jeté Puissance -> 1 Épaulé Puissance Debout + 2 Jeté Force + 1 Puissance Debout + 1 Jeté Puissance
       (26, 110), -- Jeté Puissance -> 1 Épaulé Debout + 2 Flexion + 1 Jeté Pause + 1 Épaulé Flexion + 1 Jeté
       (26, 25),  -- Jeté Puissance -> Jeté Debout
       (26, 99),  -- Jeté Puissance -> Jeté Pause
       (26, 26),  -- Jeté Puissance -> Jeté Puissance
       (26, 27),  -- Jeté Puissance -> Jeté Force
       (26, 107), -- Jeté Puissance -> Développé Nuque
       (26, 108), -- Jeté Puissance -> Appel de Jeté ou Gainage Barre
       (27, 111), -- Jeté Force -> 5s Appel Jeté + 3 Jeté Force
       (27, 112), -- Jeté Force -> 1 Épaulé Puissance Debout + 2 Jeté Force + 1 Puissance Debout + 1 Jeté Puissance
       (27, 25),  -- Jeté Force -> Jeté Debout
       (27, 99),  -- Jeté Force -> Jeté Pause
       (27, 26),  -- Jeté Force -> Jeté Puissance
       (27, 27),  -- Jeté Force -> Jeté Force
       (27, 113), -- Jeté Force -> Développé Militaire
       (27, 108); -- Jeté Force -> Appel de Jeté ou Gainage Barre

-- 9. Performances d'évaluation (dépend des évaluations et du catalogue)
CREATE TABLE IF NOT EXISTS "performances_evaluation" (
    "id_evaluation" varchar(255) REFERENCES "evaluations"("id"),
    "id_exercice" int REFERENCES "catalogue_exercices"("id"),
    "charge_realisee_kg" decimal,
    PRIMARY KEY ("id_evaluation", "id_exercice")
    );
