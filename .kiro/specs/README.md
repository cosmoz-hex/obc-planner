# Specs OBC Planner

Chaque évolution/correction est décrite par une **spec** dans `.kiro/specs/<feature>/`, où `<feature>` est un identifiant court en `kebab-case` (ex. `filtre-categorie-poids`, `suppression-evaluation`).

Une spec est le **contrat partagé** entre les subagents de la pipeline (`analyste`, `developpeur`, `reviewer`, `documentaliste`). Comme chaque subagent a un contexte isolé, toute l'information de travail est écrite sur disque ici, pas seulement échangée dans le chat.

## Fichiers d'une spec

| Fichier | Produit par | Rôle |
|---|---|---|
| `requirements.md` | `analyste` (`need-analyzer`) | User stories + critères d'acceptation en notation **EARS** (`WHEN … THE SYSTEM SHALL …`), règles de gestion, périmètre. |
| `design.md` | `analyste` (`dev-planner`) | Architecture technique, impacts par couche (BD/back/front), flux, modèle de données, gestion d'erreurs, stratégie de tests. |
| `tasks.md` | `analyste` (`dev-planner`) | Plan d'implémentation découpé en **lots** numérotés (= unité d'invocation du subagent `developpeur`), tracés aux requirements (US1, US2…), avec cases à cocher. |

## Workflow

1. `analyste` écrit `requirements.md` → validation humaine.
2. `analyste` écrit `design.md` + `tasks.md` → validation humaine.
3. `developpeur` implémente **lot par lot** (coche les tâches dans `tasks.md`), build vérifié à chaque lot.
4. `reviewer` contrôle le diff au regard des critères d'acceptation.
5. `documentaliste` synchronise la doc et propose le message de commit.

La fusion/commit reste **manuelle**. Les specs sont versionnées dans le dépôt, à côté du code.
