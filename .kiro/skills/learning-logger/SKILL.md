---
name: learning-logger
description: Ajouter une leçon apprise dans .kiro/steering/learning.md quand une correction, une erreur de jugement ou un écart aux bonnes pratiques a été identifié dans OBC Planner. À utiliser après une correction demandée par l'utilisateur pour ne jamais reproduire la même erreur.
---

# Consigner un apprentissage

Ajoute une entrée **courte** à `.kiro/steering/learning.md`. Ce fichier est en `inclusion: manual` (chargé uniquement si référencé par le développeur/l'orchestrator) : il doit rester léger. Ne modifie que les fichiers de learning.

## Quand l'utiliser

- Après une correction demandée par l'utilisateur sur un choix technique ou un pattern.
- Après une erreur de jugement ou un écart aux bonnes pratiques.
- Quand une subtilité métier a été mal interprétée puis clarifiée.

## Contrat d'entrée

```
CONTEXTE        : <situation, zone concernée>
ERREUR / ÉCART  : <ce qui était non conforme>
CORRECTION      : <bonne pratique retenue>
DATE            : <optionnel : sinon date du jour>
```

## Procédure

1. **Chercher** dans `learning.md` (grep sur des mots-clés) pour éviter un doublon ; n'en lire que la section thématique visée.
2. **Vérifier la pertinence** : leçon généralisable, pas une note ponctuelle.
3. **Rédiger** : `### AAAA-MM-JJ — sujet court`, puis **2 à 4 lignes max** : règle à retenir + cause en une phrase, avec commandes/identifiants essentiels en `code`. Pas de récit.
4. **Ranger** l'entrée dans la bonne section : Process/Build, Backend/Java, Base de données/SQL, Frontend Angular/WebAwesome, Moteur de génération / Protocoles (créer une section seulement si aucune ne convient).
5. **Détail éventuel** (contexte long, étapes de diagnostic) : l'ajouter dans `.kiro/archive/learning-full.md`, jamais dans `learning.md`.
6. Ne pas réécrire les entrées existantes ; vérifier Markdown valide et UTF-8 sans caractères corrompus.

## Livrables

- Entrée ajoutée à `learning.md` (+ détail éventuel dans l'archive) ; confirmation du titre et de la section.

## Critères de qualité

- Entrée de 2 à 4 lignes, actionnable, sans doublon, dans la bonne section.
- Seuls `learning.md` et `.kiro/archive/learning-full.md` sont modifiés.
