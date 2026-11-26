-- ------------------------------------------------------------
-- Objectifs squat et tirage stockes dans programmes
-- Ajoute 4 objectifs finaux (kg) : squat clavicule, squat nuque, tirage arrache, tirage epaule.
-- Backfill des programmes existants depuis snatch_goal / cj_goal (anciens coefficients du moteur),
-- puis colonnes NOT NULL.
-- Idempotent : ADD COLUMN IF NOT EXISTS, backfill limite aux lignes NULL, SET NOT NULL rejouable.
-- Echoue explicitement (SET NOT NULL) si un programme n'a pas de snatch_goal / cj_goal.
-- ------------------------------------------------------------

ALTER TABLE programmes ADD COLUMN IF NOT EXISTS front_squat_goal INTEGER;
ALTER TABLE programmes ADD COLUMN IF NOT EXISTS back_squat_goal INTEGER;
ALTER TABLE programmes ADD COLUMN IF NOT EXISTS snatch_pull_goal INTEGER;
ALTER TABLE programmes ADD COLUMN IF NOT EXISTS cj_pull_goal INTEGER;

-- Backfill : cast numeric obligatoire (ROUND(double precision) arrondit a l'entier pair)
UPDATE programmes
SET front_squat_goal = ROUND(cj_goal::numeric * 114 / 100)::integer
WHERE front_squat_goal IS NULL AND cj_goal IS NOT NULL;

UPDATE programmes
SET back_squat_goal = ROUND(cj_goal::numeric * 135 / 100)::integer
WHERE back_squat_goal IS NULL AND cj_goal IS NOT NULL;

UPDATE programmes
SET snatch_pull_goal = ROUND(snatch_goal::numeric * 120 / 100)::integer
WHERE snatch_pull_goal IS NULL AND snatch_goal IS NOT NULL;

UPDATE programmes
SET cj_pull_goal = ROUND(cj_goal::numeric * 130 / 100)::integer
WHERE cj_pull_goal IS NULL AND cj_goal IS NOT NULL;

ALTER TABLE programmes ALTER COLUMN front_squat_goal SET NOT NULL;
ALTER TABLE programmes ALTER COLUMN back_squat_goal SET NOT NULL;
ALTER TABLE programmes ALTER COLUMN snatch_pull_goal SET NOT NULL;
ALTER TABLE programmes ALTER COLUMN cj_pull_goal SET NOT NULL;

COMMENT ON COLUMN programmes.front_squat_goal IS 'Objectif final de Flexion Avant (squat clavicule) en kg, saisi a la creation (defaut : cj_goal x 1.14)';
COMMENT ON COLUMN programmes.back_squat_goal IS 'Objectif final de Flexion Nuque (squat nuque) en kg, saisi a la creation (defaut : cj_goal x 1.35)';
COMMENT ON COLUMN programmes.snatch_pull_goal IS 'Objectif final de Tirage Arrache en kg, saisi a la creation (defaut : snatch_goal x 1.20)';
COMMENT ON COLUMN programmes.cj_pull_goal IS 'Objectif final de Tirage Epaule en kg, saisi a la creation (defaut : cj_goal x 1.30)';
