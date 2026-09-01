---
name: prompt-engineer
description: "
    Transformer une phrase simple et un peu de contexte en un prompt structuré, complet et réutilisable, 
    destiné à un autre agent ou skill d'OBC Planner. 
    À utiliser quand on veut « fabriquer un beau prompt » à partir d'une intention floue : 
    le skill pose autant de questions que nécessaire, puis fige un prompt final prêt à copier-coller.
"
allowed-tools: Read, Grep, Glob
---

# Fabriquer un prompt

Prend une intention exprimée en une phrase (avec un peu de contexte) et la transforme en un **prompt final structuré et complet**, 
directement utilisable par un autre agent ou skill du projet. Le skill **pose des questions de clarification en boucle** tant que 
des éléments manquent, puis **livre un prompt prêt à l'emploi**. 
Il ne produit qu'un texte de prompt — il ne modifie aucun code ni fichier.

## Quand l'utiliser

- Quand on a une idée en tête mais qu'on veut la formuler proprement pour un agent/skill.
- Quand un prompt existant donne de mauvais résultats et qu'il faut le restructurer.
- Pour standardiser la façon de solliciter les agents du projet (Analyste, Développeur, Reviewer, Documentaliste) ou les skills.
- Avant de lancer une tâche longue, pour cadrer précisément la demande et éviter les allers-retours.

## Références utiles

- `.kiro/skills/*/SKILL.md` — si le prompt cible un skill précis, lire son contrat d'entrée pour aligner le format et le vocabulaire attendus.
- `.kiro/steering/product.md` — vocabulaire métier (haltérophilie : archétypes, évaluations, programmation, référentiel) à réutiliser dans le prompt.
- `.kiro/steering/architecture.md` et `*-convention.md` — pour ancrer les contraintes techniques quand le prompt vise du code.

N'utiliser ces références que pour **enrichir et cadrer** le prompt ; ne pas les recopier intégralement.

## Contrat d'entrée

```
INTENTION   : <la phrase simple exprimant ce qu'on veut>
CONTEXTE    : <optionnel : écran, table, module, exemple, capture>
CIBLE       : <optionnel : agent ou skill destinataire (ex. developpeur, need-analyzer, LLM générique)>
CONTRAINTES : <optionnel : format de sortie voulu, longueur, ton, délai, périmètre>
```

Un seul champ `INTENTION` suffit à démarrer ; le reste est déduit par les questions.

## Procédure

1. **Reformuler l'intention** en une phrase pour valider la compréhension initiale.
2. **Identifier la cible** du prompt (agent, skill, LLM générique) : le format optimal en dépend. Si la cible est un skill du projet, lire son contrat d'entrée pour s'y conformer.
3. **Détecter les manques** selon les dimensions d'un bon prompt (voir ci-dessous) et **poser des questions de clarification** ciblées et regroupées. Prioriser les questions bloquantes ; ne pas noyer l'utilisateur.
4. **Boucler** : reposer des questions autant de fois que nécessaire tant que des éléments essentiels manquent. À défaut de réponse, proposer une **hypothèse par défaut explicite** et la signaler comme « à valider ».
5. **Assembler le prompt final** selon la structure de livraison, en réutilisant le vocabulaire métier et les contraintes du projet quand c'est pertinent.
6. **Livrer** le prompt dans un bloc de code copiable, suivi d'un court mode d'emploi (à qui le donner, quoi ajuster).

## Dimensions d'un bon prompt (grille de questions)

Balayer ces axes pour repérer ce qui manque et formuler les questions :

- **Rôle / persona** : qui doit répondre (expertise, posture) ?
- **Objectif** : quel résultat concret attendu, quel problème résolu ?
- **Contexte** : informations d'arrière-plan, existant, exemples, contraintes du projet.
- **Entrées** : de quelles données/fichiers l'agent dispose ou a besoin.
- **Tâches / étapes** : ce qu'il doit faire, dans quel ordre.
- **Contraintes** : conventions, périmètre, interdits, dépendances, sécurité.
- **Format de sortie** : structure, longueur, langue, ton, gabarit attendu.
- **Critères de réussite** : comment juger que la réponse est bonne.
- **Cas limites** : quoi faire en cas d'ambiguïté, d'erreur, de données manquantes.

## Livrables

Le prompt final, structuré et prêt à copier, contenant au minimum :

- **Rôle & objectif** — une ou deux phrases situant la mission.
- **Contexte** — éléments d'arrière-plan nécessaires (métier + technique si pertinent).
- **Tâche(s)** — instructions claires, ordonnées si besoin.
- **Contraintes** — règles à respecter (conventions projet, périmètre, format).
- **Format de sortie attendu** — gabarit précis de la réponse.
- **Critères de réussite** — conditions vérifiables de « c'est bon ».

Accompagné d'un **mode d'emploi** court : cible recommandée, variables à personnaliser, hypothèses retenues à valider.

## Critères de qualité

- Le prompt est **autonome** : lisible et exploitable sans le contexte de la conversation.
- Aucune dimension essentielle laissée vide sans question posée ou hypothèse explicite.
- Le vocabulaire et les contraintes sont **cohérents avec le projet** quand la cible est interne.
- Le format de sortie demandé est **précis et vérifiable**.
- Le prompt reste **concis** : complet sans verbiage ; chaque section apporte de l'information.
- Rien n'est modifié dans le dépôt : le skill ne produit qu'un texte de prompt.
