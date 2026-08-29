---
name: test-case
description: Rédiger des scénarios de tests fonctionnels pour une fonctionnalité d'OBC Planner, à partir des règles métier et des critères d'acceptation. À utiliser pour formaliser quoi tester (cas nominaux, limites, erreurs) avant d'écrire les tests techniques API, UI, performance ou sécurité.
allowed-tools: Read, Write, Grep, Glob
---

# Rédiger des scénarios de tests fonctionnels

Transforme un besoin/une fonctionnalité en scénarios de test lisibles et exhaustifs (cas nominaux, cas limites, cas d'erreur), indépendants de la technologie. Ces scénarios alimentent ensuite les skills de test technique (`test-api`, `test-ui`, `test-performance`, `test-security`).

## Quand l'utiliser

- Après validation d'un besoin (idéalement `need-analyzer`) ou d'une implémentation, pour cadrer la couverture de test.
- Comme entrée commune aux différents skills de test technique.

## Références obligatoires

- `.kiro/steering/product.md` — **règles métier de référence** : archétypes et combinaisons d'axes, contraintes (ex. pas de modification/suppression d'évaluation liée à un programme), formats de programme (semaines/fréquence/durée).
- `.kiro/steering/architecture.md` — entités, APIs et écrans concernés.
- `docs/` — compléments fonctionnels.

## Contrat d'entrée

```
FONCTIONNALITÉ       : <fonctionnalité ou évolution à couvrir>
CRITÈRES ACCEPTATION : <critères vérifiables, si disponibles>
RÈGLES DE GESTION    : <règles spécifiques, invariants, interdits>
NIVEAU               : <optionnel : API / UI / bout en bout>
```

## Procédure

1. **Identifier les comportements attendus** à partir des critères d'acceptation et des règles de `product.md`.
2. **Décliner les cas** :
   - **Nominaux** : usage attendu, données valides.
   - **Limites** : bornes (catégories de poids, durées 8/12/16, fréquences 3/4/5), valeurs extrêmes, collections vides/max.
   - **Erreurs** : entrées invalides, interdits métier (ex. suppression d'évaluation liée à un programme), accès non autorisé.
3. **Formaliser** chaque scénario au format Given / When / Then (Étant donné / Quand / Alors), avec données d'exemple et résultat attendu.
4. **Prioriser** (critique / important / secondaire) et indiquer le niveau de test cible (API, UI, perf, sécurité).
5. **Tracer la couverture** vers les critères d'acceptation (chaque critère → au moins un scénario).

## Livrables

- Une **suite de scénarios** structurés (Given/When/Then), regroupés par comportement, avec priorité et niveau de test cible.
- Une **matrice de couverture** critère d'acceptation → scénario(s).
- Les **jeux de données** d'exemple nécessaires (à matérialiser ensuite par les skills techniques).

## Critères de qualité

- Chaque critère d'acceptation est couvert par au moins un scénario.
- Cas nominaux, limites et erreurs sont tous présents.
- Les interdits métier de `product.md` sont explicitement testés.
- Scénarios lisibles, indépendants de la technologie, avec résultat attendu non ambigu.
