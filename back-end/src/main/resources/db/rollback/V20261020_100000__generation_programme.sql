-- ============================================================
-- ROLLBACK — Génération de programme : retour arrière schéma programme_trainings
--
-- Descente de V20261020_100000__generation_programme.sql.
-- À EXÉCUTER MANUELLEMENT (Flyway ne rejoue pas ce dossier automatiquement).
--
-- ⚠️ PRÉ-REQUIS avant rollback (sinon les ALTER échouent) :
--   * Toutes les valeurs programme_trainings.rep_number doivent être
--     numériques et > 0. PERTE DE DONNÉES POSSIBLE : les valeurs non
--     numériques ('30s', '(1 + 1)', …) ou NULL introduites depuis la montée
--     seront rejetées par la conversion en INTEGER puis par le CHECK recréé.
--     -> Nettoyage préalable requis, par exemple :
--          DELETE FROM programme_trainings
--           WHERE rep_number IS NULL OR rep_number !~ '^[1-9][0-9]*$';
--        (ou mise à jour manuelle des lignes concernées).
--   * Aucune ligne programme_trainings.set_number IS NULL
--     (sinon le SET NOT NULL échoue) :
--          DELETE FROM programme_trainings WHERE set_number IS NULL;
--        (ou renseigner une valeur > 0).
--
-- Idempotent : bloc DO $$ conditionnel sur le type, DROP CONSTRAINT IF EXISTS
-- avant chaque ADD CONSTRAINT, SET NOT NULL rejouable.
-- ============================================================


-- ------------------------------------------------------------
-- 1.3 (inverse) — set_number : NULLABLE -> NOT NULL + CHECK « > 0 »
-- Rétablir le CHECK NULLABLE en « > 0 » d'abord est inutile :
-- on recrée directement le CHECK d'origine (set_number > 0).
-- ------------------------------------------------------------
ALTER TABLE programme_trainings DROP CONSTRAINT IF EXISTS chk_programme_trainings_2;

-- Conversion défensive : refuser le rollback si des set_number NULL subsistent
-- (le SET NOT NULL lèvera sinon une erreur explicite — voir pré-requis ci-dessus).
ALTER TABLE programme_trainings ALTER COLUMN set_number SET NOT NULL;

ALTER TABLE programme_trainings ADD CONSTRAINT chk_programme_trainings_2
    CHECK (set_number > 0);

COMMENT ON COLUMN programme_trainings.set_number IS 'Nombre de séries';


-- ------------------------------------------------------------
-- 1.1 (inverse) — rep_number : VARCHAR(20) NULL -> INTEGER NOT NULL
-- Conversion conditionnelle sur le type courant (idempotence).
-- USING rep_number::integer : échoue si une valeur non numérique subsiste
-- (cf. pré-requis / nettoyage préalable ci-dessus).
-- ------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'programme_trainings'
                 AND column_name = 'rep_number'
                 AND data_type = 'character varying') THEN
        ALTER TABLE programme_trainings
            ALTER COLUMN rep_number TYPE INTEGER USING rep_number::integer;
    END IF;
END $$;

ALTER TABLE programme_trainings ALTER COLUMN rep_number SET NOT NULL;


-- ------------------------------------------------------------
-- 1.2 (inverse) — recréer le CHECK rep_number > 0 + COMMENT d'origine
-- ------------------------------------------------------------
ALTER TABLE programme_trainings DROP CONSTRAINT IF EXISTS chk_programme_trainings_3;
ALTER TABLE programme_trainings ADD CONSTRAINT chk_programme_trainings_3
    CHECK (rep_number > 0);

COMMENT ON COLUMN programme_trainings.rep_number IS 'Nombre de répétitions par série';


-- ------------------------------------------------------------
-- 1.4 — Aucune action : chk_programme_trainings_4 et programme_weeks.week_type
-- n'ont pas été modifiés par la montée.
-- ------------------------------------------------------------
