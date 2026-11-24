# Skills OBC Planner

Bibliothèque de **skills atomiques et autonomes**. Chaque skill est un `SKILL.md` autoportant :
il définit quand l'utiliser, les fichiers de référence à charger, un **contrat d'entrée structuré**,
une procédure, des livrables et des critères de qualité.

Un skill peut être invoqué de deux façons, avec le **même contrat d'entrée** :
- **indépendamment**, pour réaliser une tâche précise à la demande ;
- **dans une pipeline**, appelé par un agent (les agents seront créés ultérieurement et composeront ces skills).

## Principes communs

- **Ancrage documentaire** : les skills chargent uniquement la section utile (grep) de `.kiro/steering/*` : `product.md`, `architecture.md` (vue d'ensemble), `architecture-api.md`, `architecture-db.md`, convention de la couche concernée. Ces fichiers sont la source de vérité.
- **Format** : frontmatter YAML (`name`, `description`, `allowed-tools`) puis corps en français.
- **Autonomie** : aucun skill ne dépend d'un autre pour fonctionner. Certains se **chaînent naturellement** (ex. `git-diff` → contrôles de revue), mais chacun accepte aussi une entrée fournie directement.
- **Vérification** : la procédure Build (compilation back via `mvnw.cmd`, build front, lecture de `build-out.txt`, contrôle du JDK) est écrite une seule fois dans [`feature-builder`](feature-builder/SKILL.md) ; les autres skills y renvoient.

## Conventions de test figées (projet)

> Aucun skill de test n'est défini pour l'instant. Ces conventions cadrent l'emplacement et l'outillage si des tests sont ajoutés ultérieurement.

- **Backend** : JUnit 5 avec les dépendances déjà présentes dans `back-end/pom.xml` (`spring-boot-starter-webmvc-test`, `spring-boot-starter-flyway-test`). Pas de Testcontainers sans validation.
- **Données de test backend** : `back-end/src/test/resources/data/` (sous-dossier `perf/` pour la volumétrie).
- **Frontend** : Playwright pour l'e2e, rangé dans `front-end/e2e/` (+ `fixtures/`), **hors** de `src/`. Le développeur ne crée pas de fichiers de test à la création d'un composant.
- **Performance / sécurité** : JUnit orienté volumétrie / attaque (pas d'outil externe sans validation).

## Catalogue des skills

### Analyse (Analyste)
| Skill | Rôle |
|---|---|
| [`code-explorer`](code-explorer/SKILL.md) | Cartographier l'état actuel du code/données/fonctionnalités avant évolution. |
| [`need-analyzer`](need-analyzer/SKILL.md) | Clarifier une demande floue et produire une synthèse fonctionnelle validable. |
| [`dev-planner`](dev-planner/SKILL.md) | Transformer un besoin validé en axes de développement techniques. |

### Développement (Développeur)
| Skill | Rôle |
|---|---|
| [`feature-builder`](feature-builder/SKILL.md) | Implémenter une évolution de bout en bout (back + front + migration), vérifier le build, ne jamais commiter. Porte la procédure Build. |
| [`bug-fixer`](bug-fixer/SKILL.md) | Diagnostiquer et corriger un bug à la cause racine. |
| [`api-builder`](api-builder/SKILL.md) | Créer/faire évoluer un endpoint REST (Controller → Service → Repository). |
| [`ui-generator`](ui-generator/SKILL.md) | Créer un composant/page Angular (standalone, Signals, i18n, a11y). |
| [`sql-writer`](sql-writer/SKILL.md) | Rédiger/optimiser une requête SQL/JPA ou un script Flyway. |
| [`learning-logger`](learning-logger/SKILL.md) | Consigner une leçon dans `learning.md` après une correction. |

### Revue (Reviewer)
| Skill | Rôle |
|---|---|
| [`git-diff`](git-diff/SKILL.md) | Cartographier un changement (diff/PR) et orienter la revue. |
| [`code-review`](code-review/SKILL.md) | Revue de code complète (régressions, sécurité, performance, accessibilité, conventions, maintenabilité, architecture) sur une PR ou le diff local. |

> Le skill `code-review` est en **lecture seule** : il détecte et recommande, il ne corrige pas.

### Documentation (Documentaliste)
| Skill | Rôle |
|---|---|
| [`doc-writer`](doc-writer/SKILL.md) | Synchroniser la doc (`architecture.md`, README, docs) avec le code. |
| [`commit-message`](commit-message/SKILL.md) | Rédiger un message de commit conforme à la convention Git. |

### Orchestration
| Skill | Rôle |
|---|---|
| [`dev-pipeline`](dev-pipeline/SKILL.md) | Gabarits de prompts de subagents, parcours par nature de changement, seuils de parcimonie (parcours léger < 3 fichiers). Les règles de fond sont dans le prompt de l'agent `orchestrator`, seul à charger ce skill. |

## Enchaînements typiques (indicatifs, non obligatoires)

- **Évolution** : `need-analyzer` → `code-explorer` → `dev-planner` → `feature-builder` (+ `api-builder` / `ui-generator` / `sql-writer`) → `git-diff` → `code-review` → `doc-writer` → `commit-message`.
- **Correction** : `code-explorer` → `bug-fixer` → `learning-logger` → `commit-message`.
- **Revue** : `git-diff` → `code-review`.
- **Pipeline complète** : voir [`dev-pipeline`](dev-pipeline/SKILL.md) (orchestration des 4 rôles).

> `prompt-engineer` n'est rattaché à aucun agent : invocation manuelle uniquement.
