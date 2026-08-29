---
name: check-regressions
description: Vérifier qu'un changement de code dans OBC Planner n'introduit pas de régression fonctionnelle, en confrontant le comportement modifié aux règles métier et aux fonctionnalités existantes. À utiliser en revue pour évaluer les impacts sur l'existant.
allowed-tools: Read, Grep, Glob, CodeIntelligence, Shell
---

# Contrôler les régressions fonctionnelles

Évalue si un changement casse ou altère un comportement existant, en s'appuyant sur les règles métier du produit et sur le code impacté. Le skill **analyse et alerte** ; il ne corrige pas.

## Quand l'utiliser

- Pendant une revue, après `git-diff`, sur les fichiers touchant une fonctionnalité existante.
- Quand un changement modifie un service, un contrat d'API, un calcul ou une migration.

## Références obligatoires

- `.kiro/steering/product.md` — **règles fonctionnelles de référence** (athlètes, évaluations, archétypes, programmation, référentiel) et interdits (ex. pas de suppression d'évaluation liée à un programme).
- `.kiro/steering/architecture.md` — dépendances entre couches/modules/tables pour tracer la propagation d'un changement.
- `.kiro/steering/*-convention.md` — contrats attendus (DTOs, gestion d'erreurs).
- Le code appelant les éléments modifiés (usages, tests existants).

## Contrat d'entrée

```
CHANGEMENT     : <diff/PR ou fichiers modifiés, idéalement sortie de git-diff>
FONCTIONNALITÉS: <fonctionnalités potentiellement impactées>
INTENTION      : <ce que le changement est censé faire>
```

## Procédure

1. **Identifier les comportements impactés** : lister les fonctionnalités et règles de gestion touchées directement ou indirectement.
2. **Tracer les usages** : retrouver tous les appelants des méthodes/contrats/tables modifiés (risque de casse en chaîne).
3. **Confronter aux règles métier** de `product.md` : le nouveau comportement respecte-t-il toujours les invariants et interdits ?
4. **Analyser les migrations** : perte de données possible ? contraintes cassées ? rollback fourni ?
5. **Vérifier la couverture** : des tests existants couvrent-ils la zone ? Sinon, recommander des scénarios (via skills de test).
6. **Statuer** : lister les régressions probables (bloquantes) et les risques (à confirmer), chacun avec preuve (fichier/ligne) et impact.

## Livrables

- **Verdict** : OK / risques / régressions bloquantes.
- **Liste des régressions et risques** : description, preuve (fichier:ligne), fonctionnalité impactée, sévérité.
- **Scénarios de non-régression recommandés**.

## Critères de qualité

- Chaque régression/risque est justifié par une preuve traçable.
- Les règles de gestion de `product.md` sont explicitement confrontées.
- La propagation via les appelants est analysée, pas seulement le fichier modifié.
- Les migrations sont évaluées pour perte de données et rollback.
- Aucune modification de code.
