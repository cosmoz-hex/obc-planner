# OBC Planner - Projet Full Stack

## 📋 Vue d'ensemble

**OBC Planner** est une application full stack moderne pour la gestion d'entrainement d'haltérophilie. Elle combine un backend **Spring Boot 4.1** avec un frontend **Angular 20**. Le projet utilise une architecture API REST avec support multi-langue, gestion d'état réactive via Signals, et base de données PostgreSQL.

### 🛠 Stack Technologique

#### **Backend**
- **Spring Boot 4.1** - Framework web Java
- **Java 25** - Langage de programmation
- **PostgreSQL** - Base de données relationnelle
- **Flyway** - Gestion des migrations SQL
- **Lombok** - Réduction du boilerplate Java
- **Maven** - Gestion des dépendances et build

#### **Frontend**
- **Angular 20** - Framework TypeScript
- **Node.js 24.18.0** - Runtime JavaScript
- **npm 11.17.0** - Gestionnaire de paquets
- **Tailwind CSS 4.3.1** - Framework CSS
- **Web Components 3.9.0** - Composants web

---

## 📁 Structure du Projet

```
obc-planner/
├── back-end/                                   # Application Spring Boot
│   ├── src/main/java/com/example/backend/      
│   │       ├── BackEndApplication.java         # Classe principale Spring Boot
│   │       ├── configuration/                  # Configuration Spring (CORS, Security, etc.)
│   │       ├── controllers/                    # Controllers REST API
│   │       ├── services/                       # Services métiers
│   │       │   ├── apis/
│   │       │   └── impl/
│   │       ├── entities/                       # Entités JPA/Hibernate
│   │       ├── dto/                            # Objects pour la communication avec le frontend
│   │       └── repositories/                   # Lien avec la base de données
│   │           └── apis/
                └── impl/
│   ├── src/main/resources/
│   │   ├── application.properties              # Configuration et variables Spring Boot
│   │   └── db/migration/                       # Migrations Flyway
│   ├── pom.xml                                 # Configuration et dépendances Maven
│       
├── front-end/                                  # Application Angular
│   ├── src/        
│   │   ├── app/        
│   │   │   ├── app.component.ts                # Composant racine
│   │   │   ├── app.component.html              # Template
│   │   │   ├── app.config.ts                   # Configuration Angular
│   │   │   ├── app.routes.ts                   # Routes
│   │   │   ├── services/                       # Service API pour communiquer avec le backend
│   │   │   ├── models/                         # Objects pour la communication avec le backend
│   │   ├── assets/
│   │   │   └── i18n/
│   │   │       ├── en.json                     # Traductions anglaises
│   │   │       └── fr.json                     # Traductions françaises
│   ├── angular.json                            # Configuration Angular CLI
│   ├── package.json                            # Dépendances npm
│   ├── tsconfig.json                           # Configuration TypeScript

```

---

## ⚙️ Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants :

### 1. **Java Development Kit (JDK) 25**
- [Télécharger Java 25](https://www.oracle.com/java/technologies/downloads/#jdk25-windows)
- Vérifier l'installation :
  ```bash
  java -version
  ```

### 2. **Node.js 24.18.0 **
- [Télécharger Node.js](https://nodejs.org/dist/v24.18.0/node-v24.18.0-x64.msi)
- Vérifier l'installation :
  ```bash
  node --version
  ```

### 3. **npm 11.17.0**
- Installation :
  ```bash
  npm install -g npm@11.17.0
  npm --version
  ```

### 4. **PostgreSQL 18**
- [Télécharger PostgreSQL](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
- Après l'installation de PostgreSQL, il est probablement nécessaire d'ajouter le chemin vers `psql` dans la variable d'environnement PATH (ex : C:\Program Files\PostgreSQL\18\bin).
- Créer une base de données :
  ```sql
  psql -U postgres localhost
  CREATE DATABASE obc_planner;
  ```

### 5. **IntelliJ IDEA** (Community ou Ultimate)
- [Télécharger IntelliJ IDEA](https://www.jetbrains.com/fr/idea/)
- Extensions recommandées :
  - **Lombok**
  - **Flyway**
  - **SonarLint**
  - **Snyk**
  - **Github Copilot**

### 6. **Git**
- [Télécharger Git](https://git-scm.com/install/windows)
- Vérifier l'installation :
  ```bash
  git --version
  ```

### 7. **Postman**
- [Télécharger Postman](https://www.postman.com/downloads/)

---

## 🚀 Installation et Initialisation

### Cloner le Projet

```bash
git clone https://github.com/cosmoz-hex/obc-planner.git
cd obc-planner
```

### Backend - Spring Boot

#### 1. Ouvrir le projet dans IntelliJ IDEA

```bash
# Dans IntelliJ IDEA:
File → Open → obc-planner
```

#### 2. Configurer la base de données

Créer un fichier `back-end/src/main/resources/secure-application.properties` :

```properties
# DO NOT COMMIT THIS FILE
# This file is used to store sensitive information such as passwords, API keys, etc.
# This arguments is used in the application.properties file.

## TOMCAT CONFIGURATION
TOMCAT_PORT=8080

## DATABASE CONFIGURATION
DB_HOST=localhost
DB_PORT=5432
DB_NAME=obc_planner
DB_USERNAME=postgres
DB_PASSWORD=root
```

#### 3. Installer les dépendances Maven

```bash
cd back-end
mvn clean install
```

#### 4. (Optionnel) Désactiver Flyway pour le développement initial

Si vous n'avez pas encore de schéma BD, décommentez dans `application.properties` :

```properties
# spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
# spring.flyway.enabled=false
```

#### 5. Lancer le backend

```bash
# Via Maven
mvn spring-boot:run

# Ou dans IntelliJ IDEA:
Services → Spring Boot → 'Back-end'
```

✅ Le backend démarre sur `http://localhost:8080/api`

---

### Frontend - Angular

#### 1. Installer les dépendances

```bash
cd front-end
npm install
```

#### 2. Lancer le serveur de développement

```bash
# Via npm
npm start

# Ou dans IntelliJ IDEA:
Services → npm → 'Front-end'
```

✅ L'application démarre sur `http://localhost:4200`

---

## 📡 Tester l'API

### Avec Postman

1. Ouvrir **Postman**
2. Créer une nouvelle requête GET :
   - URL: `http://localhost:8080/api/test`
   - Méthode: `GET`
3. Cliquer sur **Send**

Réponse attendue :
```json
{
  "attr": "value"
}
```

### Avec curl

```bash
curl http://localhost:8080/api/test
```

---

**Dernière mise à jour :** 28 Juin 2026  
**Versions testées :** Angular 20, Spring Boot 4.1, Node.js 24.18.0
