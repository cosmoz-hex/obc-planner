---
name: development
description: Implémentation de code à partir d'un plan technique. Développe, teste, commite et pousse. Utilisé par l'agent Kiro Developer.
---

# Skill : Développement

## Déclenchement

Reçoit un plan technique (produit par l'agent Analyste) ou des instructions de l'utilisateur.

**Si invoqué sans plan technique** : demander à l'utilisateur de fournir au minimum :
- Une description des changements attendus
- Les contraintes de validations et les cas limites

Puis procéder avec ces informations comme plan minimal.

## Procédure

### 1. Préparation

1. Comprendre le besoin
2. Si certains éléments sont flous ou manquants,  ne pas prendre d'initiative et demander des informations supplémentaires
3. Utiliser le skill `.kiro/skills/code-explorer` pour identifier les éléments qui existent déjà et trouver des exemples

### 2. Implémentation

1. Charger les conventions applicables selon le scope technique :
    - Si backend Java : lire `.kiro/steering/spring-convention.md`
    - Si frontend Angular : lire `angular-convention.md`, `accessiblity-convention.md`
    - Si SQL (script ou Java) : lire `postgre-convention.md`
    - Pour la compréhension métier : lire `product.md`
    - Pour l'architecture code/database : lire `architecture.md`
3. Implémenter dans cet ordre :
    - **Database** : scripts de migration Postgre (up puis down) — ré-entrants (idempotent), requêtes complexes appelées dans le Java
        - Utiliser le skill `.kiro/skills/sql-writer`
    - **Backend** : entities → repositories → services → controllers
        - Utiliser le skill `.kiro/skills/api-builder`
    - **Frontend** : model → services → composants → pages → routing
        - Utiliser le skill `.kiro/skills/ui-generator`
4. Respecter les conventions chargées ET les patterns observés dans les implémentations de référence du plan

### 3. Build et validation

1. Exécuter le build complet :
   ```bash
   # Java
   mvn compile -pl module-concerné

   # Angular
   npm run build
   ```
2. Vérifier le lint si disponible :
   ```bash
   npm run lint
   ```
3. Corriger les erreurs de compilation et de lint

### 4. Corrections post-review

Si l'agent Reviewer renvoie des corrections à faire :

1. Lire les commentaires de review
2. Appliquer les corrections demandées
3. Relancer le build
4. Relancer la review

## Règles

- Ne jamais modifier de fichiers hors du scope du plan technique
- Ne jamais commiter directement
- Si le build échoue après 3 tentatives de correction, s'arrêter et remonter le problème
- **Respecter les design patterns existants** : avant de coder, lire les implémentations de référence fournies dans le plan et reproduire les mêmes patterns (architecture, nommage, structure des classes, gestion d'erreur)
- **Garder un code clair et lisible** : noms explicites, méthodes courtes à responsabilité unique, pas de logique imbriquée complexe, commentaires sur les parties non triviales
- Ne pas introduire de nouveau pattern ou nouvelle librairie si un équivalent existe déjà dans le projet
