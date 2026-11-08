-- ============================================================
-- LOT 1 — Génération de programme : évolution de schéma programme_trainings
--
-- Spec : .kiro/specs/generation-programme/ (US9, RG11).
--
-- Objet :
--   1.1 programme_trainings.rep_number : INTEGER NOT NULL -> VARCHAR(20) NULL
--       (formats libres : 6, 30s, (1 + 1), NULL — aligné sur ref_exercice_sets.rep_number).
--   1.2 Suppression du CHECK chk_programme_trainings_3 (rep_number > 0) + MAJ COMMENT.
--   1.3 set_number : NOT NULL -> NULLABLE (cases RF/PC/combinées sans série) ;
--       CHECK chk_programme_trainings_2 (set_number > 0) -> (set_number IS NULL OR set_number > 0).
--   1.4 Vérification (SANS modification) : programme_weeks.week_type accepte déjà PC
--       (chk_programme_weeks_* dans V20260815_171100) et chk_programme_trainings_4
--       (max_weight IS NULL OR max_weight >= min_weight) conservé tel quel.
--
-- Idempotent : bloc DO $$ conditionnel sur le type réel de rep_number,
-- DROP CONSTRAINT IF EXISTS avant chaque ADD CONSTRAINT, DROP NOT NULL rejouable.
-- Non destructif : conversion de type préservante (INTEGER -> VARCHAR sans perte).
--
-- Le rollback figure dans db/rollback/V20261020_100000__generation_programme.sql.
-- ============================================================


-- ------------------------------------------------------------
-- 1.2 — Suppression du CHECK rep_number > 0 (AVANT la conversion de type)
-- Doit précéder le changement de type (1.1) : le CHECK « rep_number > 0 »
-- serait revalidé pendant l'ALTER TYPE et provoquerait une comparaison
-- « varchar > integer » (SQLSTATE 42883). On le supprime d'abord.
-- ------------------------------------------------------------
ALTER TABLE programme_trainings DROP CONSTRAINT IF EXISTS chk_programme_trainings_3;


-- ------------------------------------------------------------
-- 1.1 — programme_trainings.rep_number : INTEGER NOT NULL -> VARCHAR(20) NULL
-- Conversion conditionnelle sur le type courant (idempotence).
-- ------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'programme_trainings'
                 AND column_name = 'rep_number'
                 AND data_type = 'integer') THEN
        ALTER TABLE programme_trainings
            ALTER COLUMN rep_number TYPE VARCHAR(20) USING rep_number::varchar;
    END IF;
END $$;

ALTER TABLE programme_trainings ALTER COLUMN rep_number DROP NOT NULL;

COMMENT ON COLUMN programme_trainings.rep_number IS 'Répétitions au format libre : 6, 30s, (1 + 1), NULL';


-- ------------------------------------------------------------
-- 1.3 — set_number : NOT NULL -> NULLABLE + CHECK « NULL OR > 0 »
-- Cases RF/PC (pas de série) -> set_number NULL autorisé.
-- ------------------------------------------------------------
ALTER TABLE programme_trainings ALTER COLUMN set_number DROP NOT NULL;

ALTER TABLE programme_trainings DROP CONSTRAINT IF EXISTS chk_programme_trainings_2;
ALTER TABLE programme_trainings ADD CONSTRAINT chk_programme_trainings_2
    CHECK (set_number IS NULL OR set_number > 0);

COMMENT ON COLUMN programme_trainings.set_number IS 'Nombre de séries (NULL pour les cases sans série : RF, PC)';


-- ------------------------------------------------------------
-- 1.4 — Vérifications (AUCUNE modification requise)
--   * programme_weeks.week_type accepte déjà PC (domaine F,T,S,A,D,PC
--     défini à l'init V20260815_171100__init.sql).
--   * chk_programme_trainings_4 (max_weight IS NULL OR max_weight >= min_weight)
--     conservé tel quel : min_weight / max_weight restent NUMERIC(6,2) nullables.
-- ------------------------------------------------------------
