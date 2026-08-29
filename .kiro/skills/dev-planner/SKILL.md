---
name: dev-planner
description: Transformer un besoin fonctionnel validé en axes de développement techniques pour OBC Planner (impacts backend, frontend, base de données, tests). À utiliser après la synthèse du besoin pour découper le travail, identifier les impacts et proposer une approche technique alignée sur l'architecture et les bonnes pratiques.
allowed-tools: Read, Grep, Glob, CodeIntelligence
---

# Définir les axes de développement

À partir d'un besoin fonctionnel validé, produit un découpage technique actionnable : quels composants toucher, dans quel ordre, avec quels impacts sur les données et les tests. Le skill **conçoit et planifie**, il **n'implémente pas**.

## Quand l'utiliser

- Après `need-analyzer`, quand le besoin est clair et validé.
- Pour cadrer une évolution avant que le développeur ne commence à coder.
- Pour estimer les impacts et l'ordre des travaux.

## Références obligatoires

- `.kiro/steering/architecture.md` — packages backend, modules frontend, schéma des tables, APIs existantes (point d'ancrage principal).
- `.kiro/steering/*-convention.md` — conventions à respecter dans les axes proposés (couches, DTOs, Flyway, Signals, etc.).
- `.kiro/steering/product.md` — cohérence fonctionnelle.
- `.kiro/steering/learning.md` — pièges déjà rencontrés à ne pas reproduire.
- Le code réel des zones impactées (via une analyse préalable ou le skill `code-explorer`).

## Contrat d'entrée

```
BESOIN VALIDÉ         : <synthèse fonctionnelle issue de need-analyzer>
CRITÈRES ACCEPTATION  : <critères vérifiables>
ÉTAT DE L'EXISTANT    : <optionnel : sortie de code-explorer>
CONTRAINTES           : <optionnel : techniques, délai, périmètre>
```

## Procédure

1. **Ancrer dans l'architecture** : localiser dans `architecture.md` et le code les zones impactées (couches back, modules front, tables).
2. **Identifier les impacts par couche** :
   - Base de données : nouvelles tables/colonnes/contraintes → script Flyway (montée + rollback), respect du nommage.
   - Backend : entités, repositories, services (interface + impl), DTOs `*Request`/`*Response`, controllers, sécurité.
   - Frontend : pages, composants, services HTTP, models, i18n (fr/en), accessibilité.
   - Tests : quels comportements devront être couverts (API idempotents, UI, perf/sécu si pertinent).
3. **Découper en axes** : chaque axe est une unité de travail cohérente, ordonnée par dépendance (données → back → front → tests).
4. **Anticiper les risques** : migrations non idempotentes, régressions, contraintes de perf/sécu, points d'accessibilité.
5. **Proposer l'ordre d'exécution** et les points de validation intermédiaires.
6. **Restituer** le plan technique (voir livrables). Ne pas écrire de code applicatif.

## Livrables

Un plan de développement :

- **Vue d'ensemble** : approche technique retenue en quelques phrases.
- **Impacts par couche** : DB / Backend / Frontend / Tests, avec fichiers ou packages visés.
- **Axes de développement** : liste ordonnée d'unités de travail, chacune avec objectif, fichiers concernés, dépendances.
- **Migration de données** : besoin de script Flyway (oui/non), stratégie montée + rollback.
- **Risques et points d'attention** : régressions, perf, sécurité, accessibilité, dette.
- **Ordre d'exécution recommandé** et jalons de validation.

## Critères de qualité

- Chaque axe est aligné sur les conventions de `*-convention.md` (3 couches, DTOs, Flyway idempotent + rollback, Signals/standalone, i18n, accessibilité).
- Les impacts sur les données passent par Flyway, jamais par `ddl-auto`.
- Les dépendances entre axes sont explicites et l'ordre est cohérent.
- Le plan reste au niveau conception : pas de code applicatif produit.
