-- ============================================================
-- ROLLBACK LOT 8 — Données par défaut « Protocoles »
--
-- Supprime les lignes insérées par la migration de données :
-- ref_exercice_sets (dépendant) puis ref_exercices, ciblés sur les
-- exercice_type alimentés par le seed (SN, CL, JK, SQ, PL, MS).
--
-- ⚠️ Non sélectif sur l'origine : retire également d'éventuelles lignes
-- de ces types ajoutées manuellement après le seed.
-- ============================================================

DELETE FROM ref_exercice_sets
 WHERE ref_exercice_id IN (
     SELECT ref_exercice_id FROM ref_exercices
      WHERE exercice_type IN ('SN', 'CL', 'JK', 'SQ', 'PL', 'MS')
 );

DELETE FROM ref_exercices
 WHERE exercice_type IN ('SN', 'CL', 'JK', 'SQ', 'PL', 'MS');
