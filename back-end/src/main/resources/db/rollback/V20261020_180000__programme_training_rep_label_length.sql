-- ============================================================
-- ROLLBACK — programme_trainings.rep_label : VARCHAR(50) -> VARCHAR(20)
--
-- Descente de V20261020_180000__programme_training_rep_label_length.sql.
--
-- ⚠️ PRÉ-REQUIS avant rollback :
--   Aucune valeur programme_trainings.rep_label ne doit dépasser 20 caractères.
--   Sinon l'ALTER ... TYPE VARCHAR(20) ÉCHOUE (PostgreSQL ne tronque pas :
--   « value too long for type character varying(20) »). En particulier, les
--   labels combinés Épaulé-Jeté générés par le moteur peuvent dépasser 20
--   caractères et doivent être nettoyés/raccourcis au préalable.
--
--   Contrôle recommandé avant d'exécuter :
--     SELECT programme_training_id, rep_label, length(rep_label)
--     FROM programme_trainings
--     WHERE length(rep_label) > 20;
--
-- Idempotent : bloc DO $$ conditionnel sur character_maximum_length > 20.
-- rep_label reste NULLABLE (nullabilité inchangée).
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'programme_trainings'
                 AND column_name = 'rep_label'
                 AND character_maximum_length > 20) THEN
        ALTER TABLE programme_trainings
            ALTER COLUMN rep_label TYPE VARCHAR(20);
    END IF;
END $$;

COMMENT ON COLUMN programme_trainings.rep_label IS 'Label des répétitions (si complexe, ex : "30s + 10 reps")';
