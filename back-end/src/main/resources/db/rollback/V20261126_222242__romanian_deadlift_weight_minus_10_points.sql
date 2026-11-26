-- ------------------------------------------------------------
-- ROLLBACK de V20261126_222242__romanian_deadlift_weight_minus_10_points
-- Restaure les valeurs d'origine ABSOLUES (rejouable, sans effet cumulé).
-- ------------------------------------------------------------

-- T / STR / séance 3 : MID, CYCLE, TECH, LEARN : 65 -> 75
UPDATE ref_exercice_sets s
SET weight = 75
FROM ref_exercices e
WHERE e.ref_exercice_id = s.ref_exercice_id
  AND e.exercice_name = 'Soulevé de Terre Roumain'
  AND e.exercice_type = 'PL'
  AND e.week_type = 'T'
  AND e.goal = 'STR'
  AND e.training_order = 3
  AND s.archetype IN ('MID', 'CYCLE', 'TECH', 'LEARN');

-- T / STR / séance 3 : ROUGH : 55 -> 65
UPDATE ref_exercice_sets s
SET weight = 65
FROM ref_exercices e
WHERE e.ref_exercice_id = s.ref_exercice_id
  AND e.exercice_name = 'Soulevé de Terre Roumain'
  AND e.exercice_type = 'PL'
  AND e.week_type = 'T'
  AND e.goal = 'STR'
  AND e.training_order = 3
  AND s.archetype = 'ROUGH';

-- S / STR / séance 2 : MID, CYCLE, TECH, LEARN : 70 -> 80
UPDATE ref_exercice_sets s
SET weight = 80
FROM ref_exercices e
WHERE e.ref_exercice_id = s.ref_exercice_id
  AND e.exercice_name = 'Soulevé de Terre Roumain'
  AND e.exercice_type = 'PL'
  AND e.week_type = 'S'
  AND e.goal = 'STR'
  AND e.training_order = 2
  AND s.archetype IN ('MID', 'CYCLE', 'TECH', 'LEARN');

-- S / STR / séance 2 : ROUGH : 65 -> 75
UPDATE ref_exercice_sets s
SET weight = 75
FROM ref_exercices e
WHERE e.ref_exercice_id = s.ref_exercice_id
  AND e.exercice_name = 'Soulevé de Terre Roumain'
  AND e.exercice_type = 'PL'
  AND e.week_type = 'S'
  AND e.goal = 'STR'
  AND e.training_order = 2
  AND s.archetype = 'ROUGH';
