-- ------------------------------------------------------------
-- Baisse de 10 points de la charge (weight = % de la référence) des séries de
-- 'Soulevé de Terre Roumain' (exercice_type PL), par valeur ABSOLUE cible.
-- Rejouable : chaque UPDATE fixe la valeur finale (jamais de baisse cumulée).
-- Clé de ciblage : exercice_name + exercice_type + week_type + goal + training_order + archetype.
-- Valeurs d'origine vérifiées dans V20261019_120000__protocoles_data.sql.
-- 'SDT Roumain Unilatéral' (musculation, weight NULL) n'est pas concerné.
-- ------------------------------------------------------------

-- T / STR / séance 3 : MID, CYCLE, TECH, LEARN : 75 -> 65 (4 lignes)
UPDATE ref_exercice_sets s
SET weight = 65
FROM ref_exercices e
WHERE e.ref_exercice_id = s.ref_exercice_id
  AND e.exercice_name = 'Soulevé de Terre Roumain'
  AND e.exercice_type = 'PL'
  AND e.week_type = 'T'
  AND e.goal = 'STR'
  AND e.training_order = 3
  AND s.archetype IN ('MID', 'CYCLE', 'TECH', 'LEARN');

-- T / STR / séance 3 : ROUGH : 65 -> 55 (1 ligne)
UPDATE ref_exercice_sets s
SET weight = 55
FROM ref_exercices e
WHERE e.ref_exercice_id = s.ref_exercice_id
  AND e.exercice_name = 'Soulevé de Terre Roumain'
  AND e.exercice_type = 'PL'
  AND e.week_type = 'T'
  AND e.goal = 'STR'
  AND e.training_order = 3
  AND s.archetype = 'ROUGH';

-- S / STR / séance 2 : MID, CYCLE, TECH, LEARN : 80 -> 70 (4 lignes)
UPDATE ref_exercice_sets s
SET weight = 70
FROM ref_exercices e
WHERE e.ref_exercice_id = s.ref_exercice_id
  AND e.exercice_name = 'Soulevé de Terre Roumain'
  AND e.exercice_type = 'PL'
  AND e.week_type = 'S'
  AND e.goal = 'STR'
  AND e.training_order = 2
  AND s.archetype IN ('MID', 'CYCLE', 'TECH', 'LEARN');

-- S / STR / séance 2 : ROUGH : 75 -> 65 (1 ligne)
UPDATE ref_exercice_sets s
SET weight = 65
FROM ref_exercices e
WHERE e.ref_exercice_id = s.ref_exercice_id
  AND e.exercice_name = 'Soulevé de Terre Roumain'
  AND e.exercice_type = 'PL'
  AND e.week_type = 'S'
  AND e.goal = 'STR'
  AND e.training_order = 2
  AND s.archetype = 'ROUGH';
