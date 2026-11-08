-- ============================================================
-- ROLLBACK — programme_weeks.base_percent : NUMERIC(5,2) -> NUMERIC(4,2)
--
-- Descente de V20261020_160000__programme_week_base_percent_precision.sql.
--
-- ⚠️ PRÉ-REQUIS avant rollback :
--   Aucune valeur programme_weeks.base_percent ne doit atteindre ou dépasser
--   100 (valeur absolue >= 10^2). Sinon l'ALTER ... TYPE NUMERIC(4,2) ÉCHOUE
--   (« numeric field overflow »). En particulier, les semaines d'affûtage /
--   pré-compétition stockent base_percent = 100 et doivent être nettoyées ou
--   les programmes concernés supprimés au préalable.
--
--   Contrôle recommandé avant d'exécuter :
--     SELECT programme_week_id, base_percent
--     FROM programme_weeks
--     WHERE base_percent >= 100;
--
-- Idempotent : bloc DO $$ conditionnel sur numeric_precision > 4.
-- La contrainte chk_programme_weeks_2 CHECK (base_percent > 0) est conservée.
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'programme_weeks'
                 AND column_name = 'base_percent'
                 AND numeric_precision > 4) THEN
        ALTER TABLE programme_weeks
            ALTER COLUMN base_percent TYPE NUMERIC(4,2);
    END IF;
END $$;

COMMENT ON COLUMN programme_weeks.base_percent IS 'Pourcentage de l''objectif final';
