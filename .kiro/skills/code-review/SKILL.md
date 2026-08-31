---
name: code-review
description: Revue de code complète d'une Pull Request Bitbucket sur n'importe quel repository Git ou sur la branche en cours. Utiliser quand l'utilisateur demande une revue de PR ou un code review.
---

# Skill : Revue de Code PR

## Déclenchement

Deux modes d'utilisation :

1. **Avec PR** : L'utilisateur fournit un numéro de PR (ex: `PR #42`, `review la PR 42`).
   Dans le cas d'une URL, le `owner` et le `repo` sont extraits directement de l'URL.

2. **Sans PR (diff locale)** : Aucun numéro de PR n'est précisé. La review se fait sur le diff
   de la branche courante par rapport à la branche cible (develop ou master).
   Utiliser `git --no-pager diff develop...HEAD` (ou `master...HEAD`) pour obtenir le diff.

## Procédure

### 1. Identifier le projet et le repository

Exécuter la commande suivante pour récupérer l'URL du remote origin :

```bash
git remote get-url origin
```

Parser l'URL pour extraire le **owner** et le **repo** :
- Format HTTPS : `https://github.com/{owner}/{repo}.git`

Exemples :
- `https://github.com/cosmoz-hex/obc-planner.git` → owner=`cosmoz-hex`, repo=`obc-planner`

### 2. Récupérer le diff à analyser

**Mode PR (numéro ou URL fourni) :**
- Utiliser `get_pull_request` avec le `project_key` et `repo_slug` détectés, et le `pr_id` fourni
- Utiliser `get_pull_request_diff` pour obtenir le diff complet
- Utiliser `get_pull_request_changed_files` pour la liste des fichiers modifiés

> **⚠️ Limitation :** Pour les grosses PR, le diff retourné par l'API Bitbucket est paginé. Si la PR contient beaucoup de fichiers modifiés, plusieurs appels successifs à `get_pull_request_diff` avec le paramètre `path` sur chaque fichier peuvent être nécessaires pour couvrir l'ensemble des changements.

**Mode diff locale (pas de PR précisée) :**
- Déterminer la branche cible : `git symbolic-ref refs/remotes/origin/HEAD` ou essayer `develop` puis `master`
- Obtenir le diff : `git --no-pager diff {branche_cible}...HEAD`
- Lister les fichiers modifiés : `git --no-pager diff --name-only {branche_cible}...HEAD`
- Les commentaires de review sont retournés directement dans le chat (pas de commentaires inline possibles sans PR)

### 3. Analyser le code selon les axes suivants

#### 📏 Respect des normes du projet

> Se référer aux fichiers de référence dans le dossier `/.kiro/steering` pour connaître les normes du projet.

| Fichiers touchés | Référence à lire                                          |
|---|-----------------------------------------------------------|
| `*.java`, `pom.xml`, code backend | `spring-conventions.md`                    |
| `*.ts`, `*.html`, `*.css`, `*.scss`, code Angular | `angular-convention.md`, `accessiblity-convention.md` |
| `*.java`, `*.sql`, `database/script/**`, requêtes SQL dans du Java ou scripts de montée de version | `postgre-convention.md`                         |

> Ne charger que les références pertinentes pour la PR en cours. Si la PR ne touche que du TypeScript, inutile de lire les normes Java/SQL.

#### 🔒 Sécurité
- Injection (SQL, XSS, template injection)
- Exposition de données sensibles (tokens, secrets, PII)
- Validation des entrées utilisateur
- Gestion des autorisations et authentification
- Dépendances vulnérables

#### ⚡ Performance
- Requêtes N+1 ou appels HTTP en boucle
- Fuites mémoire (subscriptions non unsubscribe, listeners non détachés)
- Chargement inutile de données
- Optimisation du change detection Angular (OnPush, trackBy)
- Taille des bundles (imports lourds)

#### 🛡️ Non-régression
- Effets de bord sur le code existant
- Contrats d'interface modifiés (inputs/outputs de composants, API)
- Suppression ou renommage de fonctions/classes utilisées ailleurs
- Cohérence avec les tests existants

#### ♿ Accessibilité
- Attributs ARIA manquants ou incorrects
- Labels des formulaires
- Navigation clavier
- Contraste et taille des éléments interactifs
- Usage correct des composants Waypoint (slots, props d'accessibilité)

#### 🧹 Maintenabilité
- Lisibilité et clarté du code
- Duplication de code
- Responsabilité unique des fonctions/composants
- Nommage cohérent (conventions du projet)
- Documentation manquante sur le code complexe
- Complexité cyclomatique et nombre de paramètres

#### 📦 Architecture (cf `architecture.md`)
- Respect du découpage pages / components / services
- Pas de logique métier dans les composants (déléguer aux services)
- Bonne utilisation des resolvers, guards et interceptors

### 4. Format de sortie

Structurer le résultat ainsi :

```
# Résumé de la PR

## Verdict global
[✅ Approuvée | ⚠️ Approuvée avec remarques | ❌ Changements requis]

## Analyse détaillée

### 🔒 Sécurité
[Constats + suggestions]

### ⚡ Performance
[Constats + suggestions]

### 🛡️ Non-régression
[Constats + suggestions]

### ♿ Accessibilité
[Constats + suggestions]

### 🧹 Maintenabilité
[Constats + suggestions]

### 📏 Normes du projet
[Constats + suggestions]

### 🧪 Tests
[Constats + suggestions]

### 📦 Architecture
[Constats + suggestions]

## Actions requises
[Liste numérotée des corrections à apporter, classées par priorité]
```

Pour chaque constat négatif, fournir :
- Le fichier et la ligne concernés
- Le problème identifié
- Une suggestion de correction avec un extrait de code si pertinent
