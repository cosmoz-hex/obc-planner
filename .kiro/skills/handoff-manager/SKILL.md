# Skill : Handoff Manager

**Utilisateur** : @orchestrator

## Description
Gère les communications inter-agents via `spawn_run`. Standardise le format des handoffs, extrait les résultats des completion events, et maintient l'état du pipeline.

## Usage
Charge ce skill pour gérer les transmissions de contexte entre agents du pipeline.

## Format standardisé de handoff

```markdown
---
AGENT: @{nom_agent}
PIPELINE_ID: {uuid}
ITERATION: {n} / 3
PREVIOUS_AGENT: @{agent_precedent}
---

# 📋 Contexte global

**Demande utilisateur originale** :
```
{consigne_utilisateur}
```

**Type de tâche** : [Feature | Bugfix | Refactor | Enhancement]

**Étape pipeline** : {numero_etape} / 6
- ✅ Terminé : [{liste_agents}]
- ⏳ En cours : @{agent_actuel}
- ⏸️ En attente : [{liste_agents_restants}]

---

# 📥 Input : Résultat de @{agent_precedent}

{output_complet_agent_precedent}

---

# 🎯 Ta mission

{instructions_specifiques_pour_cet_agent}

## Fichier de définition
Lis ton rôle détaillé dans `.kiro/agents/{nom_agent}.md`

## Skills disponibles
{liste_skills_de_cet_agent}

## Contraintes spécifiques
- {contrainte_1}
- {contrainte_2}

---

# 📤 Output attendu

{format_precis_attendu}

---

# ⚠️ En cas de problème

- **Besoin clarification** : Inclure `🔄 DEMANDE_CLARIFICATION @{agent_cible}` suivi de ta question
- **Bloqué** : Inclure `🚨 BLOCAGE` suivi du détail
- **Alternative nécessaire** : Inclure `💡 PROPOSITION_ALTERNATIVE` suivi de ta proposition

Ces marqueurs permettront à @orchestrator de gérer ton besoin.
```

## Extraction des résultats

Après chaque completion event, extraire les sections clés :

```typescript
function extractAgentOutput(completion_event) {
  const content = completion_event.content;
  
  return {
    agent: extractSection(content, "AGENT"),
    status: detectStatus(content), // ✅ | ❌ | 🔄 | 🚨
    main_output: extractMainSection(content),
    files_created: extractFilesList(content, "créés"),
    files_modified: extractFilesList(content, "modifiés"),
    clarification_request: extractIfPresent(content, "DEMANDE_CLARIFICATION"),
    blocking_issue: extractIfPresent(content, "BLOCAGE"),
    alternative_proposal: extractIfPresent(content, "PROPOSITION_ALTERNATIVE"),
    warnings: extractWarnings(content),
    recommendations: extractRecommendations(content)
  };
}
```

## Détection de statut

Identifier le statut d'un agent depuis son output :

```typescript
function detectStatus(content) {
  // Review approuvé
  if (content.includes("✅ APPROUVÉ") || content.includes("Review : ✅")) {
    return "SUCCESS";
  }
  
  // Review refusé
  if (content.includes("❌ REFUSÉ") || content.includes("Review : ❌")) {
    return "REJECTED";
  }
  
  // Demande clarification
  if (content.includes("🔄 DEMANDE_CLARIFICATION")) {
    return "NEEDS_CLARIFICATION";
  }
  
  // Blocage
  if (content.includes("🚨 BLOCAGE")) {
    return "BLOCKED";
  }
  
  // Proposition alternative
  if (content.includes("💡 PROPOSITION_ALTERNATIVE")) {
    return "ALTERNATIVE_PROPOSED";
  }
  
  // Par défaut : succès
  return "SUCCESS";
}
```

## Gestion des demandes inter-agents

### Cas 1 : @developpeur demande aide à @architecte

```typescript
const devOutput = extractAgentOutput(completion_event);

if (devOutput.clarification_request?.target === "@architecte") {
  iterations.architecte++;
  
  if (iterations.architecte <= 3) {
    const handoff = buildHandoff({
      agent: "architecte",
      pipeline_id: current_pipeline_id,
      iteration: iterations.architecte,
      previous_agent: "developpeur",
      user_request: original_user_request,
      previous_output: devOutput.main_output,
      mission: `@developpeur a besoin d'aide : ${devOutput.clarification_request.question}`,
      expected_output: "Proposition alternative ou ajustement design"
    });
    
    spawn_run({ task: handoff, agent: "kirocrew" });
    // Attendre réponse architecte
    // Re-spawner développeur avec réponse
  } else {
    escalateToUser(devOutput.clarification_request);
  }
}
```

### Cas 2 : @reviewer refuse le code

```typescript
const reviewOutput = extractAgentOutput(completion_event);

if (reviewOutput.status === "REJECTED") {
  const target = determineTarget(reviewOutput);
  // "developpeur" si corrections simples, "architecte" si problème design
  
  iterations[target]++;
  
  if (iterations[target] <= 3) {
    const handoff = buildHandoff({
      agent: target,
      pipeline_id: current_pipeline_id,
      iteration: iterations[target],
      previous_agent: "reviewer",
      user_request: original_user_request,
      previous_output: reviewOutput.main_output,
      mission: target === "architecte" 
        ? `Redéfinir le design suite aux problèmes : ${reviewOutput.blocking_issues}`
        : `Corriger les problèmes détectés : ${reviewOutput.blocking_issues}`,
      expected_output: target === "architecte" 
        ? "Nouveau design technique" 
        : "Code corrigé"
    });
    
    spawn_run({ task: handoff, agent: "kirocrew" });
  } else {
    escalateToUser({
      reason: "MAX_ITERATIONS_REACHED",
      agent: target,
      issues: reviewOutput.blocking_issues
    });
  }
}
```

## Persistance de l'état du pipeline

Maintenir un état en mémoire (ou fichier temporaire) :

```typescript
interface PipelineState {
  id: string;
  user_request: string;
  type: "feature" | "bugfix" | "refactor";
  current_step: number;
  completed_agents: string[];
  current_agent: string;
  pending_agents: string[];
  iterations: Record<string, number>;
  outputs: Record<string, any>;
  start_time: Date;
  status: "running" | "blocked" | "completed" | "failed";
}

// Exemple
const pipelineState: PipelineState = {
  id: "pipeline-20260810-2100-abc123",
  user_request: "Ajouter gestion des profils psychologiques",
  type: "feature",
  current_step: 3,
  completed_agents: ["analyste", "architecte"],
  current_agent: "developpeur",
  pending_agents: ["reviewer", "documentaliste", "commiteur"],
  iterations: {
    analyste: 1,
    architecte: 1,
    developpeur: 1
  },
  outputs: {
    analyste: { /* ... */ },
    architecte: { /* ... */ }
  },
  start_time: new Date("2026-08-10T21:00:00Z"),
  status: "running"
};
```

## Helper functions

### buildHandoff

```typescript
function buildHandoff(params: {
  agent: string;
  pipeline_id: string;
  iteration: number;
  previous_agent: string;
  user_request: string;
  previous_output: string;
  mission: string;
  expected_output: string;
  constraints?: string[];
}): string {
  const skills = getSkillsForAgent(params.agent);
  const completedAgents = getCompletedAgents(params.pipeline_id);
  const pendingAgents = getPendingAgents(params.pipeline_id);
  
  return `
---
AGENT: @${params.agent}
PIPELINE_ID: ${params.pipeline_id}
ITERATION: ${params.iteration} / 3
PREVIOUS_AGENT: @${params.previous_agent}
---

# 📋 Contexte global

**Demande utilisateur originale** :
\`\`\`
${params.user_request}
\`\`\`

**Étape pipeline** : ${getCurrentStep(params.agent)} / 6
- ✅ Terminé : [${completedAgents.join(", ")}]
- ⏳ En cours : @${params.agent}
- ⏸️ En attente : [${pendingAgents.join(", ")}]

---

# 📥 Input : Résultat de @${params.previous_agent}

${params.previous_output}

---

# 🎯 Ta mission

${params.mission}

## Fichier de définition
Lis ton rôle détaillé dans \`.kiro/agents/${params.agent}.md\`

## Skills disponibles
${skills.map(s => `- \`$${s}\``).join("\n")}

## Contraintes spécifiques
${(params.constraints || []).map(c => `- ${c}`).join("\n")}

---

# 📤 Output attendu

${params.expected_output}

---

# ⚠️ En cas de problème

- **Besoin clarification** : Inclure \`🔄 DEMANDE_CLARIFICATION @{agent_cible}\` suivi de ta question
- **Bloqué** : Inclure \`🚨 BLOCAGE\` suivi du détail
- **Alternative nécessaire** : Inclure \`💡 PROPOSITION_ALTERNATIVE\` suivi de ta proposition
  `;
}
```

### escalateToUser

```typescript
function escalateToUser(issue: {
  reason: string;
  agent?: string;
  issues?: any;
}) {
  const question = buildEscalationQuestion(issue);
  
  const response = ask_question({
    question: question.text,
    options: question.options
  });
  
  handleUserDecision(response, issue);
}

function buildEscalationQuestion(issue) {
  if (issue.reason === "MAX_ITERATIONS_REACHED") {
    return {
      text: `Le pipeline est bloqué après 3 tentatives sur @${issue.agent}. 
      
Problèmes détectés :
${formatIssues(issue.issues)}

Comment souhaitez-vous procéder ?`,
      options: [
        "Proposer une alternative technique",
        "Modifier les specs initiales",
        "Continuer avec réserves",
        "Arrêter le pipeline"
      ]
    };
  }
  // Autres cas...
}
```

## Traçabilité

Optionnel : Logger chaque handoff dans un fichier pour audit :

```bash
/tmp/pipeline-{id}/
├── 01-analyste-input.md
├── 01-analyste-output.md
├── 02-architecte-input.md
├── 02-architecte-output.md
├── 03-developpeur-input.md
├── 03-developpeur-output.md
└── pipeline-state.json
```

## Notes
- Le handoff doit être **auto-suffisant** : l'agent ne doit pas avoir à lire les outputs précédents manuellement
- Toujours inclure les marqueurs `🔄`, `🚨`, `💡` pour faciliter le parsing
- Limiter la taille des outputs précédents transmis (résumer si > 1000 lignes)
