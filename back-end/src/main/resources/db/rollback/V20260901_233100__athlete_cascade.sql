-- ------------------------------------------------------------
-- ROLLBACK de V20260901_233100__athlete_cascade
-- Rétablit les contraintes FK de la chaîne athlète SANS ON DELETE CASCADE
-- (comportement d'origine : suppression bloquée si des lignes filles existent).
-- Idempotent : DROP IF EXISTS avant recréation.
-- ------------------------------------------------------------

ALTER TABLE eval_summaries DROP CONSTRAINT IF EXISTS fk_eval_summaries_1;
ALTER TABLE eval_summaries
    ADD CONSTRAINT fk_eval_summaries_1
        FOREIGN KEY (athlete_id) REFERENCES athletes (athlete_id);

ALTER TABLE eval_details DROP CONSTRAINT IF EXISTS fk_eval_details_1;
ALTER TABLE eval_details
    ADD CONSTRAINT fk_eval_details_1
        FOREIGN KEY (evaluation_id) REFERENCES eval_summaries (evaluation_id);

ALTER TABLE programmes DROP CONSTRAINT IF EXISTS fk_programmes_1;
ALTER TABLE programmes
    ADD CONSTRAINT fk_programmes_1
        FOREIGN KEY (evaluation_id) REFERENCES eval_summaries (evaluation_id);

ALTER TABLE programme_weeks DROP CONSTRAINT IF EXISTS fk_programme_weeks_1;
ALTER TABLE programme_weeks
    ADD CONSTRAINT fk_programme_weeks_1
        FOREIGN KEY (programme_id) REFERENCES programmes (programme_id);

ALTER TABLE programme_trainings DROP CONSTRAINT IF EXISTS fk_programme_trainings_1;
ALTER TABLE programme_trainings
    ADD CONSTRAINT fk_programme_trainings_1
        FOREIGN KEY (programme_week_id) REFERENCES programme_weeks (programme_week_id);
