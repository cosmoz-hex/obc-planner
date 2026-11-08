-- ============================================================
-- BUGFIX — programme_weeks.base_percent : NUMERIC(4,2) -> NUMERIC(5,2)
--
-- Symptôme : DataException « ERROR: numeric field overflow — A field with
-- precision 4, scale 2 must round to an absolute value less than 10^2 » à
-- l'insert into programme_weeks (... base_percent ...) lors de la génération
-- d'un programme.
--
-- Cause racine : le moteur de génération (ProgrammeGenerationServiceImpl#
-- computeBasePercents, ainsi que la semaine PC) stocke base_percent comme un
-- pourcentage ENTIER par semaine : 92, 94, 96, 98 et 100. Or la colonne a été
-- créée en NUMERIC(4,2) (V20260815_171100__init.sql), dont la valeur absolue
-- maximale est 99.99 (< 10^2). La valeur 100 exige 3 chiffres avant la virgule
-- et déborde donc le type -> numeric field overflow.
--
-- Correction : élargir la colonne à NUMERIC(5,2) (accueille 100.00, avec marge).
-- Le pourcentage reste stocké en entier (92..100), cohérent avec l'affichage
-- « Base XX% » — aucun changement du moteur.
--
-- Contrainte chk_programme_weeks_2 CHECK (base_percent > 0) : CONSERVÉE
-- (l'ALTER ... TYPE ne l'affecte pas).
--
-- Idempotent : bloc DO $$ conditionnel sur numeric_precision < 5
-- (l'élargissement de précision est rejouable, mais on reste cohérent avec le
-- style idempotent du projet). Non destructif : élargissement de type, aucune
-- donnée supprimée ni tronquée.
--
-- Le rollback figure dans
-- db/rollback/V20261020_160000__programme_week_base_percent_precision.sql.
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'programme_weeks'
                 AND column_name = 'base_percent'
                 AND numeric_precision < 5) THEN
        ALTER TABLE programme_weeks
            ALTER COLUMN base_percent TYPE NUMERIC(5,2);
    END IF;
END $$;

COMMENT ON COLUMN programme_weeks.base_percent IS 'Pourcentage de l''objectif final de la semaine, ex. 92 à 100';
