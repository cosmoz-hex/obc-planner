-- ------------------------------------------------------------
-- ROLLBACK de V20261017_144600__eval_summary_musculation
-- Supprime la colonne musculation ajoutée sur eval_summaries.
-- Idempotent : DROP COLUMN IF EXISTS.
-- ------------------------------------------------------------

ALTER TABLE eval_summaries
    DROP COLUMN IF EXISTS musculation;
