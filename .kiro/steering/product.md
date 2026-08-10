---
title: Functional Domain
inclusion: always
---

# Product — OBC Planner

Application de génération de plans d'entrainement d'haltérophilie personnalisés.

## Domaine métier

### Profils d'évaluation
- **Force/Vitesse** : `force` | `mixte` | `vitesse`
- **Technique** : `irrégulier` | `fiable` | `technicien`
- **Endurance** : `charge` | `mixte` | `volume`
- **Psychologie** : forces/faiblesses parmi 7 traits

**Archétypes résultants** : `mixte` | `bourrin` | `technicien` | `cyclique` | `apprentissage`

### Plans d'entrainement
Génération basée sur :
- Durée : 8/12/16 semaines
- Fréquence : 3/4/5 séances/semaine
- Durée séance : 1h30/2h00/2h30

Types de semaines : `foncier` | `technique` | `surcharge` | `affûtage` | `deload`

### Référentiel
- Exercices avec type et charge théorique
- Correctifs associés aux exercices
- Associations entre profil d'évaluation et archétype
- Trames types par archétype

## Contraintes métier
- Un athlète doit avoir une évaluation pour générer un plan
- Les charges calculées sont basées sur % de l'objectif et des charges théoriques
- Modification manuelle des plans possible avant la génération