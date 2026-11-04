---
name: dev-planner
description: Transformer un besoin fonctionnel validé en axes de développement techniques pour OBC Planner (impacts backend, frontend, base de données, tests). À utiliser après la synthèse du besoin pour découper le travail, identifier les impacts et proposer une approche technique alignée sur l'architecture et les bonnes pratiques.
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

Le besoin validé est lu depuis le fichier **`.kiro/specs/<feature>/requirements.md`** produit par `need-analyzer` (user stories + critères d'acceptation EARS, règles de gestion, périmètre). En complément :

```
SPEC                  : .kiro/specs/<feature>/  (requirements.md déjà présent)
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
6. **Restituer** en écrivant deux fichiers dans la spec (voir livrables). Ne pas écrire de code applicatif.

## Livrables : `design.md` + `tasks.md` dans la spec

Ce skill écrit **deux fichiers** dans `.kiro/specs/<feature>/`, aux côtés du `requirements.md` existant. Ils constituent le contrat technique consommé par le subagent `developpeur` (contexte isolé → tout doit être sur disque).

### `design.md`

```markdown
# Design — <Titre du besoin>

## Vue d'ensemble
Approche technique retenue en quelques phrases.

## Architecture & impacts par couche
### Base de données
Tables/colonnes/contraintes impactées, script Flyway (montée + rollback), nommage.
### Backend
Entités, repositories, services (interface + impl), DTOs `*Request`/`*Response`, controllers, sécurité. Fichiers/packages visés.
### Frontend
Pages, composants, services HTTP, models, i18n (fr/en), accessibilité. Fichiers visés.

## Flux de données / séquence
Enchaînement requête → service → repository → réponse (diagramme textuel si utile).

## Modèle de données
Entités/DTOs impactés et leurs champs.

## Gestion des erreurs
Codes/exceptions attendus (ex. 404 introuvable, 409 conflit métier).

## Migration de données
Besoin de script Flyway (oui/non), stratégie montée + rollback.

## Risques & points d'attention
Régressions, perf, sécurité, accessibilité, dette. Pièges `learning.md` applicables.

## Stratégie de tests
Comportements à couvrir (API idempotents, UI, perf/sécu si pertinent).
```

### `tasks.md`

Les tâches sont **regroupées par lot cohérent** (= une unité de délégation à un subagent `developpeur`), typiquement par couche : BD → Backend → Frontend → Tests/Vérification. Chaque lot porte un numéro, chaque sous-tâche une case à cocher et une **traçabilité vers les requirements** (US1, US2…).

```markdown
# Tasks — <Titre du besoin>

> Chaque lot (section numérotée) est une unité d'invocation du subagent `developpeur`.
> Ordre d'exécution = ordre des lots (dépendances explicites).

## Lot 1 — Base de données
- [ ] 1.1 <tâche> _(US1)_
- [ ] 1.2 <tâche> _(US1, US2)_
- Dépendances : aucune

## Lot 2 — Backend
- [ ] 2.1 <tâche> _(US1)_
- [ ] 2.2 <tâche> _(US2)_
- Dépendances : Lot 1

## Lot 3 — Frontend
- [ ] 3.1 <tâche> _(US1)_
- Dépendances : Lot 2

## Lot 4 — Vérification
- [ ] 4.1 Compilation back + build front verts
- Dépendances : Lot 3
```

Un lot absent (ex. pas d'impact BD) est simplement omis et justifié en une ligne. Le découpage reste gouverné par la **parcimonie** : ne pas créer de lot sans impact réel.

## Critères de qualité

- Chaque axe est aligné sur les conventions de `*-convention.md` (3 couches, DTOs, Flyway idempotent + rollback, Signals/standalone, i18n, accessibilité).
- Les impacts sur les données passent par Flyway, jamais par `ddl-auto`.
- Les dépendances entre lots sont explicites et l'ordre est cohérent.
- Chaque sous-tâche de `tasks.md` est tracée vers au moins un requirement (US1, US2…).
- Les lots sont dimensionnés pour une invocation par lot (pas une invocation par micro-tâche).
- Le plan reste au niveau conception : pas de code applicatif produit.
- `design.md` et `tasks.md` sont écrits dans `.kiro/specs/<feature>/` ; les chemins sont communiqués dans la restitution.
