---
name: sql-writer
description: Rédiger ou optimiser des requêtes SQL / JPA et des scripts de migration Flyway pour OBC Planner (PostgreSQL 17), en respectant le nommage, la sécurité anti-injection, l'indexation et la performance. À utiliser pour concevoir une requête, diagnostiquer une lenteur ou écrire une migration.
allowed-tools: Read, Write, Edit, Grep, Glob, CodeIntelligence, Shell
---

# Rédiger / optimiser une requête SQL

Conçoit, corrige ou optimise l'accès aux données : requêtes JPA/SQL et scripts de migration Flyway, en respectant les conventions PostgreSQL et de performance du projet.

## Quand l'utiliser

- Pour écrire une requête (JPA dérivée, `@Query`, SQL brut justifié) ou une vue.
- Pour diagnostiquer et optimiser une requête lente.
- Pour écrire un script de migration Flyway (schéma ou données).

## Références obligatoires

- `.kiro/steering/postgre-convention.md` — section PostgreSQL : nommage (`pk_`, `fk_`, `idx_`, `uq_`, `chk_`), types recommandés, indexation des colonnes `WHERE`/`JOIN`/`ORDER BY`, requêtes préparées, `JOIN` explicites, pas de `SELECT *`, `@Transactional`, `EXISTS` > `IN`, pagination, `UNION ALL`, vues ; section Migrations : Flyway `V{yyyymmdd}_{hhmiss}__{story}.sql`, idempotence, montée + rollback, ne jamais modifier un script commité.
- `.kiro/steering/architecture.md` — **schéma réel des tables** (colonnes, contraintes, relations) : source de vérité pour écrire des requêtes correctes.
- `back-end/src/main/resources/db/migration/` — scripts existants pour calquer le style et connaître l'état du schéma.
- `.kiro/steering/learning.md` — subtilités métier de données déjà documentées.

## Contrat d'entrée

```
OBJECTIF     : <donnée à récupérer / modifier, ou lenteur à corriger, ou schéma à faire évoluer>
TABLES       : <tables/colonnes concernées>
CONTEXTE     : <requête existante, plan d'exécution, volumétrie si connue>
TYPE         : <lecture JPA/SQL | vue | migration schéma | migration données>
```

## Procédure

1. **Vérifier le schéma réel** dans `architecture.md` et les migrations (colonnes, types, contraintes, relations) avant d'écrire.
2. **Choisir le bon outil** : JPA/Hibernate pour le simple ; `@Query` paramétrée ou vue pour le complexe/coûteux ; SQL brut seulement si justifié.
3. **Écrire** en respectant : colonnes explicites (pas de `SELECT *`), `JOIN` explicites, `EXISTS` plutôt que `IN`, pagination sur les listes, éviter `DISTINCT`/`UNION`/`GROUP BY` inutiles, paramètres liés (anti-injection).
4. **Éviter les requêtes en boucle** côté backend : préférer batch, requêtes groupées ou retour de listes.
5. **Optimiser** si lenteur : lire/`EXPLAIN`, ajouter/ajuster les index (`idx_{table}_{num}`), revoir les jointures, envisager une vue matérialisée rafraîchie.
6. **Migration** : si le schéma change, script Flyway idempotent (vérifier existence avant create/drop, MERGE ou DELETE+INSERT selon FK, ne pas supprimer de données liées), + script de rollback. Nommage `V{yyyymmdd}_{hhmiss}__{story}.sql`. Ne jamais modifier un script commité.
7. **Vérifier** : compilation backend si du code JPA change (`mvn -q -f back-end/pom.xml compile`) ; relecture du SQL.

## Livrables

- La requête / la méthode repository / la vue, ou le script Flyway (montée + rollback).
- Une justification : index utilisés, choix de jointures, raison d'un éventuel SQL brut.
- Le cas échéant, mise à jour du schéma dans `architecture.md`.
- Compte-rendu de vérification.

## Critères de qualité

- Nommage PostgreSQL respecté ; types adaptés.
- Requêtes paramétrées (anti-injection) ; pas de `SELECT *` ; `JOIN` explicites.
- Colonnes de filtre/tri/jointure indexées ; pas de requête dans une boucle.
- Migrations Flyway idempotentes, nommées correctement, avec rollback ; aucun script commité modifié.
- Cohérence stricte avec le schéma réel des tables.
