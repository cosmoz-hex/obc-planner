-- ============================================================
-- BUGFIX — programme_trainings.rep_label : VARCHAR(20) -> VARCHAR(50)
--
-- Symptôme (latent, non encore déclenché) : DataIntegrityViolationException
-- « value too long for type character varying(20) » à l'insert into
-- programme_trainings lors de la génération d'un programme comportant des
-- cases Épaulé-Jeté (CJ) dont les répétitions sources sont longues.
--
-- Cause racine : pour les cases Épaulé-Jeté, le moteur de génération
-- (ProgrammeGenerationServiceImpl#combinedRepLabel) construit un label composé
-- à partir de ref_exercice_sets.rep_number (VARCHAR(20)) :
--   - reps égales : "{repsCL} (1 + 1)"      -> jusqu'à ~28 caractères
--   - reps différentes : "({repsCL} + {repsJK})" -> jusqu'à 2 + 20 + 3 + 20 + 1 = 46 caractères
-- Or la colonne cible rep_label a été créée en VARCHAR(20)
-- (V20260815_171100__init.sql). Dès que les reps sources sont longues, le label
-- combiné dépasse 20 caractères et l'insert échoue. Le bug n'a pas encore été
-- rencontré uniquement parce que les reps testées étaient courtes.
--
-- Correction : élargir la colonne cible à VARCHAR(50) (marge confortable
-- couvrant les ~46 caractères max du label combiné). rep_label reste NULLABLE
-- (nullabilité inchangée).
--
-- Idempotent : bloc DO $$ conditionnel sur character_maximum_length < 50
-- (l'élargissement de type est rejouable, cohérent avec le style idempotent du
-- projet). Non destructif : élargissement de type, aucune donnée supprimée ni
-- tronquée.
--
-- Le rollback figure dans
-- db/rollback/V20261020_180000__programme_training_rep_label_length.sql.
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'programme_trainings'
                 AND column_name = 'rep_label'
                 AND character_maximum_length < 50) THEN
        ALTER TABLE programme_trainings
            ALTER COLUMN rep_label TYPE VARCHAR(50);
    END IF;
END $$;

COMMENT ON COLUMN programme_trainings.rep_label IS 'Label de répétitions si complexe, ex. "30s + 10 reps", ou label combiné Épaulé-Jeté "(repsCL + repsJK)"';
