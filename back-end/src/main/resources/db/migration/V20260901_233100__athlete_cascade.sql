-- ------------------------------------------------------------
-- Suppression en cascade depuis un athlète
-- athletes -> eval_summaries -> eval_details
--                            -> programmes -> programme_weeks -> programme_trainings
-- Recrée les contraintes FK de la chaîne avec ON DELETE CASCADE.
-- Idempotent : DROP IF EXISTS avant recréation. Aucune donnée supprimée par ce script.
-- ------------------------------------------------------------

ALTER TABLE eval_summaries DROP CONSTRAINT IF EXISTS fk_eval_summaries_1;
ALTER TABLE eval_summaries
    ADD CONSTRAINT fk_eval_summaries_1
        FOREIGN KEY (athlete_id) REFERENCES athletes (athlete_id) ON DELETE CASCADE;

ALTER TABLE eval_details DROP CONSTRAINT IF EXISTS fk_eval_details_1;
ALTER TABLE eval_details
    ADD CONSTRAINT fk_eval_details_1
        FOREIGN KEY (evaluation_id) REFERENCES eval_summaries (evaluation_id) ON DELETE CASCADE;

ALTER TABLE programmes DROP CONSTRAINT IF EXISTS fk_programmes_1;
ALTER TABLE programmes
    ADD CONSTRAINT fk_programmes_1
        FOREIGN KEY (evaluation_id) REFERENCES eval_summaries (evaluation_id) ON DELETE CASCADE;

ALTER TABLE programme_weeks DROP CONSTRAINT IF EXISTS fk_programme_weeks_1;
ALTER TABLE programme_weeks
    ADD CONSTRAINT fk_programme_weeks_1
        FOREIGN KEY (programme_id) REFERENCES programmes (programme_id) ON DELETE CASCADE;

ALTER TABLE programme_trainings DROP CONSTRAINT IF EXISTS fk_programme_trainings_1;
ALTER TABLE programme_trainings
    ADD CONSTRAINT fk_programme_trainings_1
        FOREIGN KEY (programme_week_id) REFERENCES programme_weeks (programme_week_id) ON DELETE CASCADE;
