-- ============================================================
-- LOT 1 — Renforcement Spécifique (cases RF) : évolution de schéma
--
-- Spec : .kiro/specs/renforcement-specifique/ (US1, RG1/RG2).
--
-- Objet :
--   Extension du CHECK chk_ref_exercices_3 (colonne ref_exercices.goal) pour
--   autoriser 9 nouveaux objectifs de renfo composés {mouvement}_{objectif} :
--     SN_EXT, SN_CATCH, SN_PATH (Arraché),
--     CL_EXT, CL_CATCH, CL_PATH (Épaulé),
--     JK_EXT, JK_CATCH, JK_PATH (Jeté),
--   en plus des 10 valeurs existantes
--     (EXT, CATCH, PATH, KEEP, STR, SPD, GEN, LEGS, POST, UPPER).
--
-- Longueur max des nouveaux codes = 8 caractères -> compatible VARCHAR(10).
--
-- Idempotent : DROP CONSTRAINT IF EXISTS avant recréation.
-- Non destructif : extension du domaine autorisé, aucune donnée supprimée.
-- Périmètre strict : chk_ref_exercices_1 (exercice_type), chk_ref_exercices_5
--   (reference) et la nullabilité/CHECK de week_type restent INCHANGÉS.
--
-- Le rollback figure dans db/rollback/ sous le même nom.
-- ============================================================


-- ------------------------------------------------------------
-- Extension CHECK chk_ref_exercices_3 (goal) : + 9 goals de renfo composés
-- ------------------------------------------------------------
ALTER TABLE ref_exercices DROP CONSTRAINT IF EXISTS chk_ref_exercices_3;
ALTER TABLE ref_exercices ADD CONSTRAINT chk_ref_exercices_3
    CHECK (goal IN ('EXT', 'CATCH', 'PATH', 'KEEP', 'STR', 'SPD', 'GEN', 'LEGS', 'POST', 'UPPER',
                    'SN_EXT', 'SN_CATCH', 'SN_PATH',
                    'CL_EXT', 'CL_CATCH', 'CL_PATH',
                    'JK_EXT', 'JK_CATCH', 'JK_PATH'));

COMMENT ON COLUMN ref_exercices.goal IS 'Objectif : EXT, CATCH, PATH, KEEP, STR, SPD, GEN, LEGS, POST, UPPER, SN_EXT, SN_CATCH, SN_PATH, CL_EXT, CL_CATCH, CL_PATH, JK_EXT, JK_CATCH, JK_PATH';
