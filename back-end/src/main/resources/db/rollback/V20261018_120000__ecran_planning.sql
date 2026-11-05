-- ============================================================
-- ROLLBACK (descente) — Écran « Planning » (ex-Trame générale)
--
-- DDL INVERSE de V20261018_120000__ecran_planning.sql.
-- ⚠️ Aucune restauration de données : les 67 lignes insérées par la
-- montée sont supprimées, la contrainte d'origine est rétablie.
--
-- Idempotent : DELETE ciblé (sans effet si vide), DROP CONSTRAINT IF EXISTS.
-- ============================================================


-- ------------------------------------------------------------
-- US2 (inverse) — Retrait des données insérées par la montée
-- ------------------------------------------------------------
DELETE FROM ref_plannings WHERE weeks_numbers IN (3, 4, 5);


-- ------------------------------------------------------------
-- US1 (inverse) — Rétablir la contrainte d'origine (sans PC)
-- ------------------------------------------------------------
ALTER TABLE ref_plannings DROP CONSTRAINT IF EXISTS chk_ref_plannings_4;
ALTER TABLE ref_plannings ADD CONSTRAINT chk_ref_plannings_4
    CHECK (exercice_type IN ('SN', 'CJ', 'SQ', 'PL', 'RF', 'MS'));

COMMENT ON COLUMN ref_plannings.exercice_type IS 'Type d''exercice attendu : SN, CJ, SQ, PL, RF, MS';
