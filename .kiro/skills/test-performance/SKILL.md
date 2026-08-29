---
name: test-performance
description: Écrire des tests de performance orientés volumétrie en JUnit pour le backend OBC Planner (temps de réponse, tenue en charge de données, requêtes coûteuses), avec jeux de données dédiés. À utiliser pour vérifier qu'un endpoint ou une requête tient face à un volume réaliste.
allowed-tools: Read, Write, Edit, Grep, Glob, CodeIntelligence, Shell
---

# Tests de performance (JUnit, orientés volumétrie)

Écrit des tests de performance en JUnit — non pas fonctionnels mais orientés **volumétrie et coût** : jeux de données massifs, temps de réponse, détection de requêtes N+1/en boucle, budgets de latence. Réutilise la stack de test JUnit existante (pas de nouvel outil sans validation).

## Approche retenue

- Outil : **JUnit 5** (mêmes dépendances que `test-api` : webmvc-test + flyway-test), pas de Gatling/JMeter sauf validation explicite.
- Principe : injecter un **volume de données réaliste** (via scripts dans `back-end/src/test/resources/data/`), exécuter l'opération, mesurer (durée, nombre de requêtes) et asserter contre un **budget** défini.

## Emplacement des données de test

- Jeux de données volumétriques : `back-end/src/test/resources/data/perf/` (scripts SQL générant/insérant de gros volumes), versionnés et maintenus.

## Quand l'utiliser

- Pour valider qu'un endpoint listé/paginé tient face à un grand nombre de lignes.
- Pour détecter des régressions de performance (N+1, requêtes en boucle) sur une opération critique.

## Références obligatoires

- `.kiro/steering/*-convention.md` — attentes performance : pagination, index, pas de requête en boucle, `EXISTS`>`IN`, LAZY ; budgets à confronter.
- `.kiro/steering/architecture.md` — schéma des tables (volumétrie, index) et endpoints concernés.
- `back-end/pom.xml` — dépendances de test disponibles.
- Résultats du skill `check-performance` si un problème a déjà été pointé.

## Contrat d'entrée

```
CIBLE       : <endpoint / requête / service à éprouver>
VOLUMÉTRIE  : <nombre de lignes / charge à simuler>
BUDGET      : <seuil de latence et/ou nb max de requêtes acceptable>
```

## Procédure

1. **Définir le budget** : latence max et/ou nombre de requêtes SQL max pour l'opération, selon la volumétrie cible.
2. **Générer les données** : script(s) sous `src/test/resources/data/perf/` insérant le volume voulu ; appliqués via Flyway de test/`@Sql`.
3. **Mesurer** : exécuter l'opération dans un test JUnit ; mesurer la durée ; le cas échéant, compter les requêtes SQL (ex. compteur Hibernate statistics / proxy datasource) pour détecter N+1.
4. **Asserter** contre le budget ; faire échouer le test si dépassement.
5. **Isoler** : test idempotent, données réinitialisées, indépendant de l'ordre. Marquer les tests lourds (ex. `@Tag("perf")`) pour les exécuter à la demande.
6. **Exécuter** : `mvn -q -f back-end/pom.xml test -Dgroups=perf` (ou équivalent). Documenter les mesures obtenues.

## Livrables

- Les classes de test de performance JUnit (taguées `perf`).
- Les scripts de données volumétriques sous `src/test/resources/data/perf/`.
- Un rapport : budget visé, mesures obtenues, N+1/anti-patterns détectés, verdict.

## Critères de qualité

- Tests orientés volumétrie/coût, avec budget explicite et assertion de dépassement.
- Réutilisent la stack JUnit existante ; aucun outil externe non validé.
- Données volumétriques isolées et versionnées ; tests idempotents et tagués.
- Détection effective des N+1 / requêtes en boucle quand pertinent.
