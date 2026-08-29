---
name: check-performance
description: Repérer les problèmes de performance dans un changement de code OBC Planner (requêtes N+1, requêtes en boucle, absence d'index, SELECT *, absence de pagination, chargements EAGER inutiles). À utiliser en revue pour valider la tenue en charge avant intégration.
allowed-tools: Read, Grep, Glob, CodeIntelligence
---

# Contrôler la performance

Analyse un changement pour détecter les anti-patterns de performance, surtout côté accès aux données. Le skill **détecte et recommande** ; il ne corrige pas.

## Quand l'utiliser

- En revue, sur du code touchant les repositories, services, requêtes, listes, ou des migrations.
- Après `git-diff` quand des zones de volumétrie/requêtes sont repérées.

## Références obligatoires

- `.kiro/steering/*-convention.md` — section PostgreSQL/performance : indexation `WHERE`/`JOIN`/`ORDER BY`, pas de requête en boucle (préférer batch/listes), `JOIN` explicites, pas de `SELECT *`, `EXISTS` > `IN`, pagination `Pageable`/`LIMIT`, éviter `DISTINCT`/`UNION`/`GROUP BY` inutiles, vues pour les requêtes coûteuses ; section JPA : `FetchType.LAZY` par défaut.
- `.kiro/steering/architecture.md` — schéma des tables (volumétrie potentielle, index existants, relations).

## Contrat d'entrée

```
CHANGEMENT   : <diff/PR ou fichiers modifiés>
CONTEXTE     : <optionnel : volumétrie attendue, endpoint listé, lenteur observée>
```

## Procédure

1. **Accès aux données** : détecter les requêtes dans des boucles, les N+1 (relations chargées itérativement), les `SELECT *`.
2. **Indexation** : les colonnes filtrées/triées/jointes sont-elles indexées (au schéma) ? une migration crée-t-elle un besoin d'index non couvert ?
3. **Volumétrie** : les listes sont-elles paginées ? les gros traitements sont-ils groupés (batch) ?
4. **JPA** : associations en `EAGER` injustifiées ? transactions trop larges ou absentes sur opérations multiples ?
5. **Requêtes** : `JOIN` explicites, `EXISTS` plutôt que `IN`, pas de `DISTINCT`/`UNION`/`GROUP BY` superflus ; envisager une vue pour le coûteux.
6. **Frontend** : rendus/`@for` sur grandes listes sans virtualisation, appels HTTP redondants.
7. **Statuer** : lister les problèmes par impact estimé, avec preuve et optimisation recommandée. Recommander un test de charge (skill `test-performance`) si pertinent.

## Livrables

- **Verdict performance** : conforme / points d'attention / problèmes bloquants.
- **Liste des problèmes** : type, preuve (fichier:ligne), impact estimé, optimisation recommandée.
- **Recommandation de test de performance** le cas échéant.

## Critères de qualité

- Chaque problème est justifié par une preuve traçable et un impact estimé.
- Requêtes en boucle, N+1, index, pagination et EAGER sont explicitement vérifiés.
- Les recommandations sont concrètes et alignées sur `*-convention.md`.
- Aucune modification de code.
