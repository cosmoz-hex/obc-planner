---
name: commit-message
description: Rédiger un message de commit conforme à la convention OBC Planner à partir d'un changement de code (diff, staged, ou PR). À utiliser pour produire un message concis, orienté fonctionnel, respectant le format type/scope/référence.
allowed-tools: Read, Grep, Glob, Shell
---

# Rédiger un message de commit

Produit un message de commit conforme à la convention Git du projet, dérivé de l'analyse du changement. Le skill **rédige le message** ; il ne crée pas le commit (sauf demande explicite de l'utilisateur).

## Quand l'utiliser

- Avant de committer un changement, pour formuler un message conforme.
- Pour normaliser un message existant non conforme.

## Références obligatoires

- `.kiro/steering/*-convention.md` — **convention de commit** (section Git) :
  ```
  {type}({scope}): {reference} - {title}

  {body}

  Ref: {reference}
  ```
  avec `type` ∈ `feat|fix|docs|style|refactor|perf|security`, `scope` = module/fonctionnalité impacté, `title` = phrase courte, `body` = description détaillée, `reference` = story/ticket (souvent le nom de branche).
- `.kiro/steering/architecture.md` / `.kiro/steering/product.md` — pour nommer correctement le `scope` (module/fonctionnalité).
- Le changement à décrire (idéalement via `git-diff`).

## Contrat d'entrée

```
CHANGEMENT   : <diff/PR ou fichiers modifiés/staged, idéalement sortie de git-diff>
RÉFÉRENCE    : <story/ticket, ex. story/S0002 ou nom de branche>
INTENTION    : <objectif fonctionnel du changement>
```

## Procédure

1. **Analyser le changement** : déterminer la nature dominante (fonctionnalité, correctif, doc, perf, sécurité, refactor, style) → `type`. Lire l'état via `git diff`/`git diff --staged`/`git status` (lecture seule).
2. **Déterminer le scope** : module ou fonctionnalité principale impacté (ex. `athletes`, `evaluations`, `programme`, `referentiel`, `securite`).
3. **Déduire la référence** : depuis l'entrée, ou depuis le nom de la branche courante (`git rev-parse --abbrev-ref HEAD`) si elle suit la convention (`story/S...`, `feature/F...`, `bugfix/B...`).
4. **Rédiger** :
   - `title` : phrase courte, orientée fonctionnel, à l'impératif, ≤ ~70 caractères.
   - `body` : le quoi et le pourquoi (pas le comment ligne à ligne), points clés du changement.
   - `Ref:` : la référence.
5. **Vérifier l'atomicité** : si le diff mélange plusieurs sujets (fourre-tout), le signaler et recommander de découper en plusieurs commits.
6. **Rendre le message** (bloc prêt à copier). Ne créer le commit **que** si l'utilisateur le demande explicitement ; privilégier alors le staging ciblé et signaler tout fichier de secrets.

## Livrables

- Le message de commit formaté selon la convention.
- Le cas échéant, l'alerte « changement non atomique » avec proposition de découpage.

## Critères de qualité

- Format respecté : `{type}({scope}): {reference} - {title}` + body + `Ref:`.
- `type` valide et cohérent avec la nature du changement ; `scope` pertinent ; `title` concis et fonctionnel.
- Message factuel, dérivé du diff réel (lecture seule, aucune opération git destructive).
- Aucun commit créé sans demande explicite ; secrets signalés le cas échéant.
