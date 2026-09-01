---
title: Development Practices - Backend
description: "Backend development practices for Java / Spring Boot 4.1+"
inclusionMode: "fileMatch"
fileMatch:
  - "**/*.java"
---

## Java / Spring Boot 4.1+

### Architecture générales
- Utiliser au maximum les annotations **Lombok** (`@RequiredArgsConstructor`, `@Data`, `@Builder`, `@Slf4j`, etc.)
- Préférer l'injection par constructeur (assurée par `@RequiredArgsConstructor`)
- Ne jamais injecter de dépendances via `@Autowired` sur les champs
- Respecter les 3 couches : **Controller → Service → Repository**
- Toujours utiliser des **interfaces + implémentations** pour les services / repositories
- Les controllers ne contiennent **aucune logique métier** — ils délèguent aux services
- Utiliser au maximum les **Streams** et les **Optional** pour éviter les boucles et les `null`
- Utiliser au maximum les annotations Spring, en cas de besoin plus complexe, créer un **Aspect** ou une **Annotation** dans `annotations/` et `aspects/`

### Entités JPA
- Les entités JPA doivent implémenter des validators (@Id, @Min, @Max, @NotNull, etc.) cohérent avec la base de données
- Toujours annoter avec `@Entity` + `@Table(name = "nom_snake_case")`
- Utiliser `@GeneratedValue(strategy = GenerationType.IDENTITY)` pour les IDs
- Nommer les colonnes explicitement avec `@Column(name = "nom_snake_case")`
- Éviter `FetchType.EAGER` — préférer `LAZY` et charger explicitement si besoin
- Utiliser `@Data` (Lombok) sur les entités (getters/setters/`toString`/`equals`/`hashCode`). Sur une entité **sans relation**, `@Data` seul suffit. Sur une entité **avec relation(s)** (`@ManyToOne`/`@OneToMany`…), exclure les relations de `equals`/`hashCode`/`toString` via `@EqualsAndHashCode.Exclude` + `@ToString.Exclude` pour éviter le chargement des relations lazy et les récursions infinies.

### DTOs
- Utiliser des **DTOs** pour les échanges avec le frontend — jamais exposer les entités JPA directement
- Créer des DTOs distincts pour les requêtes (`*Request`) et les réponses (`*Response`)
- Utiliser des **records Java** pour les DTOs immuables

### Exceptions et sécurité
- Centraliser la gestion des erreurs avec @RestControllerAdvice et @ExceptionHandler
- Retourner des réponses d'erreur structurées avec un timestamp, un code et un message
- Logger les exceptions côté serveur, mais ne jamais exposer de stack trace au client en respectant le format suivant :
  - `[{timestamp}] {level} {class}.{method} - {message}`
- L'authentification se fait via JWT — pas de session côté serveur
- Les secrets sont stockés dans `secure-application.properties` exclu du Git
- Valider le token dans un filtre `OncePerRequestFilter`
- Ne jamais stocker de données sensibles dans le payload JWT
- Implémenter la sécurité au plus haut niveau possible (Configuration, Filter, Interceptor)

### Migrations base de données
- **Toujours** passer par Flyway pour modifier le schéma — jamais via `ddl-auto=update`
- Convention de nommage : `V{yyyymmdd}_{hhmiss}__{story}.sql` (ex: `V20260722_161600__S0002.sql`)
- Les scripts de migration doivent être **idempotents** — vérifier l'existence des tables/colonnes avant de les créer/supprimer et ne jamais supprimer de données existantes si existe des FK (favoriser les MERGE ou DELETE + INSERT selon le cas)
- Ne jamais modifier un script de migration déjà commité — créer un nouveau script pour corriger ou compléter
- Un script de montée de version doit être accompagné d'un script de descente (rollback)
