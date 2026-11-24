---
name: dev-pipeline
description: Compléments de la pipeline de développement d'OBC Planner appliquée par l'agent `orchestrator` : gabarits de prompts de subagents par phase, parcours par nature de changement, seuils de parcimonie. Les règles de fond (traçabilité, validation humaine, boucles, pas de commit) sont dans le prompt de l'orchestrator.
---

# Skill : Pipeline de développement (gabarits et heuristiques)

Les règles de fond (en-tête de traçabilité, hors pipeline, rôles, pipeline en 6 étapes, interdiction de commit, boucles max 3) sont dans le prompt de l'agent `orchestrator`. Ce skill ne contient que ce qu'il ne dit pas. Les subagents ont un contexte isolé : chaque prompt ci-dessous est autoportant et ne transmet que le chemin de la spec, le périmètre et le livrable attendu. Un subagent lit uniquement `requirements.md`, `design.md` et `tasks.md` du dossier transmis.

## Parcours par nature de changement (à élaguer, toujours annoncé en en-tête)

| Nature | Parcours typique |
|---|---|
| Frontend seul | `developpeur` (`ui-generator`) → `reviewer` (axes a11y/conventions) → `documentaliste` (doc front) |
| Backend / API | `developpeur` (`api-builder`) → `reviewer` (sécurité/perf/régressions) → `documentaliste` (`architecture-api.md`) |
| Schéma / BD | `developpeur` (`sql-writer`, Flyway) → `reviewer` (perf/régressions) → `documentaliste` (`architecture-db.md`) |
| Multi-couches | `analyste` complet → `developpeur` (`feature-builder`) → `reviewer` → `documentaliste` |
| Correctif ciblé | `developpeur` (`bug-fixer`) → `learning-logger` si leçon → `documentaliste` (`commit-message`) |
| Outillage / upgrade | `developpeur`, build vérifié, `documentaliste` pour le message ; aucun skill métier, l'annoncer |
| Question / compréhension | Hors pipeline |

## Seuils de parcimonie

- **Parcours léger** : changement mono-couche ou correctif touchant **moins de 3 fichiers** → pas de spec complète ; appel direct du `developpeur` avec un prompt à lot unique (gabarit ci-dessous), annoncé en en-tête (« Étapes sautées : analyse/spec — parcours léger »).
- Reviewer : seulement les axes dont une cible existe dans le diff. Documentaliste : seulement les fichiers de doc de la couche touchée.
- Spec rejetée par l'utilisateur : max 2 itérations de correction, puis proposer qu'il fournisse sa propre spec ou abandonne. Spec partiellement validée : l'analyste corrige avant le développement.

## Gabarits de prompts de subagents

**analyste** : « Traite la demande : {demande}. Applique need-analyzer → code-explorer → dev-planner selon la parcimonie. Écris la spec dans .kiro/specs/<feature>/ (requirements.md EARS, design.md, tasks.md en lots tracés aux US). Si une information bloquante manque, n'écris pas la spec et pose les questions. Restitue les chemins écrits et un résumé. »

**developpeur (lot de spec)** : « Implémente .kiro/specs/<feature>/ : lis requirements.md, design.md, tasks.md et traite UNIQUEMENT le {lot}. Skill adapté à la nature (feature-builder ou bug-fixer). Coche les tâches dans tasks.md. Vérifie le build (procédure Build de feature-builder). Aucun commit ni push. Compte-rendu : fichiers créés/modifiés + résultat build, y compris ce qui n'a pas pu être vérifié. »

**developpeur (parcours léger, lot unique)** : « {demande précise et bornée, fichiers concernés}. Skill : {api-builder | ui-generator | sql-writer | bug-fixer}. Reste dans ce périmètre. Vérifie le build (procédure Build de feature-builder). Aucun commit ni push. Compte-rendu : fichiers modifiés + résultat build. »

**reviewer** : « Revue du changement (spec .kiro/specs/<feature>/ si elle existe). git-diff pour cartographier, puis code-review sur les seuls axes pertinents. Pour chaque anomalie : preuve fichier:ligne, sévérité, recommandation. Conclus par OK ou NEEDS_WORK. Rapport écrit. »

**developpeur (correction)** : « Le reviewer a remonté : {rapport}. Corrige de façon ciblée, relance le build, renvoie la main. Aucun commit ni push. »

**documentaliste** : « Synchronise la doc avec le changement : git-diff (code-explorer si le diff est insuffisant), puis doc-writer sur les seules sections impactées (architecture.md, architecture-api.md, architecture-db.md, README, docs). Message de commit via commit-message uniquement si demandé. Livrable : fichiers de doc mis à jour + message proposé. »

## Notes

- Une incohérence de conception remontée par le développeur ou le documentaliste est renvoyée à l'analyste/utilisateur, pas contournée.
- Fin de pipeline : informer l'utilisateur que le changement est prêt pour relecture, commit et fusion manuels.
