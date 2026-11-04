# Agents OBC Planner

Agents Kiro spécialisés (`.kiro/agents/{nom}.json`) qui composent les [skills](../skills/README.md) du projet.
Chaque agent est **autonome** (invocable seul) et **coordonnable** par l'`orchestrator`, qui les invoque comme **subagents** (contexte isolé) dans une pipeline de dev complète.

## Principes communs

- **Format** : fichier JSON conforme au schéma Kiro v3 (`name`, `description`, `prompt`, `tools`, `resources`, `permissions`). Le nom de fichier = nom de l'agent. Les droits sont exprimés en **capabilities** dans `permissions.rules` (`fs_read`, `fs_write`, `shell`, `skill`, `subagent`…), et non plus via l'ancien `allowedTools`.
- **Ressources** :
  - steering en `file://.kiro/steering/**/*.md` → **toujours** en contexte (règles projet) ;
  - spec en `file://.kiro/specs/**/*.md` → contrat partagé entre subagents (requirements/design/tasks) ;
  - skills en `skill://.kiro/skills/<nom>/SKILL.md` → métadonnées chargées au démarrage, **contenu chargé à la demande** (économie de crédits).
- **Parcimonie (crédits)** : chaque `prompt` contient un tableau « skill → condition de lecture » et la consigne de n'invoquer QUE les skills strictement nécessaires. Un agent « appelle un skill » en lisant son `SKILL.md` et en suivant sa procédure.
- **Outils & droits** : les écritures/commandes sont soumises à `permissions` (lecture auto-approuvée, `shell` en `ask`, écriture de l'analyste restreinte à `.kiro/specs/**`).
- **Langue** : français.

## Catalogue des agents

| Agent | Mission | Skills mobilisés |
|---|---|---|
| [`analyste`](analyste.json) | Clarifier le besoin, cartographier l'existant, produire la spec (`requirements.md`/`design.md`/`tasks.md`, aucun code). | `need-analyzer`, `code-explorer`, `dev-planner` |
| [`developpeur`](developpeur.json) | Implémenter/corriger de bout en bout (back, front, migration), APIs, UI, SQL ; capitaliser les leçons. | `feature-builder`, `api-builder`, `ui-generator`, `sql-writer`, `bug-fixer`, `learning-logger` |
| [`reviewer`](reviewer.json) | Revue qualité en lecture seule : diff, régressions, sécurité, performance, accessibilité, conventions. | `git-diff`, `code-review` |
| [`documentaliste`](documentaliste.json) | Synchroniser la doc avec le code, rédiger le message de commit ; documenter a posteriori si besoin. | `git-diff`, `code-explorer`, `doc-writer`, `commit-message` |
| [`orchestrator`](orchestrator.json) | Chef d'orchestre : délègue à chaque subagent (analyste/développeur/reviewer/documentaliste) pour réaliser un besoin, en élaguant le parcours. | tous (`skill://.kiro/skills/*/SKILL.md`) |

## Utilisation

Basculer vers un agent dans une session Kiro :

```
/agent analyste
/agent developpeur
/agent orchestrator
```

- **Usage isolé** : appeler directement l'agent pour une tâche ciblée (ex. `documentaliste` pour mettre à jour la doc après un oubli, `reviewer` pour auditer un diff).
- **Usage piloté** : passer par l'`orchestrator`, qui décide des agents/skills à solliciter selon l'ampleur du besoin.

## Pipeline de développement (via `orchestrator`)

L'`orchestrator` **délègue** chaque étape à un subagent (contexte isolé), qui communiquent via les **fichiers de spec** sous `.kiro/specs/<feature>/`. Pipeline **nominale**, systématiquement **élaguée** selon l'ampleur du changement :

```
Analyste (produit la spec) → [validation humaine] → Développeur (lot par lot) → Reviewer → Documentaliste
```

Le développement se fait **lot par lot** : chaque lot de `tasks.md` est une invocation distincte du subagent `developpeur`. L'orchestrator saute toute étape non indispensable et le justifie. Heuristiques de périmètre :

| Nature du changement | Parcours typique (élagué) |
|---|---|
| Backend / API | Dev (`api-builder`) → Reviewer (`git-diff` → `code-review`, axes sécurité/performance/régressions/conventions selon le code) → doc (tableau des APIs) |
| Schéma / BD | Dev (`sql-writer`, migration Flyway) → Reviewer (perf/régressions) → doc (schéma des tables) |
| Correctif ciblé | Dev (`bug-fixer`) → `learning-logger` si leçon → `commit-message` |
| Question / compréhension | Analyste (`code-explorer`) uniquement, aucune implémentation |

## Communication bidirectionnelle

Les échanges entre agents sont à double sens ; les boucles de feedback sont pilotées par l'orchestrator :

- **Reviewer → Développeur** : toute anomalie bloquante repart au développeur pour correction ciblée, puis re-contrôle du seul périmètre concerné (boucle jusqu'à zéro anomalie bloquante, avec garde-fou anti-boucle infinie).
- **Analyste → Utilisateur** : toute ambiguïté bloquante est remontée à l'utilisateur **avant** de briefer le développeur ; aucune hypothèse silencieuse (la pipeline est suspendue en attente de réponse).
- **Documentaliste / Développeur → Analyste / Utilisateur** : toute incohérence de conception détectée est remontée plutôt que contournée.

## Gestion / validation

```bash
# Lister les agents
kiro-cli agent list

# Valider un agent
kiro-cli agent validate --path .kiro/agents/orchestrator.json

# Créer un nouvel agent (assisté)
/agent create <nom> --directory .kiro/agents
```

> Les fichiers de configuration sont rechargés à chaud : une modification est appliquée sans redémarrer la session.
