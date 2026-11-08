-- ============================================================
-- BUGFIX — programme_trainings.exercice_name : VARCHAR(100) -> VARCHAR(255)
--
-- Symptôme : DataIntegrityViolationException « value too long for type
-- character varying(100) » à l'insert into programme_trainings lors de la
-- génération d'un programme.
--
-- Cause racine : pour les cases Épaulé-Jeté (CJ de la trame), le moteur de
-- génération (ProgrammeGenerationServiceImpl#emitCombined) construit un libellé
-- composé « {Épaulé} + {Jeté} ». Or ref_exercices.exercice_name fait jusqu'à
-- VARCHAR(100) ; le nom combiné peut atteindre ~203 caractères (100 + " + " + 100),
-- ce qui dépasse la cible programme_trainings.exercice_name VARCHAR(100)
-- (introduite en VARCHAR(100) NOT NULL par V20261018_100000).
--
-- Correction : élargir la colonne cible à VARCHAR(255) (marge confortable
-- couvrant 100 + " + " + 100 = 203). NOT NULL conservé (le nom est toujours
-- renseigné).
--
-- Idempotent : bloc DO $$ conditionnel sur character_maximum_length < 255
-- (l'élargissement de type est rejouable, mais on reste cohérent avec le style
-- idempotent du projet). Non destructif : élargissement de type, aucune donnée
-- supprimée ni tronquée.
--
-- Le rollback figure dans db/rollback/V20261020_140000__programme_training_name_length.sql.
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'programme_trainings'
                 AND column_name = 'exercice_name'
                 AND character_maximum_length < 255) THEN
        ALTER TABLE programme_trainings
            ALTER COLUMN exercice_name TYPE VARCHAR(255);
    END IF;
END $$;

COMMENT ON COLUMN programme_trainings.exercice_name IS 'Nom de l''exercice planifié (libellé libre, non lié au catalogue) ; peut être un libellé composé Épaulé + Jeté';
