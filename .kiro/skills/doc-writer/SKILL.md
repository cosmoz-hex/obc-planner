---
name: doc-writer
description: Créer ou mettre à jour la documentation d'OBC Planner (steering architecture.md, README, docs) en cohérence avec un changement de code. À utiliser après une évolution pour synchroniser la documentation avec l'état réel du projet.
allowed-tools: Read, Write, Edit, Grep, Glob, CodeIntelligence, Shell
---

# Mettre à jour la documentation

Synchronise la documentation du projet avec l'état réel du code après un changement. Le skill met à jour **uniquement les fichiers de documentation** ; il ne modifie pas le code applicatif.

## Quand l'utiliser

- Après une évolution qui touche la structure des packages, les APIs, le schéma des tables, les libs.
- Quand la documentation existante diverge du code réel.
- Pour documenter une nouvelle fonctionnalité ou un nouvel écran.

## Références obligatoires

- `.kiro/steering/*-convention.md` — **déclencheurs de mise à jour** : « mettre à jour `architecture.md` à chaque modification de l'architecture » (libs pom.xml/package.json, structure des packages, structure des tables, ajout/modif d'APIs).
- `.kiro/steering/architecture.md` — **cible principale** : packages backend, modules frontend, tableau des APIs, schéma des tables. Format à respecter.
- `.kiro/steering/product.md` — pour aligner la documentation fonctionnelle.
- `README.md` (racine, `back-end/`, `front-end/`) — installation, stack, commandes.
- `docs/` — documentation complémentaire (ex. `docs/mermaid.txt`).
- Le changement de code à documenter (idéalement via la sortie du skill `git-diff`).

## Contrat d'entrée

```
CHANGEMENT   : <diff/PR ou fichiers modifiés, idéalement sortie de git-diff>
NATURE       : <structure packages / API / table / lib / fonctionnalité>
INTENTION    : <ce que le changement apporte>
```

## Procédure

1. **Comprendre le changement** : à partir du diff (ou via `git-diff`), identifier ce qui, dans le code réel, n'est plus reflété par la documentation.
2. **Identifier les cibles doc** :
   - Nouvelle/modif de package → section structure de `architecture.md`.
   - Nouvel/modif endpoint → tableau des APIs de `architecture.md`.
   - Nouvelle/modif table ou colonne → section schéma de `architecture.md` (colonnes, contraintes, relations).
   - Nouvelle lib (`pom.xml`/`package.json`) → stack (`architecture.md`, README).
   - Nouvelle fonctionnalité → `product.md` si le périmètre fonctionnel évolue.
3. **Mettre à jour** en respectant le format existant (tableaux, titres, style) et en restant factuel (refléter le code réel, pas l'intention).
4. **Vérifier la cohérence** : pas de contradiction résiduelle entre doc et code ; liens et chemins valides.
5. **Rester minimal** : ne documenter que ce qui a changé ; ne pas réécrire des sections non impactées.

## Livrables

- Les sections de documentation mises à jour (principalement `architecture.md`, éventuellement README/`product.md`/`docs/`).
- Un récapitulatif : quels fichiers/sections modifiés et pourquoi.

## Critères de qualité

- La documentation reflète l'état réel du code (vérifié, pas supposé).
- Le format existant des fichiers est respecté (tableaux APIs, schéma des tables, structure des packages).
- Tous les déclencheurs de `*-convention.md` applicables au changement sont couverts.
- Seuls des fichiers de documentation sont modifiés.
