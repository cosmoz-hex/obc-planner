---
name: commit-message
description: "Rédiger un message de commit conforme à la convention OBC Planner à partir d'un changement de code (diff, staged, ou PR). Sortie silencieuse : uniquement le bloc de message, sans analyse ni commentaire."
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

L'analyse est menée **en interne**, sans la restituer à l'utilisateur.

1. **Analyser le changement** : déterminer la nature dominante (fonctionnalité, correctif, doc, perf, sécurité, refactor, style) → `type`. Lire l'état via `git diff`/`git diff --staged`/`git status` (lecture seule).
2. **Déterminer le scope** : module ou fonctionnalité principale impacté (ex. `athletes`, `evaluations`, `programme`, `referentiel`, `securite`).
3. **Déduire la référence** : depuis l'entrée, ou depuis le nom de la branche courante (`git rev-parse --abbrev-ref HEAD`) si elle suit la convention (`story/S...`, `feature/F...`, `bugfix/B...`).
4. **Rédiger** :
   - `title` : phrase courte, orientée fonctionnel, à l'impératif, ≤ ~70 caractères.
   - `body` : le quoi et le pourquoi (pas le comment ligne à ligne), points clés du changement.
   - `Ref:` : la référence.
5. **Vérifier l'atomicité** : en interne. Signaler un diff fourre-tout **uniquement** si le cas se présente (une seule ligne d'alerte).
6. **Rendre le message** : sortir **uniquement** le bloc de message, prêt à copier. Ne créer le commit **que** si l'utilisateur le demande explicitement.

## Format de sortie

- Sortir **exclusivement** le bloc de message de commit (dans un bloc de code), sans phrase d'introduction, sans résumé de l'analyse, sans liste de fichiers, sans conclusion.
- Exceptions, à ajouter en **une seule ligne** sous le bloc, seulement si applicable :
  - `⚠ Changement non atomique : <proposition de découpage>`
  - `⚠ Secret détecté : <fichier>`

## Livrables

- Le bloc de message de commit formaté selon la convention. Rien d'autre (hors alertes ci-dessus).

## Critères de qualité

- Format respecté : `{type}({scope}): {reference} - {title}` + body + `Ref:`.
- `type` valide et cohérent avec la nature du changement ; `scope` pertinent ; `title` concis et fonctionnel.
- Message factuel, dérivé du diff réel (lecture seule, aucune opération git destructive).
- Sortie silencieuse : aucun commentaire d'analyse, seul le message (et les alertes éventuelles).
- Aucun commit créé sans demande explicite.
