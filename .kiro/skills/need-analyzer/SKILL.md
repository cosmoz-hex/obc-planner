---
name: need-analyzer
description: Transformer une demande utilisateur floue en un besoin clair et validé pour OBC Planner. À utiliser pour poser les bonnes questions de clarification, lever les ambiguïtés, puis produire une synthèse fonctionnelle structurée (contexte, besoin, règles de gestion, critères d'acceptation).
allowed-tools: Read, Grep, Glob
---

# Synthétiser le besoin

Prend une demande brute (souvent incomplète) et la transforme en un besoin fonctionnel clair, cohérent avec le produit OBC Planner. 
Le skill **pose des questions** tant que des zones d'ombre bloquantes subsistent, puis **fige une synthèse** validable.

## Quand l'utiliser

- Au tout début d'une demande d'évolution ou de correction, quand l'intention n'est pas encore précise.
- Quand plusieurs interprétations d'une demande sont possibles.
- Pour cadrer un besoin avant de définir les axes de développement.

## Références obligatoires

- `.kiro/steering/product.md` — vocabulaire métier (haltérophilie : archétypes, évaluations, programmation, référentiel), règles fonctionnelles existantes.
- `.kiro/steering/architecture.md` — pour vérifier la faisabilité et la cohérence avec l'existant.
- `docs/` — tout complément fonctionnel disponible.

Le vocabulaire de la synthèse doit reprendre les termes métier de `product.md` (ex. `archétype`, `foncier`, `deload`, `épaulé-jeté`).

## Contrat d'entrée

```
DEMANDE BRUTE : <ce que l'utilisateur a exprimé, tel quel>
CONTEXTE      : <optionnel : écran concerné, capture, exemple>
CONTRAINTES   : <optionnel : délai, périmètre imposé, dépendances>
```

## Procédure

1. **Reformuler** la demande en une phrase pour vérifier la compréhension initiale.
2. **Confronter au produit** : identifier ce que `product.md` couvre déjà, ce qui est nouveau, ce qui entre en conflit avec l'existant.
3. **Lister les ambiguïtés** et formuler des **questions de clarification** ciblées, priorisées (bloquantes d'abord). Regrouper les questions ; ne pas noyer l'utilisateur.
4. **Attendre les réponses** si des questions bloquantes existent. En mode pipeline, si l'entrée contient déjà les réponses, les intégrer ; sinon, marquer explicitement les hypothèses retenues et les signaler comme « à valider ».
5. **Rédiger la synthèse** structurée (voir livrables) en langage fonctionnel, sans jargon technique inutile.
6. **Faire valider** : la synthèse est un contrat ; signaler qu'elle doit être confirmée avant passage aux axes de développement.

## Livrables

Une synthèse fonctionnelle :

- **Contexte** : d'où vient le besoin, quel problème il résout.
- **Besoin exprimé** : formulation claire de l'objectif utilisateur.
- **Règles de gestion** : conditions, cas limites, interdits (ex. « pas de suppression d'évaluation si un programme en est issu »).
- **Périmètre** : ce qui est inclus / explicitement exclu.
- **Critères d'acceptation** : conditions vérifiables de « c'est fait » (format Given/When/Then possible).
- **Questions ouvertes / hypothèses** : ce qui reste à valider.

## Critères de qualité

- Aucune ambiguïté bloquante laissée sans question ou sans hypothèse explicite.
- Le vocabulaire métier est cohérent avec `product.md`.
- Les critères d'acceptation sont vérifiables et non ambigus.
- La synthèse ne présuppose pas de solution technique (le « comment » relève des axes de développement).
