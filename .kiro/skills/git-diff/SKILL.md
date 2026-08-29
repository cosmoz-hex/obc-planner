---
name: git-diff
description: Analyser un ensemble de modifications de code (git diff, branche ou PR) dans OBC Planner pour en comprendre la portée avant toute revue détaillée. À utiliser comme première étape de review pour cartographier ce qui change et cibler les contrôles à mener.
allowed-tools: Read, Grep, Glob, CodeIntelligence, Shell
---

# Analyser un diff

Cartographie un changement de code (diff, branche, PR) : quels fichiers, quelles couches, quels risques potentiels. C'est le point d'entrée de la revue ; il **oriente** les contrôles spécialisés (régressions, sécurité, performance, accessibilité, bonnes pratiques) sans les réaliser lui-même.

## Quand l'utiliser

- Au démarrage d'une revue de code, avant les contrôles détaillés.
- Pour comprendre l'ampleur et la nature d'un ensemble de commits.

## Références obligatoires

- `.kiro/steering/architecture.md` — pour situer les fichiers modifiés dans l'architecture (couches, modules, tables, APIs).
- `.kiro/steering/product.md` — pour rattacher les changements à des fonctionnalités.
- `.kiro/steering/*-convention.md` — grille de lecture des conventions.

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
5. **Orienter la revue** : indiquer quels contrôles spécialisés déclencher (`controler-*`) et sur quels fichiers en priorité.

## Livrables

- **Résumé du changement** : objectif, ampleur (fichiers, couches).
- **Inventaire classé** des fichiers modifiés par couche.
- **Zones sensibles** identifiées.
- **Plan de revue** : contrôles recommandés et fichiers prioritaires.

## Critères de qualité

- Aucune opération git destructive (pas de reset/force/clean) ; lecture seule.
- Chaque fichier modifié est classé et rattaché à une couche/fonctionnalité.
- Les zones à risque sont identifiées et orientées vers le bon contrôle.
- Aucune modification de code.
