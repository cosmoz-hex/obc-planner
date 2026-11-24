---
name: doc-writer
description: Créer ou mettre à jour la documentation d'OBC Planner (steering architecture*.md, README, docs) en cohérence avec un changement de code. À utiliser après une évolution pour synchroniser la documentation avec l'état réel du projet.
---

# Mettre à jour la documentation

Synchronise la documentation avec l'état réel du code après un changement. Ne modifie **que des fichiers de documentation**, jamais le code applicatif.

## Quand l'utiliser

- Après une évolution touchant packages, routes front, APIs, DTOs, schéma des tables, libs.
- Quand la documentation diverge du code réel ou pour documenter une nouvelle fonctionnalité.

## Table de routage (cible selon la nature du changement)

| Changement | Fichier à mettre à jour |
|---|---|
| Package, entité/moteur (description), structure ou routes front, libs | `.kiro/steering/architecture.md` |
| Endpoint REST, DTO, contrat d'API | `.kiro/steering/architecture-api.md` |
| Table, colonne, contrainte, migration, risque/dette | `.kiro/steering/architecture-db.md` |
| Journal des modifications | entrée courte (3-5 lignes) en tête de `.kiro/archive/architecture-changelog.md` (jamais en tête des fichiers chargés) |
| Périmètre fonctionnel | `.kiro/steering/product.md` |
| Installation, stack, commandes | `README.md` (racine, `back-end/`, `front-end/`), `docs/` |

## Contrat d'entrée

```
CHANGEMENT   : <diff/PR ou fichiers modifiés, idéalement sortie de git-diff>
NATURE       : <structure packages / API / table / lib / fonctionnalité>
INTENTION    : <ce que le changement apporte>
```

## Procédure (sobriété)

1. **Comprendre le changement** à partir du diff fourni (ou `git-diff`).
2. **Router** vers le(s) seul(s) fichier(s) concerné(s) via la table ci-dessus.
3. **Cibler** : localiser la section impactée par `grep`/recherche (ex. nom de table, endpoint) et ne lire que cette section ; ne jamais relire ni réécrire un fichier entier.
4. **Produire un delta** (`str_replace` ciblé) en respectant le format existant (tableaux, titres) et en restant factuel (état réel du code, pas l'intention).
5. **Vérifier** la cohérence locale (pas de contradiction avec le code, chemins valides) et l'absence de caractères corrompus (UTF-8 sans BOM).
6. Ne pas lire toutes les conventions : se référer à `*-convention.md` uniquement si un doute sur un déclencheur subsiste.

## Livrables

- Sections mises à jour (delta) + entrée de changelog archivé.
- Récapitulatif : fichiers/sections modifiés et pourquoi.

## Critères de qualité

- Documentation = état réel du code (vérifié).
- Format existant respecté ; seuls les fichiers impactés sont touchés.
- Seuls des fichiers de documentation sont modifiés.
