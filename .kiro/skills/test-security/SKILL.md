---
name: test-security
description: Écrire des tests de sécurité orientés attaque en JUnit pour le backend OBC Planner (injections, contournement d'authentification/autorisation, fuites d'information, JWT falsifié). À utiliser pour vérifier qu'un endpoint résiste aux abus, au-delà du fonctionnel nominal.
allowed-tools: Read, Write, Edit, Grep, Glob, CodeIntelligence, Shell
---

# Tests de sécurité (JUnit, orientés attaque)

Écrit des tests JUnit qui simulent des **abus** plutôt que l'usage nominal : entrées malveillantes, accès non autorisé, jetons falsifiés, tentatives d'injection. Réutilise la stack de test JUnit existante.

## Approche retenue

- Outil : **JUnit 5** + MockMvc (webmvc-test) et flyway-test, comme `test-api`. Pas d'outil externe (ZAP, etc.) sans validation explicite.
- Principe : envoyer des requêtes hostiles à l'API et **asserter le bon rejet** (statut, absence de fuite, données intactes).

## Emplacement des données de test

- Jeux de données dédiés : `back-end/src/test/resources/data/` (réutiliser ceux des tests API quand pertinent), versionnés.

## Quand l'utiliser

- Pour éprouver un endpoint sur les axes injection / authz / authn / fuite d'info.
- Pour verrouiller une correction de faille par un test de non-régression sécurité.

## Références obligatoires

- `.kiro/steering/*-convention.md` — exigences sécurité : requêtes préparées anti-injection, JWT (validation, pas de données sensibles), sécurité au bon niveau, erreurs structurées sans stack trace, contrôle d'accès.
- `.kiro/steering/architecture.md` — `configuration/`, `filter/`, `interceptor/`, `annotations/`, endpoints protégés.
- `README.md` — modèle des secrets et de l'auth (`ENABLE_AUTH`, `JWT_*`).
- Résultats du skill `check-security` si une faille a déjà été pointée.

## Contrat d'entrée

```
CIBLE        : <endpoint / filtre / contrôle d'accès à éprouver>
VECTEURS     : <axes d'attaque : injection, authz, authn, fuite, JWT>
ATTENDU      : <comportement de rejet attendu>
```

## Procédure

1. **Cartographier la surface** : entrées de l'endpoint, exigences d'auth/authz, données sensibles manipulées.
2. **Injection** : envoyer des payloads d'injection SQL/entrées malformées et asserter l'absence d'effet (données intactes, rejet propre) — confirme l'usage de requêtes paramétrées.
3. **Authentification** : requête sans token / token expiré / **JWT falsifié ou re-signé** → asserter 401/403, pas d'accès.
4. **Autorisation** : utilisateur/rôle non habilité → asserter le refus ; vérifier l'absence de contournement.
5. **Fuite d'information** : provoquer une erreur et asserter qu'aucune stack trace ni détail interne n'est renvoyé ; format d'erreur structuré respecté.
6. **Isolation** : tests idempotents (rollback/Flyway de test), indépendants de l'ordre ; ne jamais logguer de secret en clair.
7. **Exécuter** : `mvn -q -f back-end/pom.xml test`. Corriger jusqu'au vert.

## Livrables

- Les classes de test de sécurité JUnit (nommées explicitement, ex. `...SecurityTest`).
- Les jeux de données associés sous `src/test/resources/data/`.
- Un rapport : vecteurs testés, comportements de rejet vérifiés, verdict.

## Critères de qualité

- Tests orientés attaque : chaque vecteur (injection, authn, authz, fuite, JWT) donne lieu à une assertion de rejet.
- Réutilisent la stack JUnit existante ; aucun outil externe non validé.
- Aucune valeur de secret exposée dans le code ou les logs de test.
- Tests idempotents et indépendants de l'ordre ; `mvn test` passe.
