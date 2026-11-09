-- ============================================================
-- ROLLBACK — chk_ref_exercices_3 (goal) : retrait des 9 goals de renfo
--
-- Descente de V20261021_140000__renfo_specifique_schema.sql.
--
-- Rétablit le CHECK d'origine (10 valeurs seules) :
--   EXT, CATCH, PATH, KEEP, STR, SPD, GEN, LEGS, POST, UPPER.
--
-- ⚠️ PRÉ-REQUIS avant rollback :
--   Exécuter D'ABORD le rollback DONNÉES (db/rollback du LOT 3,
--   V..__renfo_specifique_data.sql) : aucune ligne ref_exercices ne doit
--   subsister avec un goal composé (SN_*, CL_*, JK_*). Sinon l'ADD CONSTRAINT
--   du CHECK d'origine ÉCHOUE (violation du CHECK sur les lignes restantes).
--
--   Contrôle recommandé avant d'exécuter :
--     SELECT ref_exercice_id, goal
--     FROM ref_exercices
--     WHERE goal IN ('SN_EXT','SN_CATCH','SN_PATH',
--                    'CL_EXT','CL_CATCH','CL_PATH',
--                    'JK_EXT','JK_CATCH','JK_PATH');
--
-- Idempotent : DROP CONSTRAINT IF EXISTS avant recréation.
-- Périmètre strict : chk_ref_exercices_1, chk_ref_exercices_5 et week_type
--   restent INCHANGÉS.
-- ============================================================

ALTER TABLE ref_exercices DROP CONSTRAINT IF EXISTS chk_ref_exercices_3;
ALTER TABLE ref_exercices ADD CONSTRAINT chk_ref_exercices_3
    CHECK (goal IN ('EXT', 'CATCH', 'PATH', 'KEEP', 'STR', 'SPD', 'GEN', 'LEGS', 'POST', 'UPPER'));

COMMENT ON COLUMN ref_exercices.goal IS 'Objectif : EXT, CATCH, PATH, KEEP, STR, SPD, GEN, LEGS, POST, UPPER';
