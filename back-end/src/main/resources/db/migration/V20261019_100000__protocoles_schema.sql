-- ============================================================
-- LOT 1 — Écran « Protocoles » (Référentiel) : évolution de schéma
--
-- Spec : .kiro/specs/referentiel-protocoles/ (US8, RG1/RG3/RG4/RG7).
--
-- Objet :
--   1.1 ref_exercice_sets.rep_number : INTEGER NOT NULL -> VARCHAR(20) NULL
--       (formats libres : 6, 30s, 12m, 1 + 1, NULL).
--   1.2 Suppression du CHECK chk_ref_exercice_sets_3 (rep_number > 0).
--   1.3 ref_exercices.reference : NOT NULL -> NULL (Musculation sans référence).
--   1.4 Extension CHECK chk_ref_exercices_1 (exercice_type) : + CL + JK (CJ conservé).
--   1.5 Extension CHECK chk_ref_exercices_3 (goal) : + GEN, LEGS, POST, UPPER.
--   1.5bis chk_ref_exercices_5 (reference) INCHANGÉ : domaine {SN,CJ,FS,BS,SP,CP}.
--   1.6 Index idx_ref_exercices_1 (exercice_type, week_type, goal, training_order).
--
-- Idempotent : bloc DO $$ conditionnel sur le type réel de rep_number,
-- DROP CONSTRAINT IF EXISTS avant recréation, ADD COLUMN/INDEX IF NOT EXISTS.
-- Non destructif : aucune donnée supprimée (conversion de type préservante).
--
-- Le rollback (script de descente) figure en commentaire en fin de fichier.
-- ============================================================


-- ------------------------------------------------------------
-- 1.2 — Suppression du CHECK rep_number > 0 (AVANT la conversion de type)
-- Doit précéder le changement de type (1.1) : le CHECK « rep_number > 0 »
-- serait revalidé pendant l'ALTER TYPE et provoquerait une comparaison
-- « varchar > integer » (SQLSTATE 42883). On le supprime d'abord.
-- ------------------------------------------------------------
ALTER TABLE ref_exercice_sets DROP CONSTRAINT IF EXISTS chk_ref_exercice_sets_3;


-- ------------------------------------------------------------
-- 1.1 — ref_exercice_sets.rep_number : INTEGER NOT NULL -> VARCHAR(20) NULL
-- Conversion conditionnelle sur le type courant (idempotence).
-- ------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'ref_exercice_sets'
                 AND column_name = 'rep_number'
                 AND data_type = 'integer') THEN
        ALTER TABLE ref_exercice_sets
            ALTER COLUMN rep_number TYPE VARCHAR(20) USING rep_number::varchar;
    END IF;
END $$;

ALTER TABLE ref_exercice_sets ALTER COLUMN rep_number DROP NOT NULL;

COMMENT ON COLUMN ref_exercice_sets.rep_number IS 'Répétitions de référence (format libre : 6, 30s, 12m, 1 + 1, NULL)';


-- ------------------------------------------------------------
-- 1.3 — ref_exercices.reference : NOT NULL -> NULL (Musculation sans référence)
-- ------------------------------------------------------------
ALTER TABLE ref_exercices ALTER COLUMN reference DROP NOT NULL;

COMMENT ON COLUMN ref_exercices.reference IS 'Exercice de référence pour le calcul de charge : SN, CJ, FS, BS, SP, CP (NULL pour la Musculation)';


-- ------------------------------------------------------------
-- 1.4 — Extension CHECK chk_ref_exercices_1 (exercice_type) : + CL + JK
-- CJ (Clean & Jerk) conservé ; CL (Épaulé/Clean) et JK (Jeté/Jerk) ajoutés.
-- ------------------------------------------------------------
ALTER TABLE ref_exercices DROP CONSTRAINT IF EXISTS chk_ref_exercices_1;
ALTER TABLE ref_exercices ADD CONSTRAINT chk_ref_exercices_1
    CHECK (exercice_type IN ('SN', 'CJ', 'CL', 'JK', 'SQ', 'PL', 'RF', 'MS'));

COMMENT ON COLUMN ref_exercices.exercice_type IS 'Type d''exercice : SN, CJ, CL, JK, SQ, PL, RF, MS';


-- ------------------------------------------------------------
-- 1.5 — Extension CHECK chk_ref_exercices_3 (goal) : + objectifs Musculation
-- ------------------------------------------------------------
ALTER TABLE ref_exercices DROP CONSTRAINT IF EXISTS chk_ref_exercices_3;
ALTER TABLE ref_exercices ADD CONSTRAINT chk_ref_exercices_3
    CHECK (goal IN ('EXT', 'CATCH', 'PATH', 'KEEP', 'STR', 'SPD', 'GEN', 'LEGS', 'POST', 'UPPER'));

COMMENT ON COLUMN ref_exercices.goal IS 'Objectif : EXT, CATCH, PATH, KEEP, STR, SPD, GEN, LEGS, POST, UPPER';


-- ------------------------------------------------------------
-- 1.5bis — chk_ref_exercices_5 (reference) INCHANGÉ
-- Domaine {SN,CJ,FS,BS,SP,CP} conservé ; les CHECK PostgreSQL passent sur NULL,
-- la nullabilité (1.3) suffit pour la Musculation. Aucune action.
-- ------------------------------------------------------------


-- ------------------------------------------------------------
-- 1.6 — Index pour filtre/tri serveur (US2/US3)
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_ref_exercices_1
    ON ref_exercices (exercice_type, week_type, goal, training_order);


-- ============================================================
-- ROLLBACK (script de descente) — À EXÉCUTER MANUELLEMENT
--
-- ⚠️ PRÉ-REQUIS avant rollback :
--   - Aucune ligne ref_exercices avec exercice_type IN ('CL','JK')
--     (sinon le CHECK d'origine échoue) ;
--   - Aucune ligne ref_exercices avec goal IN ('GEN','LEGS','POST','UPPER') ;
--   - Aucune ligne ref_exercices.reference IS NULL (sinon le NOT NULL échoue) ;
--   - Toutes les valeurs ref_exercice_sets.rep_number doivent être numériques
--     et > 0 (⚠️ PERTE : les valeurs non numériques comme '30s', '1 + 1', NULL
--     seront rejetées par la conversion en INTEGER / le CHECK recréé).
--
-- DROP INDEX IF EXISTS idx_ref_exercices_1;
--
-- ALTER TABLE ref_exercices DROP CONSTRAINT IF EXISTS chk_ref_exercices_3;
-- ALTER TABLE ref_exercices ADD CONSTRAINT chk_ref_exercices_3
--     CHECK (goal IN ('EXT', 'CATCH', 'PATH', 'KEEP', 'STR', 'SPD'));
-- COMMENT ON COLUMN ref_exercices.goal IS 'Objectif : EXT, CATCH, PATH, KEEP, STR, SPD';
--
-- ALTER TABLE ref_exercices DROP CONSTRAINT IF EXISTS chk_ref_exercices_1;
-- ALTER TABLE ref_exercices ADD CONSTRAINT chk_ref_exercices_1
--     CHECK (exercice_type IN ('SN', 'CJ', 'SQ', 'PL', 'RF', 'MS'));
-- COMMENT ON COLUMN ref_exercices.exercice_type IS 'Type d''exercice : SN, CJ, SQ, PL, RF, MS';
--
-- ALTER TABLE ref_exercices ALTER COLUMN reference SET NOT NULL;
-- COMMENT ON COLUMN ref_exercices.reference IS 'Exercice de référence pour le calcul de charge : SN, CJ, FS, BS, SP, CP';
--
-- DO $$
-- BEGIN
--     IF EXISTS (SELECT 1 FROM information_schema.columns
--                WHERE table_name = 'ref_exercice_sets'
--                  AND column_name = 'rep_number'
--                  AND data_type = 'character varying') THEN
--         ALTER TABLE ref_exercice_sets
--             ALTER COLUMN rep_number TYPE INTEGER USING rep_number::integer;
--     END IF;
-- END $$;
-- ALTER TABLE ref_exercice_sets ALTER COLUMN rep_number SET NOT NULL;
-- ALTER TABLE ref_exercice_sets ADD CONSTRAINT chk_ref_exercice_sets_3 CHECK (rep_number > 0);
-- COMMENT ON COLUMN ref_exercice_sets.rep_number IS 'Nombre de répétitions de référence';
-- ============================================================
