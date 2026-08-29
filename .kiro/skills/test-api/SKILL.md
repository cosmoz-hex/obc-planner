---
name: test-api
description: Écrire des tests d'API backend idempotents en JUnit pour OBC Planner (Spring Boot 4.1, MockMvc, Flyway de test), avec des jeux de données maintenus dans un emplacement dédié. À utiliser pour couvrir un endpoint REST par des tests reproductibles et indépendants de l'état de la base.
allowed-tools: Read, Write, Edit, Grep, Glob, CodeIntelligence, Shell
---

# Tests d'API en JUnit (idempotents)

Écrit des tests d'intégration/API JUnit pour les endpoints backend, reproductibles et indépendants de l'ordre d'exécution et de l'état préalable de la base. S'appuie sur les dépendances de test **déjà présentes** dans le projet.

## Stack de test du projet (vérifiée dans `back-end/pom.xml`)

- `spring-boot-starter-webmvc-test` (JUnit 5 + MockMvc) — pour tester les controllers/API.
- `spring-boot-starter-flyway-test` — pour appliquer/réinitialiser le schéma et les données de test.
- **Pas de Testcontainers** dans le projet : ne pas l'introduire sans validation explicite.

## Emplacement des données de test (convention imposée)

- Scripts SQL de jeu de données : `back-end/src/test/resources/data/` (chargés via `@Sql` ou callbacks Flyway de test), maintenus et versionnés.
- Configuration de test : `back-end/src/test/resources/application-test.properties` si nécessaire (profil `test`).

## Quand l'utiliser

- Pour couvrir un endpoint REST (nouveau ou modifié) par des tests automatisés.
- Pour verrouiller une correction de bug backend par un test de non-régression.

## Références obligatoires

- `.kiro/steering/*-convention.md` — contrats attendus (DTOs, format d'erreur, sécurité, pagination) à asserter.
- `.kiro/steering/architecture.md` — endpoints, DTOs, entités, schéma des tables.
- `.kiro/steering/product.md` — règles métier et interdits à vérifier.
- `back-end/pom.xml` — dépendances de test disponibles (ne pas en ajouter sans raison).
- Scénarios issus de `test-case` si disponibles.

## Contrat d'entrée

```
ENDPOINT / SERVICE : <API ou service à tester>
SCÉNARIOS          : <cas nominaux/limites/erreurs, idéalement de test-case>
DONNÉES            : <jeu de données requis>
```

## Procédure

1. **Choisir le périmètre** : test de tranche web (`@WebMvcTest` + service mocké) pour la couche API isolée, ou test d'intégration (`@SpringBootTest` + MockMvc + Flyway de test) pour le bout en bout avec base.
2. **Préparer les données** : script(s) dans `back-end/src/test/resources/data/`, appliqués via `@Sql`/Flyway de test. Chaque test part d'un état connu.
3. **Garantir l'idempotence** : `@Transactional` avec rollback automatique **ou** réinitialisation Flyway entre tests ; aucun test ne dépend d'un autre ni de l'ordre ; pas d'état résiduel.
4. **Écrire les cas** : nominaux, limites, erreurs (statuts HTTP, corps d'erreur structuré), autorisations. Asserter le contrat (statut, structure de réponse, valeurs).
5. **Nommer** clairement (`should_...` / `given_when_then`) ; placer les tests sous `back-end/src/test/java/com/example/backend/...` en miroir du package testé.
6. **Exécuter** : `mvn -q -f back-end/pom.xml test` (ou `-Dtest=<Classe>`). Les tests doivent passer de façon répétée et dans n'importe quel ordre.

## Livrables

- Les classes de test JUnit sous `src/test/java/...`.
- Les scripts de données sous `src/test/resources/data/` (et config `application-test.properties` si créée).
- Résultat d'exécution (`mvn test`) et couverture des scénarios.

## Critères de qualité

- Tests **idempotents** : réexécutables sans nettoyage manuel, indépendants de l'ordre.
- Utilisent uniquement les dépendances de test présentes (webmvc-test, flyway-test) ; pas de Testcontainers non validé.
- Données isolées dans `src/test/resources/data/`.
- Cas nominaux, limites et erreurs couverts ; contrat d'API et interdits métier assertés.
- `mvn test` passe.
