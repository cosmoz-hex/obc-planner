---
name: check-security
description: Détecter les failles de sécurité dans un changement de code OBC Planner (injections SQL, fuites de secrets, mauvaise gestion JWT, exposition de stack traces, contrôle d'accès insuffisant). À utiliser en revue pour valider la conformité sécurité avant intégration.
allowed-tools: Read, Grep, Glob, CodeIntelligence
---

# Contrôler la sécurité

Analyse un changement à la recherche de vulnérabilités et d'écarts aux exigences de sécurité du projet. Le skill **détecte et alerte** ; il ne corrige pas.

## Quand l'utiliser

- En revue, sur du code touchant l'authentification, l'accès aux données, les entrées utilisateur, la configuration.
- Après `git-diff` quand des zones sensibles (auth, JWT, SQL) sont repérées.

## Références obligatoires

- `.kiro/steering/*-convention.md` — exigences sécurité : JWT sans session, secrets dans `secure-application.properties` (hors Git), validation dans `OncePerRequestFilter`, pas de données sensibles dans le payload JWT, sécurité au plus haut niveau (Configuration/Filter/Interceptor), requêtes préparées anti-injection, erreurs structurées sans stack trace exposée.
- `.kiro/steering/architecture.md` — packages `configuration/`, `filter/`, `interceptor/`, `annotations/`, `aspects/` où la sécurité est censée vivre.
- `README.md` — modèle des secrets (`secure-application.properties`, `.env`).

## Contrat d'entrée

```
CHANGEMENT   : <diff/PR ou fichiers modifiés>
SURFACE      : <optionnel : endpoints, formulaires, requêtes concernés>
```

## Procédure

1. **Entrées utilisateur** : toute donnée externe est-elle validée ? Requêtes SQL/JPA paramétrées (aucune concaténation) ? Risque d'injection ?
2. **Authentification / autorisation** : contrôle d'accès présent au bon niveau ? endpoints protégés ? pas de contournement introduit ?
3. **JWT** : pas de donnée sensible dans le payload ; validation dans le filtre ; expiration/signature respectées.
4. **Secrets** : aucun secret en dur ni committé ; usage de `secure-application.properties`/variables d'env ; ne pas afficher les valeurs de secrets dans le rapport (référencer par nom).
5. **Fuites d'information** : pas de stack trace ni de détail interne renvoyé au client ; erreurs structurées `[{timestamp}] {level} {class}.{method} - {message}`.
6. **Dépendances** : nouvelle dépendance suspecte (typosquatting, version non pinnée) ? à signaler.
7. **Statuer** : lister les failles par sévérité (critique/majeure/mineure) avec preuve et remédiation recommandée.

## Livrables

- **Verdict sécurité** : conforme / écarts / failles bloquantes.
- **Liste des failles** : type, preuve (fichier:ligne), sévérité, remédiation recommandée.
- **Points de vigilance** (bonnes pratiques limites mais non bloquantes).

## Critères de qualité

- Chaque faille est justifiée par une preuve traçable et classée en sévérité.
- Les valeurs de secrets ne sont jamais reproduites dans le rapport.
- Injections, contrôle d'accès, JWT, secrets et fuites d'info sont tous couverts.
- Aucune modification de code.
