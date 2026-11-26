-- ------------------------------------------------------------
-- ROLLBACK de V20261126_220533__programmes_squat_pull_goals
-- Supprime les 4 objectifs squat / tirage de programmes.
-- ATTENTION : les valeurs saisies a la creation sont perdues (le moteur d'avant la migration
-- les recalculait depuis snatch_goal / cj_goal).
-- Idempotent : DROP COLUMN IF EXISTS.
-- ------------------------------------------------------------

ALTER TABLE programmes DROP COLUMN IF EXISTS front_squat_goal;
ALTER TABLE programmes DROP COLUMN IF EXISTS back_squat_goal;
ALTER TABLE programmes DROP COLUMN IF EXISTS snatch_pull_goal;
ALTER TABLE programmes DROP COLUMN IF EXISTS cj_pull_goal;
