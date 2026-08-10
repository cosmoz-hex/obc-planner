# Infrastructure d'Agents — OBC Planner

Infrastructure complète d'agents spécialisés pour automatiser le pipeline de développement complet, de l'analyse des besoins au message de commit.

## 🎯 Agents disponibles

| Agent | Rôle | Skills | Usage unitaire |
|---|---|---|---|
| **@orchestrator** | Pilote le pipeline et coordonne les agents | `agent-dispatcher`, `handoff-manager` | Pipeline complet |
| **@analyste** | Analyse besoins **fonctionnels** | `requirements-analysis`, `context-builder` | ✅ Oui |
| **@architecte** | Design technique détaillé | `technical-design`, `impact-analysis` | ✅ Oui |
| **@developpeur** | Implémentation code (backend/frontend/BDD) | `code-generator` | ✅ Oui |
| **@reviewer** | Validation qualité et conformité | `code-review`, `regression-checker` | ✅ Oui |
| **@documentaliste** | Synchronisation documentation | `doc-sync` | ✅ Oui |
| **@commiteur** | Génération message commit | `commit-message` | ✅ Oui |

**Note** : Tous les agents sauf @orchestrator peuvent être utilisés de manière unitaire. Voir `STANDALONE-USAGE.md` pour le guide complet.

## 🚀 Utilisation

### Mode 1 : Pipeline complet (orchestré)

Invoquer l'orchestrateur avec votre consigne :

```
@orchestrator "Ajouter la gestion des profils psychologiques aux évaluations"
```

L'orchestrateur va automatiquement :
1. Dispatcher @analyste pour analyser les besoins
2. Dispatcher @architecte pour le design technique
3. Dispatcher @developpeur pour l'implémentation
4. Dispatcher @reviewer pour la validation
5. Si review OK → @documentaliste puis @commiteur
6. Si review KO → boucle de correction (max 3 tentatives)
7. Générer un rapport final avec le message de commit

### Mode 2 : Agents unitaires (manuel)

Vous pouvez invoquer chaque agent **individuellement** :

```
@analyste "Je veux ajouter la fonctionnalité X"
→ Produit cahier des charges fonctionnel

@architecte "Voici le besoin : [...]"
→ Produit design technique

@developpeur "Voici le design : [...]"
→ Implémente le code

@reviewer "Review ces fichiers : [...]"
→ Valide la qualité

@commiteur "Générer commit pour : [...]"
→ Génère message de commit
```

**Voir `STANDALONE-USAGE.md` pour le guide complet d'usage unitaire.**

### Workflow complet

```
Vous → @orchestrator
  ↓
@analyste (lit /docs, pose questions si besoin)
  ↓
@architecte (design technique)
  ↓
@developpeur (implémentation)
  ↓
@reviewer (validation)
  ↓ (si ✅)
@documentaliste (update /docs si nécessaire)
  ↓
@commiteur (génère message commit)
  ↓
@orchestrator → Vous (rapport + message commit)
```

## 🔄 Boucles de correction

Si @reviewer détecte des problèmes :
- **Corrections simples** → retour @developpeur (max 3 tentatives)
- **Problème de design** → retour @architecte (max 3 tentatives)
- **Max atteint** → escalade vers vous avec options

Vous gardez toujours le contrôle final.

## ⚙️ Structure des fichiers

```
.kiro/
├── agents/                           # Définitions des agents (7)
│   ├── orchestrator.md
│   ├── analyste.md
│   ├── architecte.md
│   ├── developpeur.md
│   ├── reviewer.md
│   ├── documentaliste.md
│   └── commiteur.md
└── skills/                           # Skills spécialisés (8 - optimisés)
    ├── agent-dispatcher/             # @orchestrator
    ├── handoff-manager/              # @orchestrator
    ├── requirements-analysis/        # @analyste (inclut context-builder)
    ├── technical-design/             # @architecte (inclut impact-analysis)
    ├── code-generator/               # @developpeur (allégé, pointe vers dev-practices.md)
    ├── code-review/                  # @reviewer (allégé, pointe vers dev-practices.md)
    ├── doc-sync/                     # @documentaliste
    └── commit-message/               # @commiteur
```

**Optimisations** :
- 📉 **8 skills au lieu de 12** (fusionnés/supprimés les redondants)
- 📉 **~60% de tokens en moins** sur skills développeur/reviewer
- ⚡ **Repose sur `.kiro/steering/dev-practices.md`** (source de vérité unique)

## 📋 Rapport final

À la fin du pipeline, vous recevez :

```markdown
# 🎉 Pipeline terminé avec succès

## Résumé
- Feature : [description]
- Backend : X fichiers créés, Y modifiés
- Frontend : X fichiers créés, Y modifiés
- BDD : X migration(s)
- Tests : X tests ajoutés
- Documentation : [statut]

## Message de commit proposé
```
feat(evaluations): ajouter profil psychologique

[Message complet conforme conventions]
```

## Prochaine étape
git add . && git commit -m "..."
```

Vous commitez ensuite manuellement.

## 🔧 Personnalisation

### Modifier un agent

Éditez le fichier `.kiro/agents/{nom}.md` :
- Ajustez les responsabilités
- Modifiez le format d'output
- Changez les contraintes

### Modifier un skill

Éditez le fichier `.kiro/skills/{nom}/SKILL.md` :
- Ajustez le processus
- Modifiez les vérifications
- Changez le template de sortie

### Ajouter un agent

1. Créer `.kiro/agents/nouveau-agent.md`
2. Créer skills dans `.kiro/skills/nouveau-skill/`
3. Mettre à jour `agent-dispatcher` pour inclure le nouvel agent

## 🎯 Exemples d'usage

### Feature complète
```
@orchestrator "Ajouter la gestion des plans d'entrainement avec génération automatique selon l'archétype de l'athlète"
```

### Bugfix simple
```
@orchestrator "Corriger la validation de la date de naissance qui accepte les dates futures"
```

### Refactoring
```
@orchestrator "Extraire la logique de calcul des profils vers un service dédié"
```

## ⚠️ Limites

- **Max 3 itérations** par agent avant escalade utilisateur
- **Séquentiel uniquement** : pas de parallélisation entre agents
- **Décision finale** : l'utilisateur arbitre toujours en cas de conflit
- **Commit manuel** : le pipeline ne commit pas automatiquement
- **Pas de tests** : Ce projet ne met pas en place de tests (ni backend ni frontend) pour le moment

## 🔍 Débogage

Si un agent est bloqué :
1. Lire son fichier de définition dans `.kiro/agents/`
2. Vérifier les skills utilisés dans `.kiro/skills/`
3. Consulter les contraintes dans `.kiro/steering/dev-practices.md`
4. L'orchestrateur escalade automatiquement après 3 tentatives

## 📚 Documentation de référence

- **dev-practices.md** : Contraintes de code (toujours respectées)
- **product.md** : Règles métier du domaine haltérophilie
- **architecture.md** : Vue simplifiée de la stack
- **/docs/** : Documentation technique complète

## 🎓 Bonnes pratiques

1. **Consignes claires** : Plus votre consigne est précise, meilleur sera le résultat
2. **Répondre aux questions** : @analyste peut vous poser des questions pour clarifier
3. **Vérifier le rapport** : Toujours relire avant de commiter
4. **Feedback** : Si un agent fait une erreur récurrente, éditez sa définition

## 🚧 Évolutions futures

- Ajout d'un agent **testeur** pour E2E automatiques
- Ajout d'un agent **deployer** pour déploiement automatique
- Cache des résultats pour reprise après interruption
- Dashboard de suivi du pipeline en temps réel
