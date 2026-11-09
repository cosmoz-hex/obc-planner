-- ============================================================
-- ROLLBACK LOT 3 — Données « Renforcement Spécifique » (RF)
--
-- Supprime les lignes insérées par la migration de données :
-- ref_exercice_sets (dépendant) puis ref_exercices, ciblés sur
-- exercice_type = 'RF'.
--
-- Pré-requis : à exécuter AVANT le rollback de schéma
-- (V20261021_140000__renfo_specifique_schema.sql) pour qu'aucune ligne au
-- goal composé (SN_*/CL_*/JK_*) ne subsiste lors de la restauration du
-- CHECK chk_ref_exercices_3 d'origine (10 valeurs).
--
-- ⚠️ Non sélectif sur l'origine : retire également d'éventuelles lignes
-- RF ajoutées manuellement après le seed.
-- ============================================================

DELETE FROM ref_exercice_sets
 WHERE ref_exercice_id IN (
     SELECT ref_exercice_id FROM ref_exercices
      WHERE exercice_type = 'RF'
 );

DELETE FROM ref_exercices
 WHERE exercice_type = 'RF';
