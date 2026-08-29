---
title: Development Practices
description: "Git development practices"
inclusion: manual
---

## Git

### Structure et conventions
- Branches : `main`, `release/R{number}`, `feature/F{name}`, `story/S{name}`, `bugfix/B{name}`, `hotfix/H{name}`,
- Une PR ou un commit = une feature ou un fix — pas de commits fourre-tout
- Le message de commit doit être concis, orienté fonctionnel et respecter la convention suivante : 
```
{type}({scope}): {reference} - {title}

{body}

Ref: {reference}
```
avec :
- type = `feat` | `fix` | `docs` | `style` | `refactor` | `perf` | `security`
- scope = le nom du module ou de la fonctionnalité impactée
- title = une phrase courte décrivant le changement
- body = une description plus détaillée du changement
- reference = un lien vers la story Jira ou le ticket GitHub associé (généralement identique au nom de la branche)
