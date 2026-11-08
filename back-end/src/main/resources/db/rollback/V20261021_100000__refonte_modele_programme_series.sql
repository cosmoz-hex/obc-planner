-- ============================================================
-- ROLLBACK — Refonte du modèle Programme en 3 niveaux
--
-- Descente de V20261021_100000__refonte_modele_programme_series.sql.
-- À EXÉCUTER MANUELLEMENT (Flyway ne rejoue pas ce dossier automatiquement).
--
-- Objet : supprimer les tables programme_exercices / programme_series et
-- restaurer les colonnes exercice/série sur programme_trainings dans leur état
-- antérieur à la montée (post V20261020_180000).
--
-- ⚠️ SANS restauration de données : les tables programme* sont régénérables par
-- le moteur de génération (RG9). Ce rollback restaure uniquement la STRUCTURE.
-- La table programme_trainings reste vidée après la montée ; les colonnes
-- restaurées en NOT NULL (exercice_order, exercice_name) ne posent donc pas de
-- problème tant qu'aucune donnée n'est réinsérée manuellement. Si des lignes
-- subsistent dans programme_trainings, nettoyer avant rollback :
--     DELETE FROM programme_trainings;
--
-- Idempotent : DROP ... IF EXISTS, ADD COLUMN IF NOT EXISTS, blocs DO $$
-- conditionnels sur information_schema pour les contraintes.
-- ============================================================


-- ------------------------------------------------------------
-- 4/3 (inverse) — Suppression des 2 nouvelles tables
-- Ordre des FK : programme_series (enfant) avant programme_exercices (parent).
-- ------------------------------------------------------------
DROP TABLE IF EXISTS programme_series;
DROP TABLE IF EXISTS programme_exercices;


-- ------------------------------------------------------------
-- 2 (inverse) — Restaurer les colonnes exercice/série sur programme_trainings
-- États antérieurs à la montée :
--   exercice_order INTEGER NOT NULL        (init)
--   exercice_name  VARCHAR(255) NOT NULL   (V20261020_140000)
--   set_number     INTEGER (nullable)      (V20261020_100000)
--   rep_number     VARCHAR(20) (nullable)  (V20261020_100000)
--   rep_label      VARCHAR(50)             (V20261020_180000)
--   min_weight     NUMERIC(6,2)            (init)
--   max_weight     NUMERIC(6,2)            (init)
-- ------------------------------------------------------------
ALTER TABLE programme_trainings ADD COLUMN IF NOT EXISTS exercice_order INTEGER;
ALTER TABLE programme_trainings ADD COLUMN IF NOT EXISTS exercice_name  VARCHAR(255);
ALTER TABLE programme_trainings ADD COLUMN IF NOT EXISTS set_number     INTEGER;
ALTER TABLE programme_trainings ADD COLUMN IF NOT EXISTS rep_number     VARCHAR(20);
ALTER TABLE programme_trainings ADD COLUMN IF NOT EXISTS rep_label      VARCHAR(50);
ALTER TABLE programme_trainings ADD COLUMN IF NOT EXISTS min_weight     NUMERIC(6, 2);
ALTER TABLE programme_trainings ADD COLUMN IF NOT EXISTS max_weight     NUMERIC(6, 2);

-- Rétablir NOT NULL sur les colonnes qui l'étaient (table vidée -> sans risque).
ALTER TABLE programme_trainings ALTER COLUMN exercice_order SET NOT NULL;
ALTER TABLE programme_trainings ALTER COLUMN exercice_name  SET NOT NULL;


-- ------------------------------------------------------------
-- Recréer les CHECK d'origine (hors chk_programme_trainings_5 training_number,
-- jamais retiré par la montée).
--   chk_programme_trainings_1 : exercice_order > 0
--   chk_programme_trainings_2 : set_number IS NULL OR set_number > 0
--                               (état post V20261020_100000)
--   chk_programme_trainings_4 : max_weight IS NULL OR max_weight >= min_weight
-- Note : chk_programme_trainings_3 (rep_number > 0) n'est PAS recréé — il avait
-- déjà été supprimé par V20261020_100000 (rep_number est VARCHAR, non numérique).
-- ------------------------------------------------------------
ALTER TABLE programme_trainings DROP CONSTRAINT IF EXISTS chk_programme_trainings_1;
ALTER TABLE programme_trainings ADD CONSTRAINT chk_programme_trainings_1
    CHECK (exercice_order > 0);

ALTER TABLE programme_trainings DROP CONSTRAINT IF EXISTS chk_programme_trainings_2;
ALTER TABLE programme_trainings ADD CONSTRAINT chk_programme_trainings_2
    CHECK (set_number IS NULL OR set_number > 0);

ALTER TABLE programme_trainings DROP CONSTRAINT IF EXISTS chk_programme_trainings_4;
ALTER TABLE programme_trainings ADD CONSTRAINT chk_programme_trainings_4
    CHECK (max_weight IS NULL OR max_weight >= min_weight);


-- ------------------------------------------------------------
-- Restaurer les COMMENT d'origine des colonnes/table.
-- ------------------------------------------------------------
COMMENT ON TABLE programme_trainings IS 'Exercices planifiés dans une semaine de programme';
COMMENT ON COLUMN programme_trainings.exercice_order IS 'Ordre de l''exercice dans la séance (si plusieurs fois le même ordre => "Au choix")';
COMMENT ON COLUMN programme_trainings.exercice_name IS 'Nom de l''exercice planifié (libellé libre, non lié au catalogue)';
COMMENT ON COLUMN programme_trainings.set_number IS 'Nombre de séries (NULL pour les cases sans série : RF, PC)';
COMMENT ON COLUMN programme_trainings.rep_number IS 'Répétitions au format libre : 6, 30s, (1 + 1), NULL';
COMMENT ON COLUMN programme_trainings.rep_label IS 'Label de répétitions si complexe, ex. "30s + 10 reps", ou label combiné Épaulé-Jeté "(repsCL + repsJK)"';
COMMENT ON COLUMN programme_trainings.min_weight IS 'Charge minimale en kg';
COMMENT ON COLUMN programme_trainings.max_weight IS 'Charge maximale en kg';
