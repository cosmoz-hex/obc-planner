---
name: check-accessibility
description: Vérifier l'accessibilité d'un changement d'interface Angular dans OBC Planner (labels, ARIA, navigation clavier, focus, contrastes, tabindex). À utiliser en revue sur tout changement touchant des composants ou templates frontend.
allowed-tools: Read, Grep, Glob, CodeIntelligence
---

# Contrôler l'accessibilité

Analyse un changement d'interface pour détecter les écarts aux règles d'accessibilité du projet. Le skill **détecte et recommande** ; il ne corrige pas.

## Quand l'utiliser

- En revue, sur tout changement touchant des composants/templates Angular (`.html`, `.ts` de composants).
- Après `git-diff` quand des fichiers frontend d'UI sont modifiés.

## Références obligatoires

- `.kiro/steering/angular-convention.md` — section Accessibilité : labels associés (`for`/`id`/`aria-label`/`label`), balises et rôles ARIA appropriés, respect de l'ordre du DOM pour le clavier, contrastes suffisants, information jamais portée uniquement par la couleur, `tabindex` 0 ou -1 uniquement, focus remis sur l'élément déclencheur à la fermeture d'une modale/dropdown, pas d'ajout/suppression de champs avant le champ focus dans un formulaire dynamique, `<wa-tooltip>` plutôt que `title`.
- `.kiro/steering/architecture.md` — modules frontend concernés.
- Composants WebAwesome (`front-end/node_modules/@awesome.me/webawesome/dist/skills/webawesome/SKILL.md`) pour l'usage accessible des `<wa-*>`.

## Contrat d'entrée

```
CHANGEMENT   : <diff/PR ou composants/templates modifiés>
CONTEXTE     : <optionnel : type d'écran, formulaire, modale>
```

## Procédure

1. **Champs de formulaire** : chaque champ a-t-il un label associé (`for`/`id`) ou `aria-label` ?
2. **Sémantique / ARIA** : balises et rôles corrects ; structure de titres cohérente.
3. **Navigation clavier** : ordre du DOM logique ; `tabindex` limité à 0/-1 (aucun positif) ; éléments interactifs atteignables.
4. **Focus** : à la fermeture d'une modale/dropdown, le focus revient-il au déclencheur ? les formulaires dynamiques ne déplacent-ils pas le focus (pas d'ajout/suppression de champs avant le champ courant) ?
5. **Couleur & contraste** : information non portée uniquement par la couleur ; contrastes suffisants.
6. **Tooltips** : usage de `<wa-tooltip>` plutôt que l'attribut `title`.
7. **Statuer** : lister les écarts par sévérité, avec preuve et correction recommandée.

## Livrables

- **Verdict accessibilité** : conforme / écarts / bloquants.
- **Liste des écarts** : règle enfreinte, preuve (fichier:ligne), sévérité, correction recommandée.

## Critères de qualité

- Chaque écart est rattaché à une règle précise de `angular-convention.md` avec preuve traçable.
- Labels, ARIA, clavier, focus, contraste et tabindex sont tous vérifiés.
- Aucune modification de code.
