-- ============================================================
-- ROLLBACK — ref_exercices : référence de calcul de charge des TIRAGES (PL)
--
-- Annule V20261021_120000__fix_pull_charge_reference.sql en restaurant les
-- références d'origine des exercices de tirage :
--   PL + reference 'SP' -> 'SN' (tirage d'arraché)
--   PL + reference 'CP' -> 'CJ' (tirage d'épaulé)
--
-- Ciblage STRICT exercice_type = 'PL' (symétrique de la montée). Idempotent par
-- nature (critère sur la valeur courante SP/CP) ; non destructif.
-- ============================================================

-- PL : SP -> SN (état d'origine du seed)
UPDATE ref_exercices
   SET reference = 'SN'
 WHERE exercice_type = 'PL'
   AND reference = 'SP';

-- PL : CP -> CJ (état d'origine du seed)
UPDATE ref_exercices
   SET reference = 'CJ'
 WHERE exercice_type = 'PL'
   AND reference = 'CP';
