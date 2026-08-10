# Skill : Agent Dispatcher

**Utilisateur** : @orchestrator

## Description
Dispatche et coordonne les agents spécialisés du pipeline de développement. Gère le workflow séquentiel et les boucles de correction (max 3 itérations).

## Usage
Charge ce skill quand tu dois orchestrer un pipeline complet de développement.

## Workflow

### 1. Initialisation
```markdown
## État du pipeline
- Demande utilisateur : [consigne originale]
- Étape actuelle : [analyse | design | dev | review | doc | commit]
- Itérations : {agent: compteur} (max 3 par agent)
- Agents terminés : []
- Agents en attente : [@analyste, @architecte, ...]
```

### 2. Dispatch séquentiel

#### Étape 1 : Analyse
```typescript
spawn_run({
  task: `Tu es @analyste. ${handoff_context}`,
  agent: "kirocrew"  // ou agent spécifique si configuré
})
```

Attendre completion event → Extraire résultat → Préparer handoff pour @architecte

#### Étape 2 : Architecture
```typescript
spawn_run({
  task: `Tu es @architecte. ${handoff_context_incluant_resultat_analyste}`,
  agent: "kirocrew"
})
```

Attendre completion event → Extraire résultat → Préparer handoff pour @developpeur

#### Étape 3 : Développement
```typescript
spawn_run({
  task: `Tu es @developpeur. ${handoff_context_incluant_resultat_architecte}`,
  agent: "kirocrew"
})
```

Attendre completion event → Extraire résultat → Préparer handoff pour @reviewer

#### Étape 4 : Review
```typescript
spawn_run({
  task: `Tu es @reviewer. ${handoff_context_incluant_resultat_developpeur}`,
  agent: "kirocrew"
})
```

Attendre completion event → Analyser résultat :
- **Si ✅ APPROUVÉ** → Continuer vers @documentaliste
- **Si ❌ REFUSÉ** → Gérer boucle de correction (voir section Gestion des boucles)

#### Étape 5 : Documentation
```typescript
spawn_run({
  task: `Tu es @documentaliste. ${handoff_context_incluant_resultat_reviewer}`,
  agent: "kirocrew"
})
```

Attendre completion event → Continuer vers @commiteur

#### Étape 6 : Commit
```typescript
spawn_run({
  task: `Tu es @commiteur. ${handoff_context_complet}`,
  agent: "kirocrew"
})
```

Attendre completion event → Générer rapport final

### 3. Gestion des boucles de correction

Quand @reviewer retourne ❌ REFUSÉ :

```typescript
// Incrémenter compteur pour l'agent cible
iterations[agent_cible]++;

if (iterations[agent_cible] <= 3) {
  // Déterminer agent cible selon type de problème
  if (probleme_de_design) {
    // Retour vers @architecte
    spawn_run({
      task: `Tu es @architecte. Voici les problèmes détectés par @reviewer : ${problemes}. Propose une alternative.`,
      agent: "kirocrew"
    });
    // Après architecte → retour @developpeur avec nouveau design
  } else {
    // Retour vers @developpeur
    spawn_run({
      task: `Tu es @developpeur. Voici les corrections à apporter suite à la review : ${corrections}`,
      agent: "kirocrew"
    });
  }
} else {
  // Max itérations atteint → escalade utilisateur
  ask_question({
    question: `Le pipeline est bloqué après 3 tentatives. Voici les problèmes : ${resume_problemes}. Comment souhaitez-vous procéder ?`,
    options: [
      "Proposer une alternative technique",
      "Modifier les specs initiales",
      "Accepter le code en l'état avec réserves",
      "Arrêter le pipeline"
    ]
  });
  // Traiter réponse utilisateur
}
```

### 4. Format de handoff

Chaque spawn_run doit inclure ce contexte standardisé :

```markdown
---
AGENT: @{nom_agent}
PIPELINE_ID: {uuid_unique_du_pipeline}
ITERATION: {numero} / 3
---

# Contexte global
**Demande originale utilisateur** : {consigne}

**État du pipeline** :
- Étape actuelle : {nom_etape}
- Agents terminés : [{liste}]

# Input de l'agent précédent
{resultat_agent_precedent}

# Ta tâche
{instructions_specifiques_pour_cet_agent}

# Contraintes
- Lire ton fichier de définition dans `.kiro/agents/{nom}.md`
- Utiliser les skills : {liste_skills}
- Respecter scrupuleusement dev-practices.md
- Si bloqué ou besoin clarification : demander via @orchestrator

# Output attendu
{format_attendu_selon_agent}
```

### 5. Détection des blocages inter-agents

Si un agent demande clarification à l'agent précédent :
1. Détecter la demande dans le completion event
2. Spawner l'agent précédent avec la question
3. Re-spawner l'agent courant avec la réponse
4. Incrémenter compteur d'itération

Exemple :
```typescript
// @developpeur demande aide à @architecte
if (completion_event.content.includes("DEMANDE_AIDE_ARCHITECTE")) {
  iterations["architecte"]++;
  if (iterations["architecte"] <= 3) {
    spawn_run({
      task: `Tu es @architecte. @developpeur a besoin d'aide : ${question_developpeur}`,
      agent: "kirocrew"
    });
    // Attendre réponse architecte
    // Re-spawner développeur avec réponse
  } else {
    // Escalade utilisateur
  }
}
```

## Rapport final

Générer ce rapport après @commiteur :

```markdown
# 🎉 Pipeline terminé avec succès

## Résumé exécutif
**Feature** : {description_courte}
**Durée** : {temps_total}
**Agents impliqués** : {liste_avec_iterations}

## Changements apportés
- **Backend** : {nb} fichiers créés, {nb} modifiés
- **Frontend** : {nb} fichiers créés, {nb} modifiés
- **Base de données** : {nb} migration(s)
- **Tests** : {nb} tests ajoutés
- **Documentation** : {statut_mise_a_jour}

## Détails par étape
### 📊 Analyse (@analyste)
{resume_besoins}

### 🏗️ Architecture (@architecte)
{resume_design}

### 💻 Développement (@developpeur)
{liste_fichiers_principaux}

### ✅ Review (@reviewer)
{statut_validation}

### 📚 Documentation (@documentaliste)
{fichiers_mis_a_jour}

## Message de commit proposé
{message_commit_complet}
```

## Gestion des erreurs

### Timeout sur un agent
Si un agent ne répond pas après 5 minutes :
1. Logger le timeout
2. Demander à l'utilisateur : continuer, retry, ou arrêter

### Erreur critique dans un agent
Si un agent plante (exception non gérée) :
1. Logger l'erreur complète
2. Proposer retry avec approche alternative
3. Si retry échoue → escalade utilisateur

### Conflit entre agents
Si @architecte et @developpeur ont des visions divergentes :
1. Présenter les deux positions à l'utilisateur
2. Attendre décision
3. Relancer pipeline avec décision utilisateur

## Optimisations

### Cache des résultats
Stocker les outputs d'agents dans `/tmp/pipeline-{id}/` pour reprise en cas d'interruption.

### Skip optionnel
Si changement mineur (typo, doc), permettre skip de certains agents :
- Feature majeure → tous les agents
- Bugfix simple → skip @analyste, direct @architecte
- Doc seule → skip tout sauf @documentaliste + @commiteur

## Notes
- Toujours attendre le completion event avant de continuer
- Ne JAMAIS spawner plusieurs agents en parallèle (séquentiel uniquement)
- Logger chaque transition pour traçabilité
- L'utilisateur peut interrompre à tout moment
