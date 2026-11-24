---
name: bug-fixer
description: Diagnostiquer et corriger un bug dans OBC Planner en traitant la cause racine, pas le symptôme. À utiliser face à un comportement incorrect (backend, frontend ou données), pour reproduire, localiser, corriger de façon minimale et vérifier la non-régression.
---

# Corriger un bug

Traite un dysfonctionnement en remontant à la cause racine, avec une correction ciblée et vérifiée. Le skill privilégie la compréhension avant la modification.

## Quand l'utiliser

- Face à un comportement observé incorrect (erreur, résultat faux, régression, exception).
- Quand il faut corriger sans introduire de nouvelle fonctionnalité.

## Références

Charger uniquement la section utile (grep) :

- Convention de la couche concernée (`spring-convention.md`, `angular-convention.md`, `postgre-convention.md`).
- `architecture.md` pour localiser la zone ; `architecture-api.md` / `architecture-db.md` seulement si l'API ou la BD est en cause.
- `product.md` seulement pour distinguer bug et évolution en cas de doute.
- `learning.md` : vérifier si le bug relève d'un piège documenté (en contexte pour le développeur) ; y consigner l'apprentissage via `learning-logger`.

## Contrat d'entrée

```
SYMPTÔME       : <comportement observé, message d'erreur, capture>
ATTENDU        : <comportement correct attendu>
REPRODUCTION   : <étapes / contexte / données si connus>
ZONE SUSPECTÉE : <optionnel : écran, endpoint, table>
```

## Procédure

1. **Reproduire** ou, à défaut, formuler l'hypothèse de reproduction la plus probable à partir du symptôme.
2. **Localiser** la cause racine en traçant le flux (Controller → Service → Repository / Page → Service → API). Distinguer cause et symptôme.
3. **Vérifier l'ampleur** : la même cause touche-t-elle d'autres endroits ? Ne corriger que ce qui relève du bug (pas de refactor opportuniste non demandé).
4. **Corriger** de façon minimale et conforme aux conventions.
5. **Prévenir la régression** : identifier le test qui aurait détecté le bug (à écrire via le skill de test approprié) et le signaler.
6. **Vérifier** : compiler/builder la zone touchée (procédure Build de `feature-builder`). En cas de deux échecs consécutifs sur la même approche, changer de stratégie et expliquer pourquoi.
7. **Capitaliser** : si le bug vient d'un écart de jugement ou d'une mauvaise pratique, consigner l'apprentissage dans `.kiro/steering/learning.md`.

## Livrables

- Le correctif appliqué (fichiers modifiés).
- Un diagnostic : cause racine identifiée, pourquoi le bug se produisait, portée.
- Le résultat de compilation/build.
- La recommandation de test de non-régression.
- Le cas échéant, l'entrée ajoutée à `learning.md`.

## Critères de qualité

- La cause racine est traitée, pas seulement le symptôme.
- La correction est minimale et n'introduit pas de fonctionnalité non demandée.
- Les conventions du projet sont respectées.
- La zone touchée compile / builde sans erreur.
- Un test de non-régression est identifié (et rédigé si demandé).
