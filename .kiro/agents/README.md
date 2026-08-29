# Agents OBC Planner

Agents Kiro spécialisés (`.kiro/agents/{nom}.json`) qui composent les [skills](../skills/README.md) du projet.
Chaque agent est **autonome** (invocable seul) et **coordonnable** par l'`orchestrator` dans une pipeline de dev complète.

## Principes communs

- **Format** : fichier JSON conforme au schéma Kiro (`name`, `description`, `prompt`, `tools`, `allowedTools`, `resources`). Le nom de fichier = nom de l'agent. Validé via `kiro-cli agent validate --path .kiro/agents/<nom>.json`.
- **Ressources** :
  - steering en `file://.kiro/steering/**/*.md` → **toujours** en contexte (règles projet) ;
  - skills en `skill://.kiro/skills/<nom>/SKILL.md` → métadonnées chargées au démarrage, **contenu chargé à la demande** (économie de crédits).
- **Parcimonie (crédits)** : chaque `prompt` contient un tableau « skill → condition de lecture » et la consigne de n'invoquer QUE les skills strictement nécessaires. Un agent « appelle un skill » en lisant son `SKILL.md` et en suivant sa procédure.
- **Outils** : tous les outils sont disponibles (`tools`) ; seuls les outils de lecture sont auto-approuvés (`allowedTools`), les écritures/commandes demandent confirmation.
- **Langue** : français.

## Catalogue des agents

| Agent | Mission | Skills mobilisés |
|---|---|---|
| [`analyste`](analyste.json) | Clarifier le besoin, cartographier l'existant, définir les axes de développement (aucun code). | `need-analyzer`, `code-explorer`, `dev-planner` |
| [`developpeur`](developpeur.json) | Implémenter/corriger de bout en bout (back, front, migration), APIs, UI, SQL ; capitaliser les leçons. | `feature-builder`, `api-builder`, `ui-generator`, `sql-writer`, `bug-fixer`, `learning-logger` |
| [`reviewer`](reviewer.json) | Revue qualité en lecture seule : diff, régressions, sécurité, performance, accessibilité, conventions. | `git-diff`, `check-regressions`, `check-security`, `check-performance`, `check-accessibility`, `check-conventions` |
| [`testeur`](testeur.json) | Scénarios fonctionnels + tests API (JUnit), UI (Playwright), performance et sécurité. | `test-case`, `test-api`, `test-ui`, `test-performance`, `test-security` |
| [`documentaliste`](documentaliste.json) | Synchroniser la doc avec le code, rédiger le message de commit ; documenter a posteriori si besoin. | `git-diff`, `code-explorer`, `doc-writer`, `commit-message` |
| [`orchestrator`](orchestrator.json) | Chef d'orchestre : fait dialoguer les agents pour réaliser un besoin, en élaguant le parcours. | tous (`skill://.kiro/skills/*/SKILL.md`) |

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

Pipeline **nominale**, systématiquement **élaguée** selon l'ampleur du changement :

```
Analyste → Développeur → Reviewer → Testeur → Documentaliste
```

L'orchestrator saute toute étape non indispensable et le justifie. Heuristiques de périmètre :

| Nature du changement | Parcours typique (élagué) |
|---|---|
| Frontend seul | Dev (`ui-generator`) → Reviewer (`check-accessibility`, `check-conventions`) → Testeur (`test-ui` si parcours impacté) → doc front |
| Backend / API | Dev (`api-builder`) → Reviewer (`check-security`/`check-performance`/`check-regressions`/`check-conventions` selon le code) → Testeur (`test-api`, + `test-security`/`test-performance` si pertinent) → doc (tableau des APIs) |
| Schéma / BD | Dev (`sql-writer`, migration Flyway) → Reviewer (perf/régressions) → doc (schéma des tables) |
| Correctif ciblé | Dev (`bug-fixer`) → test de non-régression ciblé → `learning-logger` si leçon → commit |
| Question / compréhension | Analyste (`code-explorer`) uniquement, aucune implémentation |

## Communication bidirectionnelle

Les échanges entre agents sont à double sens ; les boucles de feedback sont pilotées par l'orchestrator :

- **Reviewer → Développeur** : toute anomalie bloquante repart au développeur pour correction ciblée, puis re-contrôle du seul périmètre concerné (boucle jusqu'à zéro anomalie bloquante, avec garde-fou anti-boucle infinie).
- **Testeur → Développeur** : un test en échec repart au développeur avec le scénario et le comportement attendu.
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
