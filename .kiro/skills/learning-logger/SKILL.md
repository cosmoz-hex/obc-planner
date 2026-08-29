---
name: learning-logger
description: Ajouter une leçon apprise dans .kiro/steering/learning.md quand une correction, une erreur de jugement ou un écart aux bonnes pratiques a été identifié dans OBC Planner. À utiliser après une correction demandée par l'utilisateur pour ne jamais reproduire la même erreur.
allowed-tools: Read, Edit, Write
---

# Consigner un apprentissage

Capitalise une connaissance acquise en l'ajoutant au journal `learning.md`, sous forme d'entrée courte, factuelle et actionnable. Le skill ne modifie que le fichier de learning.

## Quand l'utiliser

- Après une correction demandée par l'utilisateur sur un choix technique ou un pattern proposé.
- Après une erreur de jugement ou un écart constaté par rapport aux bonnes pratiques du projet.
- Quand une subtilité métier (données, calcul) a été mal interprétée puis clarifiée.

## Références obligatoires

- `.kiro/steering/learning.md` — **fichier cible** : format et entrées existantes à respecter (titre daté, Contexte / Erreur initiale / Bonne pratique).
- `.kiro/steering/*-convention.md` — pour rattacher la leçon à une bonne pratique existante ou signaler un manque.
- `.kiro/steering/product.md` — pour le vocabulaire métier si la leçon est fonctionnelle.

## Contrat d'entrée

```
CONTEXTE        : <situation, tâche, zone concernée>
ERREUR / ÉCART  : <ce qui a été fait de mauvais ou de non conforme>
CORRECTION      : <la bonne pratique / bonne interprétation retenue>
DATE            : <optionnel : sinon date du jour>
```

## Procédure

1. **Lire `learning.md`** pour respecter le format exact et éviter les doublons.
2. **Vérifier la pertinence** : la leçon doit être généralisable et utile pour l'avenir (pas une note ponctuelle sans valeur).
3. **Rédiger l'entrée** sous le format existant :
   - Titre : `### {AAAA-MM-JJ} — {sujet court}`
   - `**Contexte**` : le cas rencontré, factuel.
   - `**Erreur initiale**` : ce qui avait été fait.
   - `**Bonne pratique**` : la règle à appliquer désormais.
4. **Ajouter** l'entrée à la suite des leçons existantes, sans réécrire les précédentes.
5. **Vérifier** que le fichier reste bien structuré (Markdown valide, ordre chronologique cohérent).

## Livrables

- L'entrée ajoutée à `.kiro/steering/learning.md`.
- Confirmation du titre et du contenu ajoutés.

## Critères de qualité

- Entrée courte, factuelle, actionnable ; format identique aux entrées existantes.
- Pas de doublon avec une leçon déjà présente.
- Les entrées antérieures sont préservées telles quelles.
- Seul `learning.md` est modifié.
