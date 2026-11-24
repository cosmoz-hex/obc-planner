---
name: git-diff
description: Analyser un ensemble de modifications de code (git diff, branche ou PR) dans OBC Planner pour en comprendre la portée avant toute revue détaillée. À utiliser comme première étape de review pour cartographier ce qui change et cibler les contrôles à mener.
---

# Analyser un diff

Cartographie un changement de code (diff, branche, PR) : quels fichiers, quelles couches, quels risques potentiels. C'est le point d'entrée de la revue ; il **oriente** les axes de `code-review` (régressions, sécurité, performance, accessibilité, bonnes pratiques) sans les réaliser lui-même.

## Quand l'utiliser

- Au démarrage d'une revue de code, avant les contrôles détaillés.
- Pour comprendre l'ampleur et la nature d'un ensemble de commits.

## Références

- `.kiro/steering/architecture.md` uniquement, pour situer les fichiers modifiés (couches, modules). Pas de `learning.md`, pas de lecture systématique des conventions : elles sont lues par `code-review` selon les axes déclenchés.

## Contrat d'entrée

```
CIBLE       : <optionnel : branche à comparer ou PR, défaut branche courante>
BASE        : <optionnel : branche de référence, défaut main>
INTENTION   : <optionnel : besoin/ticket à l'origine du changement>
```

## Procédure

1. **Récupérer le diff** : ex. `git diff <base>...<cible>`, `git diff --stat`, `git log <base>..<cible>` (lecture seule, aucune opération destructive ni push).
2. **Classer les fichiers modifiés** par couche : migration Flyway / backend (controllers, services, repositories, entités, DTOs) / frontend (pages, composants, services, models, i18n) / config / docs / tests.
3. **Résumer l'intention** apparente du changement et la confronter à l'intention déclarée.
4. **Repérer les zones sensibles** : sécurité (auth, JWT, requêtes SQL), performance (boucles, requêtes, gros volumes), données (migrations), accessibilité (templates), contrats d'API.
5. **Orienter la revue** : indiquer quels axes de `code-review` déclencher (sécurité, performance, non-régression, accessibilité, normes) et sur quels fichiers en priorité.

## Livrables

- **Résumé du changement** : objectif, ampleur (fichiers, couches).
- **Inventaire classé** des fichiers modifiés par couche.
- **Zones sensibles** identifiées.
- **Plan de revue** : contrôles recommandés et fichiers prioritaires.

## Critères de qualité

- Aucune opération git destructive (pas de reset/force/clean) ; lecture seule.
- Chaque fichier modifié est classé et rattaché à une couche/fonctionnalité.
- Les zones à risque sont identifiées et orientées vers le bon axe de `code-review`.
- Aucune modification de code.
