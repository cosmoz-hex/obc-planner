---
name: code-explorer
description: Cartographier l'état actuel du code, des données et des fonctionnalités d'OBC Planner avant toute évolution. À utiliser quand on doit comprendre comment une fonctionnalité, un module, une table ou une API est aujourd'hui implémentée, pour produire un état des lieux factuel et sourcé.
---

# Analyser l'existant

Produit un état des lieux factuel d'une zone du projet OBC Planner (fonctionnalité, module backend/frontend, table, API) avant qu'une évolution ou une correction ne soit décidée. Ce skill **n'écrit aucun code** : il lit, cartographie et restitue.

## Quand l'utiliser

- Avant de définir des axes de développement ou de chiffrer une évolution.
- Quand un besoin utilisateur touche une zone dont l'implémentation actuelle est mal connue.
- Pour vérifier si une fonctionnalité existe déjà (totalement ou partiellement) avant d'en créer une nouvelle.

## Références

Charger uniquement la section utile (grep), pas les fichiers entiers :

- `.kiro/steering/product.md` : périmètre fonctionnel, si le vocabulaire métier est en jeu.
- `.kiro/steering/architecture.md` : packages, modules front, routes (déjà en contexte pour les agents).
- `architecture-api.md` (APIs, DTOs) et `architecture-db.md` (tables) : seulement si l'API ou la BD est dans le périmètre.
- Convention de la couche concernée (`*-convention.md`) : seulement pour repérer un écart.
- `docs/` et `README.md` : seulement si utiles.

Puis explorer le code réel : `back-end/src/main/java/com/example/backend/**`, `front-end/src/app/**`, `back-end/src/main/resources/db/migration/**`.

## Contrat d'entrée

Que l'appel vienne d'un agent (pipeline) ou d'un humain, l'entrée est structurée ainsi :

```
PÉRIMÈTRE      : <fonctionnalité / module / table / API concernée>
QUESTION CIBLE : <ce que l'on cherche à comprendre exactement>
CONTEXTE       : <optionnel : besoin amont, ticket, symptôme observé>
```

Si le périmètre est absent ou ambigu, demander une précision avant d'analyser.

## Procédure

1. **Cadrer** : situer le périmètre via les références utiles (grep ciblé).
2. **Localiser** : retrouver les fichiers concernés (controllers, services, repositories, entités, DTOs côté back ; pages, composants, services, models côté front ; scripts Flyway pour les tables).
3. **Tracer les flux** : reconstituer le chemin Controller → Service → Repository (back) et Page → Composant → Service HTTP → API (front). Identifier les DTOs et entités mobilisés.
4. **Relever l'état des données** : colonnes, contraintes, index et relations réellement présents dans les migrations, à confronter à `architecture-db.md`.
5. **Détecter les écarts** : signaler les divergences entre le code réel, `architecture.md` et `*-convention.md` (documentation obsolète, conventions non respectées).
6. **Restituer** : produire l'état des lieux (voir livrables). Ne rien inventer : si une information n'est pas trouvée, l'indiquer explicitement.

## Livrables

Un rapport d'état des lieux structuré :

- **Synthèse** : ce qui existe aujourd'hui, en 3–5 phrases.
- **Cartographie technique** : fichiers, classes et couches impliqués (avec chemins).
- **Modèle de données concerné** : tables, colonnes, relations pertinentes.
- **Flux fonctionnel** : parcours de la donnée / de l'action de bout en bout.
- **Écarts et zones d'ombre** : divergences doc/code, dettes, points non couverts, incertitudes.
- **Sources** : liste des fichiers effectivement lus.

## Critères de qualité

- Chaque affirmation est traçable vers un fichier réel (chemin cité).
- Aucune supposition présentée comme un fait ; les incertitudes sont nommées.
- L'écart entre la documentation de référence et le code réel est explicitement relevé.
- Aucune modification de code ni de fichier.
