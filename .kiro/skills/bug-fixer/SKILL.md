---
name: bug-fixer
description: Diagnostiquer et corriger un bug dans OBC Planner en traitant la cause racine, pas le symptôme. À utiliser face à un comportement incorrect (backend, frontend ou données), pour reproduire, localiser, corriger de façon minimale et vérifier la non-régression.
allowed-tools: Read, Write, Edit, Grep, Glob, CodeIntelligence, Shell
---

# Corriger un bug

Traite un dysfonctionnement en remontant à la cause racine, avec une correction ciblée et vérifiée. Le skill privilégie la compréhension avant la modification.

## Quand l'utiliser

- Face à un comportement observé incorrect (erreur, résultat faux, régression, exception).
- Quand il faut corriger sans introduire de nouvelle fonctionnalité.

## Références obligatoires

- `.kiro/steering/*-convention.md` — conventions à respecter dans le correctif (couches, gestion d'erreurs, Flyway, Signals, etc.).
- `.kiro/steering/architecture.md` — pour localiser la zone concernée.
- `.kiro/steering/product.md` — pour distinguer bug (écart au comportement attendu) et évolution.
- `.kiro/steering/learning.md` — pour vérifier si le bug relève d'un piège déjà documenté, et **y consigner** l'apprentissage si pertinent (voir skill `learning-logger`).

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
6. **Vérifier** : compiler/builder la zone touchée. En cas de deux échecs consécutifs sur la même approche, changer de stratégie et expliquer pourquoi.
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
