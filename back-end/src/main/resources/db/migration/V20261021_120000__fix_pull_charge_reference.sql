-- ============================================================
-- BUGFIX — ref_exercices : référence de calcul de charge des TIRAGES (PL)
--
-- Symptôme : les charges min/max générées pour les exercices de tirage
-- (exercice_type = 'PL') sont sous-évaluées.
--
-- Cause racine : le moteur de génération applique la charge d'une série via
-- ProgrammeGenerationServiceImpl#applyCharge -> finalGoals.get(exercice.getReference()).
-- ProgrammeChargeCalculator#finalGoals expose bien deux cibles dédiées au tirage :
--   SP (tirage arraché)  = objectif Arraché       × 1.20 (SNATCH_PULL_COEF)
--   CP (tirage épaulé)   = objectif Épaulé-Jeté    × 1.30 (CLEAN_PULL_COEF)
-- Or, dans les données de référence (seed V20261019_120000__protocoles_data.sql),
-- les exercices PL pointent sur reference = 'SN' (tirages d'arraché) ou 'CJ'
-- (tirages d'épaulé). finalGoals.get(SN)/get(CJ) renvoie alors la cible BRUTE
-- de l'Arraché / EPJ (sans ×1.20 / ×1.30), donc une charge sous-évaluée. Les
-- pourcentages stockés dans ref_exercice_sets.weight pour un tirage sont pourtant
-- exprimés par rapport au MAX THÉORIQUE de tirage (SP/CP), pas par rapport à
-- l'Arraché / EPJ. Les clés SP/CP de finalGoals n'étaient jamais consommées.
--
-- Correction (données de référence, pas de code Java) : faire pointer les
-- exercices PL vers la bonne référence de calcul :
--   PL + reference 'SN' (tirage d'arraché) -> 'SP'
--   PL + reference 'CJ' (tirage d'épaulé)  -> 'CP'
-- Le CHECK chk_ref_exercices_5 (défini en V20261018_100000) autorise déjà
-- 'SP'/'CP' : aucune évolution de contrainte nécessaire.
--
-- Ciblage STRICT exercice_type = 'PL' : les mouvements classiques (SN / CL / JK)
-- utilisent légitimement reference 'SN'/'CJ' (arraché / EPJ bruts) et NE doivent
-- PAS être touchés — d'où la restriction par type.
--
-- Idempotent par nature : critère basé sur la valeur courante de reference
-- (SN/CJ). Après une première exécution, plus aucune ligne PL n'est à SN/CJ,
-- donc une réexécution ne met à jour aucune ligne. Non destructif.
--
-- Couverture vérifiée contre le seed : 45 lignes PL (28 'SN' + 17 'CJ', 0 autre
-- référence), toutes couvertes par le mapping ci-dessous.
--
-- Le rollback figure dans db/rollback/V20261021_120000__fix_pull_charge_reference.sql.
-- ============================================================

-- PL / tirage d'arraché : SN (brut) -> SP (Arraché × 1.20)
UPDATE ref_exercices
   SET reference = 'SP'
 WHERE exercice_type = 'PL'
   AND reference = 'SN';

-- PL / tirage d'épaulé : CJ (brut) -> CP (EPJ × 1.30)
UPDATE ref_exercices
   SET reference = 'CP'
 WHERE exercice_type = 'PL'
   AND reference = 'CJ';
