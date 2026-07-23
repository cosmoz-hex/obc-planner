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
INSERT INTO "catalogue_exercices" ("id", "type_mouvement", "categorie", "nom_exercice", "id_exercice_reference", "pct_charge_theorique") VALUES
-- Exercice Racine
(1, 'Total', 'Profil technique', 'Total', NULL, 100.00),

-- Mouvements Principaux (Dépendent du Total - ID 1)
(2, 'Arraché', 'Profil technique', 'Arraché (x1)', 1, 44.00),
(13, 'Épaulé', 'Profil technique', 'Épaulé (x1)', 1, 56.00),
(24, 'Jeté', 'Profil technique', 'Jeté Fente', 1, 56.00),

-- Dérivés de l'Arraché (Dépendent d'Arraché (x1) - ID 2)
(3, 'Arraché', 'Profil technique', 'Arraché flexion', 2, 100.00),
(4, 'Arraché', 'Profil technique', 'Arraché debout', 2, 85.00),
(5, 'Arraché', 'Profil technique', 'Arraché plots', 2, 95.00),
(6, 'Arraché', 'Profil technique', 'Arraché suspension', 2, 95.00),
(7, 'Arraché', 'Profil technique', 'Arraché puissance', 2, 92.00),
(8, 'Arraché', 'Profil technique', 'Arraché force', 2, 63.00),
(9, 'Arraché', 'Profil technique', 'Chute arraché', 2, 100.00),
(10, 'Arraché', 'Profil technique', 'Passage arraché', 2, 56.00),
(11, 'Tirage Arraché', 'Profil technique', 'Tirage arraché (x1)', 2, 120.00),
(12, 'Tirage Arraché', 'Profil technique', 'Tirage haut arraché', 2, 100.00),

-- Dérivés de l'Épaulé (Dépendent d'Épaulé (x1) - ID 13)
(14, 'Épaulé', 'Profil technique', 'Épaulé flexion', 13, 100.00),
(15, 'Épaulé', 'Profil technique', 'Épaulé debout', 13, 84.00),
(16, 'Épaulé', 'Profil technique', 'Épaulé plots', 13, 95.00),
(17, 'Épaulé', 'Profil technique', 'Épaulé suspension', 13, 95.00),
(18, 'Épaulé', 'Profil technique', 'Épaulé puissance', 13, 92.00),
(19, 'Épaulé', 'Profil technique', 'Épaulé force', 13, 63.00),
(20, 'Épaulé', 'Profil technique', 'Passage épaulé', 13, 62.00),
(21, 'Tirage Épaulé', 'Profil technique', 'Tirage épaulé (x1)', 13, 130.00),
(22, 'Flexion', 'Profil technique', 'Flexion nuque (x1)', 13, 135.00),
(23, 'Flexion', 'Profil technique', 'Flexion clavicule (x1)', 13, 114.00),

-- Dérivés du Jeté (Dépendent de Jeté Fente - ID 24)
(25, 'Jeté', 'Profil technique', 'Jeté debout', 24, 92.00),
(26, 'Jeté', 'Profil technique', 'Jeté puissance', 24, 90.00),
(27, 'Jeté', 'Profil technique', 'Jeté force', 24, 71.00)
    ON CONFLICT ("id") DO NOTHING;

-- Mise à jour de la séquence d'ID automatique
SELECT setval(pg_get_serial_sequence('"catalogue_exercices"', 'id'), MAX("id")) FROM "catalogue_exercices";

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

INSERT INTO "exercices_correctifs" ("id_exercice", "id_exercice_correctif") VALUES

-- ============================================================================
-- ARRACHÉ
-- ============================================================================
-- --- Arraché flexion ---
-- Combiné
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché flexion')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Tirage Haut Arraché + 2 Arraché Bassin + 2 Chute Arraché'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché flexion')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Arraché Debout + 2 Flexion d’Arraché + 1 Arraché Flexion'))),
-- Semi Technique Lourd
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché flexion')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Pause'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché flexion')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Chute Arraché (avec élan)'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché flexion')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché flexion'))),
-- Semi Technique Léger
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché flexion')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Chute Arraché (sans élan)'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché flexion')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage Arraché'))),
-- Renforcement Spécifique
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché flexion')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Développé Arraché Flexion'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché flexion')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Flexion Arraché avec Élastique'))),

-- --- Arraché debout ---
-- Combiné
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('3 x (1 Tirage Haut Arraché + 1 Arraché Debout Suspension)'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('2 Tirage Lourd Arraché + 2 Arraché Debout'))),
-- Semi Technique Lourd
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Plot'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Debout Départ Lent'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Debout'))),
-- Semi Technique Léger
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Force Prise Épaulé'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Debout Bassin'))),
-- Renforcement Spécifique
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Tirage Bras Arraché'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Développé Arraché Debout'))),

-- --- Arraché plots ---
-- Combiné
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché plots')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('3 x (1 Tirage Haut Arraché + 1 Arraché Suspension)'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché plots')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Arraché + 1 Arraché Suspension + 1 Arraché'))),
-- Semi Technique Lourd
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché plots')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Suspension'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché plots')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Déficit'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché plots')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Plots'))),
-- Semi Technique Léger
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché plots')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Force Plots'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché plots')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Puissance Debout Bassin'))),
-- Renforcement Spécifique
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché plots')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Rowing Prise Arraché'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché plots')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Tirage Bras Arraché'))),

-- --- Arraché suspension ---
-- Combiné
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché suspension')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('3 x (1 Tirage Haut Arraché + 1 Arraché Suspension)'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché suspension')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Arraché + 1 Arraché Suspension + 1 Arraché'))),
-- Semi Technique Lourd
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché suspension')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Plots'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché suspension')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Déficit'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché suspension')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Suspension'))),
-- Semi Technique Léger
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché suspension')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Force Suspension'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché suspension')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Puissance Debout Bassin'))),
-- Renforcement Spécifique
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché suspension')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Rowing Prise Arraché'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché suspension')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Tirage Bras Arraché'))),

-- --- Arraché puissance ---
-- Combiné
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('2 x (1 Tirage Arraché + 1 Arraché Puissance + 1 Flexion)'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Arraché Puissance Bassin + 1 Arraché Puissance Susp. + 1 Arraché Puissance'))),
-- Semi Technique Lourd
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Puissance Bassin'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Départ Lent'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché puissance'))),
-- Semi Technique Léger
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Force'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage Arraché'))),
-- Renforcement Spécifique
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage Arraché Pied Plat'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Rowing Prise Arraché'))),

-- --- Arraché force ---
-- Combiné
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('3 x (1 Tirage Haut Arraché + 1 Arraché Debout Suspension)'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('3 x (1 Arraché Force + 1 Chute Arraché avec élan)'))),
-- Semi Technique Lourd
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Debout Plot'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Puissance'))),
-- Semi Technique Léger
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Force sans contact'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Puissance Debout Bassin'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Force'))),
-- Renforcement Spécifique
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Rowing Prise Arraché'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Tirage Bras Arraché'))),

-- --- Chute arraché ---
-- Combiné
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Chute arraché')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('3 x (1 Arraché Force + 1 Chute Arraché avec élan)'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Chute arraché')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Arraché Debout + 2 Flexion d’Arraché + 1 Arraché Flexion'))),
-- Semi Technique Lourd
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Chute arraché')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Bassin'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Chute arraché')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Flexion (pause réception)'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Chute arraché')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Chute arraché'))),
-- Semi Technique Léger
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Chute arraché')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Chute Arraché (sans élan)'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Chute arraché')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage Arraché'))),
-- Renforcement Spécifique
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Chute arraché')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Développé Arraché Flexion'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Chute arraché')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Flexion Arraché avec Élastique'))),

-- --- Passage arraché ---
-- Combiné
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage arraché')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('2 x (1 Tirage Haut Arraché + 1 Arraché Bassin + 1 Chute Arraché)'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage arraché')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Arraché + 1 Arraché Suspension Basse + 1 Arraché Suspension Haute'))),
-- Semi Technique Lourd
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage arraché')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Bassin'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage arraché')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Suspension'))),
-- Semi Technique Léger
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage arraché')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Chute Arraché (sans élan)'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage arraché')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Arraché Force Suspension'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage arraché')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage arraché'))),
-- Renforcement Spécifique
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage arraché')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Tirage Bras Arraché'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage arraché')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage Arraché Pied Plat'))),

-- ============================================================================
-- ÉPAULÉ
-- ============================================================================
-- --- Épaulé flexion ---
-- Combiné
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé flexion')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Épaulé Debout + 2 Flexion + 1 Jeté + 1 Épaulé Flexion + 1 Jeté'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé flexion')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Épaulé Bassin + 1 Épaulé Susp. H. + 1 Épaulé Susp. B. + 1 Jeté'))),
-- Semi Technique Lourd
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé flexion')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Pause'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé flexion')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Bassin'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé flexion')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Flexion'))),
-- Semi Technique Léger
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé flexion')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage Épaulé'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé flexion')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Puissance Flexion Bassin'))),
-- Renforcement Spécifique
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé flexion')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage Épaulé Pied Plat'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé flexion')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Rowing Prise Épaulé'))),

-- --- Épaulé debout ---
-- Combiné
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('2 x (1 Tirage Épaulé Bassin + 1 Épaulé Debout) + 1 Jeté'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Épaulé Deb. Susp. H. + 1 Épaulé Deb. Susp. B. + 1 Épaulé Debout + 1 Jeté'))),
-- Semi Technique Lourd
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Plot'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Puissance Debout'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Debout'))),
-- Semi Technique Léger
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Debout Bassin'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Force'))),
-- Renforcement Spécifique
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Tirage Bras Épaulé'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Rowing Prise Épaulé'))),

-- --- Épaulé plots ---
-- Combiné
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé plots')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('2 x (1 Tirage Épaulé Bassin + 1 Épaulé Debout) + 1 Jeté'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé plots')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Épaulé Debout + 1 Épaulé Susp. B. + 1 Épaulé Susp. H. + 1 Jeté'))),
-- Semi Technique Lourd
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé plots')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Suspension'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé plots')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Déficit'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé plots')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Plots'))),
-- Semi Technique Léger
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé plots')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Force Plots'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé plots')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Puissance Debout Bassin'))),
-- Renforcement Spécifique
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé plots')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Tirage Bras Épaulé'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé plots')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Rowing Prise Épaulé'))),

-- --- Épaulé suspension ---
-- Combiné
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé suspension')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('2 x (1 Tirage Épaulé Bassin + 1 Épaulé Debout) + 1 Jeté'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé suspension')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Épaulé Debout + 1 Épaulé Susp. B. + 1 Épaulé Susp. H. + 1 Jeté'))),
-- Semi Technique Lourd
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé suspension')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Plots'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé suspension')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Déficit'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé suspension')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Suspension'))),
-- Semi Technique Léger
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé suspension')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Force Suspension'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé suspension')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Puissance Debout Bassin'))),
-- Renforcement Spécifique
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé suspension')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Tirage Bras Épaulé'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé suspension')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Rowing Prise Épaulé'))),

-- --- Épaulé puissance ---
-- Combiné
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('2 x (1 Épaulé Puissance Debout + 1 Flexion + 1 Jeté)'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('2 x (1 Tirage Épaulé + 1 Épaulé Puissance Suspension + 1 Jeté)'))),
-- Semi Technique Lourd
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Puissance Bassin'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Pause'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Puissance'))),
-- Semi Technique Léger
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Force'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage Épaulé'))),
-- Renforcement Spécifique
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage Épaulé Pied Plat'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Rowing Prise Épaulé'))),

-- --- Épaulé force ---
-- Combiné
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('2 x (1 Tirage Épaulé Bassin + 1 Épaulé Debout) + 1 Jeté'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Épaulé Deb. Susp. H. + 1 Épaulé Deb. Susp. B. + 1 Épaulé Debout + 1 Jeté'))),
-- Semi Technique Lourd
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Debout Plot'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Puissance'))),
-- Semi Technique Léger
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Force sans contact'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Puissance Debout Bassin'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Force'))),
-- Renforcement Spécifique
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Tirage Bras Épaulé'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Rowing Prise Épaulé'))),

-- --- Passage Épaulé ---
-- Combiné
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage Épaulé')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('2 x (1 Épaulé Plot + 1 Flexion) + 1 Jeté'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage Épaulé')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Épaulé Debout + 2 Flexion + 1 Jeté + 1 Épaulé Flexion + 1 Jeté'))),
-- Semi Technique Lourd
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage Épaulé')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Bassin'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage Épaulé')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Suspension'))),
-- Semi Technique Léger
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage Épaulé')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Puissance Flexion Bassin'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage Épaulé')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Épaulé Force Suspension'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage Épaulé')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage Épaulé'))),
-- Renforcement Spécifique
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage Épaulé')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage Épaulé Pied Plat'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Passage Épaulé')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Tirage Bras Épaulé'))),

-- ============================================================================
-- JETÉ
-- ============================================================================
-- --- Jeté Fente ---
-- Combiné
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Fente')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Épaulé Debout + 1 Jeté Debout + 1 Épaulé + 1 Jeté Fente'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Fente')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Épaulé Debout + 2 Flexion + 1 Jeté Pause + 1 Épaulé Flexion + 1 Jeté'))),
-- Semi Technique Lourd
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Fente')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Pause'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Fente')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Fente (Appel Fente)'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Fente')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Fente'))),
-- Semi Technique Léger
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Fente')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Va-et-viens Jeté'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Fente')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Chute de Jeté'))),
-- Renforcement Spécifique
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Fente')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Développé Fente'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Fente')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Fente à la barre'))),

-- --- Jeté Debout ---
-- Combiné
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Épaulé Debout + 2 Jeté Force + 1 Épaulé Debout + 1 Jeté Debout'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Épaulé Debout + 2 Flexion + 1 Jeté Pause + 1 Épaulé Flexion + 1 Jeté'))),
-- Semi Technique Lourd
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Puissance'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Pause'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Debout'))),
-- Semi Technique Léger
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Force'))),
-- Renforcement Spécifique
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Développé Nuque'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Debout')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Appel de Jeté ou Gainage Barre'))),

-- --- Jeté Puissance ---
-- Combiné
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Épaulé Puissance Debout + 2 Jeté Force + 1 Puissance Debout + 1 Jeté Puissance'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Épaulé Debout + 2 Flexion + 1 Jeté Pause + 1 Épaulé Flexion + 1 Jeté'))),
-- Semi Technique Lourd
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Debout'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Pause'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Puissance'))),
-- Semi Technique Léger
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Force'))),
-- Renforcement Spécifique
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Développé Nuque'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Puissance')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Appel de Jeté ou Gainage Barre'))),

-- --- Jeté Force ---
-- Combiné
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('5s Appel Jeté + 3 Jeté Force'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('1 Épaulé Puissance Debout + 2 Jeté Force + 1 Puissance Debout + 1 Jeté Puissance'))),
-- Semi Technique Lourd
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Debout'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Pause'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Puissance'))),
-- Semi Technique Léger
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Force'))),
-- Renforcement Spécifique
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Développé Militaire'))),
((SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Jeté Force')), (SELECT "id" FROM "catalogue_exercices" WHERE LOWER("nom") = LOWER('Appel de Jeté ou Gainage Barre')));


-- 9. Performances d'évaluation (dépend des évaluations et du catalogue)
CREATE TABLE IF NOT EXISTS "performances_evaluation" (
    "id_evaluation" varchar(255) REFERENCES "evaluations"("id"),
    "id_exercice" int REFERENCES "catalogue_exercices"("id"),
    "charge_realisee_kg" decimal,
    PRIMARY KEY ("id_evaluation", "id_exercice")
    );
