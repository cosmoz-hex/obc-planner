---
name: code-review
description: Revue de code complète d'un changement Git — sur la branche en cours (diff local) ou sur une Pull Request identifiée par son numéro. La récupération du diff se fait uniquement via des commandes git en lecture seule. Utiliser quand l'utilisateur demande une revue de PR ou un code review.
---

# Skill : Revue de Code PR

## Déclenchement

Deux modes d'utilisation :

1. **Avec PR** : L'utilisateur fournit un numéro de PR (ex: `PR #42`, `review la PR 42`).
   Le diff est récupéré via `git fetch origin pull/{pr_id}/head` (voir étape 2).

2. **Sans PR (diff locale)** : Aucun numéro de PR n'est précisé. La review se fait sur le diff
   de la branche courante par rapport à la branche cible (branche par défaut du remote, ex. `main`).

## Procédure

### 1. Déterminer la branche cible (base de comparaison)

Toutes les récupérations de diff se font en local via git. Déterminer la branche cible :

```bash
git symbolic-ref --quiet refs/remotes/origin/HEAD
```

- Si elle renvoie une valeur (ex. `refs/remotes/origin/main`), en extraire la branche cible (`origin/main`).
- Sinon, essayer successivement : `origin/main`, `origin/master`, `main`, `master`.

Le remote reste utile uniquement pour `git fetch` en mode PR :

```bash
git remote get-url origin
```

### 2. Récupérer le diff à analyser

Le diff est récupéré **exclusivement via des commandes git en lecture seule** (aucun MCP externe). Déterminer d'abord la branche cible (base de comparaison) :

```bash
# Branche par défaut du remote (ex. origin/main) ; fallback sur main puis master
git symbolic-ref --quiet refs/remotes/origin/HEAD
# ou, si absent, essayer successivement : origin/main, origin/master, main, master
```

**Mode PR (numéro fourni) :**
- Récupérer la ref de la PR GitHub sans changer de branche :
  ```bash
  git fetch origin pull/{pr_id}/head:pr-{pr_id}
  ```
- Obtenir le diff complet de la PR par rapport à la branche cible :
  ```bash
  git --no-pager diff {branche_cible}...pr-{pr_id}
  ```
- Lister les fichiers modifiés :
  ```bash
  git --no-pager diff --name-only {branche_cible}...pr-{pr_id}
  ```
- Nettoyer la ref temporaire après la revue : `git branch -D pr-{pr_id}`.

> **Note :** si `git fetch origin pull/{pr_id}/head` échoue (remote non-GitHub, PR privée sans accès), signaler la limitation à l'utilisateur et proposer le mode diff locale.

**Mode diff locale (pas de PR précisée) :**
- Obtenir le diff : `git --no-pager diff {branche_cible}...HEAD`
- Lister les fichiers modifiés : `git --no-pager diff --name-only {branche_cible}...HEAD`

Dans les deux modes, les commentaires de revue sont **retournés directement dans le chat** (pas de commentaires inline).

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
