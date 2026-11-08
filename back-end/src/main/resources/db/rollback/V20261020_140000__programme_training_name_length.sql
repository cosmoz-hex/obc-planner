-- ============================================================
-- ROLLBACK — programme_trainings.exercice_name : VARCHAR(255) -> VARCHAR(100)
--
-- Descente de V20261020_140000__programme_training_name_length.sql.
--
-- ⚠️ PRÉ-REQUIS avant rollback :
--   Aucune valeur programme_trainings.exercice_name ne doit dépasser
--   100 caractères. Sinon l'ALTER ... TYPE VARCHAR(100) ÉCHOUE
--   (PostgreSQL ne tronque pas : « value too long for type character
--   varying(100) »). En particulier, les libellés composés Épaulé + Jeté
--   générés par le moteur peuvent dépasser 100 caractères et doivent être
--   nettoyés/raccourcis au préalable.
--
--   Contrôle recommandé avant d'exécuter :
--     SELECT programme_training_id, exercice_name, length(exercice_name)
--     FROM programme_trainings
--     WHERE length(exercice_name) > 100;
--
-- Idempotent : bloc DO $$ conditionnel sur character_maximum_length > 100.
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'programme_trainings'
                 AND column_name = 'exercice_name'
                 AND character_maximum_length > 100) THEN
        ALTER TABLE programme_trainings
            ALTER COLUMN exercice_name TYPE VARCHAR(100);
    END IF;
END $$;

COMMENT ON COLUMN programme_trainings.exercice_name IS 'Nom de l''exercice planifié (libellé libre, non lié au catalogue)';
