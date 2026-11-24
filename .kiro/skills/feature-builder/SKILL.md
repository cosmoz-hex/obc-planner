---
name: feature-builder
description: Implémentation de code à partir d'un plan technique. Développe, teste, vérifie le build. Ne commite ni ne pousse jamais sans demande explicite. Utilisé par l'agent développeur ; porte la procédure Build de référence.
---

# Skill : Développement

## Déclenchement

Reçoit un plan technique (spec produite par l'analyste) ou des instructions de l'utilisateur.

**Si invoqué sans plan technique** : demander au minimum une description des changements attendus, les contraintes de validation et les cas limites, puis procéder avec ces informations comme plan minimal.

## Procédure

### 1. Préparation

1. Comprendre le besoin. Si des éléments sont flous ou manquants, ne pas prendre d'initiative : demander.
2. Utiliser `.kiro/skills/code-explorer` pour identifier l'existant et trouver des exemples.

### 2. Implémentation

1. Ne charger que les conventions de la couche touchée (lecture ciblée) :
    - Java : `spring-convention.md` ; Angular : `angular-convention.md`, `accessiblity-convention.md` ; SQL : `postgre-convention.md`
    - API existantes / DTOs : `architecture-api.md` ; schéma des tables : `architecture-db.md` (grep de la section utile)
2. Implémenter dans cet ordre, en déléguant au skill de couche :
    - **Database** : migrations Postgres (up puis down), idempotentes → `sql-writer`
    - **Backend** : entities → repositories → services → controllers → `api-builder`
    - **Frontend** : model → services → composants → pages → routing → `ui-generator`
3. Respecter les conventions ET les patterns des implémentations de référence du plan.

### 3. Build (procédure de référence, écrite ici une seule fois)

Les autres skills et agents renvoient à cette section.

**Backend** (depuis `back-end/`) :
1. Vérifier le JDK : `java -version` / `Get-ChildItem 'C:\Program Files\Java'`. Le projet cible JDK 25.
2. `cmd /c ".\mvnw.cmd -q compile > build-out.txt 2>&1 & echo DONE_%ERRORLEVEL%"` (le préfixe `.\` est obligatoire).
3. **Lire `build-out.txt`** (chercher `[ERROR]` et `release version`) : `DONE_x` est l'ERRORLEVEL de `echo`, pas l'état du build. Le fichier n'est pas toujours en UTF-8 : s'appuyer sur la présence de `[ERROR]`.
4. JDK 25 absent → compilation non exécutable dans l'environnement : revue statique documentée, ne pas modifier `pom.xml`.

**Frontend** (depuis `front-end/`) : `cmd /c "npm run build > build-out.txt 2>&1 & echo DONE_%ERRORLEVEL%"`, puis lire `build-out.txt`. Un build vert ne détecte pas les erreurs d'injection runtime (ex. NG0201).

Supprimer `build-out.txt` ensuite. Lint si disponible (`npm run lint`). Signaler explicitement ce qui n'a pas pu être vérifié.

### 4. Corrections post-review

Lire les commentaires du reviewer, appliquer les corrections demandées, relancer le build.

## Règles

- Ne jamais modifier de fichiers hors du scope du plan technique.
- **Ne jamais commiter ni pousser** sans demande explicite de l'utilisateur.
- Si le build échoue après 3 tentatives de correction, s'arrêter et remonter le problème.
- Respecter les design patterns existants ; ne pas introduire de nouveau pattern ou de nouvelle librairie si un équivalent existe.
- Code clair : noms explicites, méthodes courtes à responsabilité unique, commentaires sur les parties non triviales.
