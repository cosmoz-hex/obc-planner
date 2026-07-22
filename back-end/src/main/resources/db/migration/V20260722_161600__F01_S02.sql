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
    "cmj_elan_cm" decimal,
    "squat_30pct_mps" decimal,
    "ratio_front_squat" decimal,
    "profil_resultat" varchar(255),
    PRIMARY KEY("id_evaluation")
    );

-- 5. Profil technique
CREATE TABLE IF NOT EXISTS "profils_techniques" (
    "id_evaluation" varchar(255) NOT NULL REFERENCES "evaluations"("id"),
    "taux_reussite_arrache" decimal,
    "taux_reussite_epj" decimal,
    "profil_resultat" varchar(255),
    PRIMARY KEY("id_evaluation")
    );

-- 6. Profil neuromusculaire
CREATE TABLE IF NOT EXISTS "profils_neuromusculaires" (
    "id_evaluation" varchar(255) NOT NULL REFERENCES "evaluations"("id"),
    "fc_repos" int,
    "max_reps_squat_70pct" int,
    "profil_resultat" varchar(255),
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

-- 8. Exercices correctifs (dépend du catalogue d'exercices)
CREATE TABLE IF NOT EXISTS "exercices_correctifs" (
    "id" serial NOT NULL,
    "defaut_cible" varchar(255),
    "id_exercice" int REFERENCES "catalogue_exercices"("id"),
    PRIMARY KEY("id")
    );

-- 9. Performances d'évaluation (dépend des évaluations et du catalogue)
CREATE TABLE IF NOT EXISTS "performances_evaluation" (
    "id" serial NOT NULL,
    "id_evaluation" varchar(255) REFERENCES "evaluations"("id"),
    "id_exercice" int REFERENCES "catalogue_exercices"("id"),
    "charge_realisee_kg" decimal,
    PRIMARY KEY("id")
    );