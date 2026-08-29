# Skills OBC Planner

Bibliothèque de **skills atomiques et autonomes**. Chaque skill est un `SKILL.md` autoportant :
il définit quand l'utiliser, les fichiers de référence à charger, un **contrat d'entrée structuré**,
une procédure, des livrables et des critères de qualité.

Un skill peut être invoqué de deux façons, avec le **même contrat d'entrée** :
- **indépendamment**, pour réaliser une tâche précise à la demande ;
- **dans une pipeline**, appelé par un agent (les agents seront créés ultérieurement et composeront ces skills).

## Principes communs

- **Ancrage documentaire** : chaque skill s'appuie systématiquement sur `.kiro/steering/*` (`product.md`, `architecture.md`, `*-convention.md`, `learning.md`) et sur `docs/` / `README.md` selon le besoin. Ces fichiers sont la source de vérité.
- **Format** : frontmatter YAML (`name`, `description`, `allowed-tools`) puis corps en français.
- **Autonomie** : aucun skill ne dépend d'un autre pour fonctionner. Certains se **chaînent naturellement** (ex. `git-diff` → contrôles de revue), mais chacun accepte aussi une entrée fournie directement.
- **Vérification** : les skills qui produisent du code vérifient la compilation (`mvn -q -f back-end/pom.xml compile` / `mvn test`) ou le build (`npm --prefix front-end run build`).

## Conventions de test figées (projet)

- **Backend** : JUnit 5 avec les dépendances déjà présentes dans `back-end/pom.xml` (`spring-boot-starter-webmvc-test`, `spring-boot-starter-flyway-test`). Pas de Testcontainers sans validation.
- **Données de test backend** : `back-end/src/test/resources/data/` (sous-dossier `perf/` pour la volumétrie).
- **Frontend** : Playwright pour l'e2e, installé et rangé dans `front-end/e2e/` (+ `fixtures/`), **hors** de `src/`. Les fichiers de test frontend ne sont créés **que** par le skill `test-ui` (le développeur n'en crée pas à la création d'un composant).
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
| [`feature-builder`](feature-builder/SKILL.md) | Implémenter une évolution de bout en bout (back + front + migration). |
| [`bug-fixer`](bug-fixer/SKILL.md) | Diagnostiquer et corriger un bug à la cause racine. |
| [`api-builder`](api-builder/SKILL.md) | Créer/faire évoluer un endpoint REST (Controller → Service → Repository). |
| [`ui-generator`](ui-generator/SKILL.md) | Créer un composant/page Angular (standalone, Signals, i18n, a11y). |
| [`sql-writer`](sql-writer/SKILL.md) | Rédiger/optimiser une requête SQL/JPA ou un script Flyway. |
| [`learning-logger`](learning-logger/SKILL.md) | Consigner une leçon dans `learning.md` après une correction. |

### Revue (Reviewer)
| Skill | Rôle |
|---|---|
| [`git-diff`](git-diff/SKILL.md) | Cartographier un changement (diff/PR) et orienter la revue. |
| [`check-regressions`](check-regressions/SKILL.md) | Détecter les régressions fonctionnelles. |
| [`check-security`](check-security/SKILL.md) | Détecter les failles de sécurité. |
| [`check-performance`](check-performance/SKILL.md) | Détecter les problèmes de performance. |
| [`check-accessibility`](check-accessibility/SKILL.md) | Vérifier l'accessibilité d'un changement d'UI. |
| [`check-conventions`](check-conventions/SKILL.md) | Vérifier la conformité aux conventions du projet. |

> Les skills `check-*` sont en **lecture seule** : ils détectent et recommandent, ils ne corrigent pas.

### Test (Testeur)
| Skill | Rôle |
|---|---|
| [`test-case`](test-case/SKILL.md) | Formaliser les scénarios fonctionnels (nominaux/limites/erreurs). |
| [`test-api`](test-api/SKILL.md) | Tests d'API JUnit idempotents (MockMvc + Flyway de test). |
| [`test-ui`](test-ui/SKILL.md) | Tests UI end-to-end Playwright (dossier `e2e/`). |
| [`test-performance`](test-performance/SKILL.md) | Tests de performance JUnit orientés volumétrie. |
| [`test-security`](test-security/SKILL.md) | Tests de sécurité JUnit orientés attaque. |

### Documentation (Documentaliste)
| Skill | Rôle |
|---|---|
| [`doc-writer`](doc-writer/SKILL.md) | Synchroniser la doc (`architecture.md`, README, docs) avec le code. |
| [`commit-message`](commit-message/SKILL.md) | Rédiger un message de commit conforme à la convention Git. |

## Enchaînements typiques (indicatifs, non obligatoires)

- **Évolution** : `need-analyzer` → `dev-planner` → `feature-builder` (+ `api-builder` / `ui-generator` / `sql-writer`) → `test-case` → tests → revue → `doc-writer` → `commit-message`.
- **Correction** : `code-explorer` → `bug-fixer` → test de non-régression → `learning-logger` → `commit-message`.
- **Revue** : `git-diff` → `check-regressions` / `check-security` / `check-performance` / `check-accessibility` / `check-conventions`.
