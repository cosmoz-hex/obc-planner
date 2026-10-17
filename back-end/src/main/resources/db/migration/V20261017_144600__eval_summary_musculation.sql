-- ------------------------------------------------------------
-- Ajout de la colonne musculation sur eval_summaries
-- Stocke le bitmask des orientations de musculation sélectionnées
-- dans la synthèse d'évaluation (GENERAL=1, LEGS=2, POSTERIOR_CHAIN=4, UPPER_BODY=8).
-- Idempotent : ADD COLUMN IF NOT EXISTS. Aucune donnée existante supprimée.
-- ------------------------------------------------------------

ALTER TABLE eval_summaries
    ADD COLUMN IF NOT EXISTS musculation INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN eval_summaries.musculation IS 'Bitmask des orientations de musculation : GENERAL (1), LEGS (2), POSTERIOR_CHAIN (4), UPPER_BODY (8)';
