# 📘 Module 1 — Configuration du Backend Symfony

> **FitTrack Backend | Documentation pédagogique**
> Niveau : Débutant en Symfony | Langue : Français

---

## 📋 Sommaire

1. [Vue d'ensemble du module](#1-vue-densemble-du-module)
2. [Analyse du projet Frontend existant](#2-analyse-du-projet-frontend-existant)
3. [Architecture proposée](#3-architecture-proposée)
4. [Schéma des entités et relations](#4-schéma-des-entités-et-relations)
5. [Structure du projet Symfony](#5-structure-du-projet-symfony)
6. [Les fichiers de configuration](#6-les-fichiers-de-configuration)
7. [Configuration de la base de données PostgreSQL](#7-configuration-de-la-base-de-données-postgresql)
8. [Configuration CORS (communication React ↔ Symfony)](#8-configuration-cors)
9. [Le Controller de santé (Health Check)](#9-le-controller-de-santé)
10. [Routes API](#10-routes-api)
11. [Tests et vérification](#11-tests-et-vérification)
12. [Plan des modules suivants](#12-plan-des-modules-suivants)
13. [Questions de validation](#13-questions-de-validation)

---

## 1. Vue d'ensemble du module

### Qu'est-ce que ce module fait ?

Le Module 1 est **la fondation de tout le Backend**. Avant d'écrire une seule ligne de logique métier (utilisateurs, exercices, séances...), on doit :

1. ✅ Comprendre ce que le Frontend React attend du Backend
2. ✅ Choisir une architecture claire et maintenable
3. ✅ Configurer la connexion à PostgreSQL
4. ✅ Configurer CORS pour permettre à React de parler à Symfony
5. ✅ Vérifier que tout fonctionne avec un endpoint `/api/health`

> **Analogie** : Imagine que tu construis une maison. Le Module 1, c'est les fondations et les branchements (eau, électricité). Sans ça, tu ne peux pas construire les murs (Module 2, 3...).

---

## 2. Analyse du projet Frontend existant

### Pages identifiées dans React

Voici toutes les pages présentes dans le Frontend, et ce que chacune attend du Backend :

| Page React | Chemin fichier | Données nécessaires au Backend |
|------------|---------------|-------------------------------|
| **AuthPage** | `pages/auth/AuthPage.tsx` | Inscription (nom, email, mot de passe, objectif), Connexion |
| **DashboardPage** | `pages/dashboard/DashboardPage.tsx` | Stats générales, dernières sessions, programmes actifs |
| **ProfilePage** | `pages/profile/ProfilePage.tsx` | Profil utilisateur (nom, email, âge, taille, objectif, niveau) |
| **WorkoutsPage** | `pages/workouts/WorkoutsPage.tsx` | Liste des sessions d'entraînement (CRUD complet) |
| **CreateWorkoutPage** | `pages/workouts/CreateWorkoutPage.tsx` | Créer une session avec exercises (nom, sets, reps, poids, repos) |
| **ExercisesPage** | `pages/exercises/ExercisesPage.tsx` | Bibliothèque d'exercices (filtres par muscle, recherche) |
| **ProgramsPage** | `pages/programs/ProgramsPage.tsx` | Programmes d'entraînement (CRUD, progression, statut) |
| **ProgramDetailsPage** | `pages/programs/ProgramDetailsPage.tsx` | Détails d'un programme avec planning hebdomadaire |
| **MeasurementsPage** | `pages/measurements/MeasurementsPage.tsx` | Mesures corporelles (poids, IMC, tour de taille, etc.) |
| **StatisticsPage** | `pages/statistics/StatisticsPage.tsx` | Statistiques et graphiques de progression |
| **CalendarPage** | `pages/calendar/CalendarPage.tsx` | Calendrier des entraînements |
| **AchievementsPage** | `pages/achievements/AchievementsPage.tsx` | Badges et récompenses débloqués |
| **SettingsPage** | `pages/settings/SettingsPage.tsx` | Paramètres du compte |

### Types TypeScript → Entités Symfony

Le Frontend définit ses types dans `src/types/index.ts`. Ces types **deviennent nos entités Doctrine** :

```typescript
// Frontend TypeScript               →  Entité Symfony / table PostgreSQL
UserProfile         → Entity\User
WorkoutSession      → Entity\WorkoutSession
ExerciseItem        → Entity\Exercise
ProgramItem         → Entity\Program
MeasurementRecord   → Entity\Measurement
BadgeItem           → Entity\Achievement (optionnel, Module 7+)
ScheduleDay         → (lié à Program → ProgramDay)
```

### Données mock analysées (mockData.ts)

Le fichier `src/data/mockData.ts` contient les données statiques actuelles du Frontend. Ce sont ces données que notre Backend va **remplacer dynamiquement** :

**Utilisateur courant :**
```typescript
{
  name: "Alex Morgan",
  email: "alex@fittrack.app",
  age: "28",
  height: "180 cm",
  goal: "Muscle gain",          // → ENUM: weight_loss, muscle_gain, general_fitness
  level: "Intermediate",         // → ENUM: beginner, intermediate, advanced
  memberSince: "September 12, 2023",
  plan: "FitTrack Pro",
  visibility: "Private"
}
```

**Session d'entraînement :**
```typescript
{
  id: "w1",
  name: "Push strength",
  type: "Strength",             // → ENUM: strength, hypertrophy, conditioning, cardio, mobility
  duration: "60 min",           // → INTEGER en minutes
  intensity: "High",            // → ENUM: high, medium, low
  date: "Today",                // → DATETIME
  exercisesCount: "7 exercises" // → calculé automatiquement
}
```

**Exercice :**
```typescript
{
  name: "Barbell Back Squat",
  muscle: "Quadriceps",         // → Relation vers Category
  level: "Advanced"             // → ENUM: beginner, intermediate, advanced
}
```

---

## 3. Architecture proposée

### Choix techniques et pourquoi

#### Symfony 7.4 — Pourquoi Symfony ?

Symfony est un framework PHP professionnel très utilisé en France et en Europe. Il est :
- **Modulaire** : tu n'utilises que ce dont tu as besoin
- **Bien documenté** : documentation officielle excellente
- **Standard** : respecte les standards PHP (PSR)
- **Idéal pour les API REST** : avec le Serializer et les JsonResponse

#### API REST — Pourquoi pas GraphQL ou WebSocket ?

L'approche **REST** est la plus simple et la plus adaptée pour un projet universitaire :
- Chaque URL correspond à une ressource (`/api/workouts`, `/api/exercises`)
- Les méthodes HTTP définissent l'action (GET=lire, POST=créer, PUT=modifier, DELETE=supprimer)
- Le format de réponse est toujours **JSON**

#### JWT pour l'authentification (Module 2)

Au lieu des sessions PHP classiques (qui ne fonctionnent pas bien avec React), nous utiliserons **JWT (JSON Web Token)** :
- React reçoit un token lors de la connexion
- React envoie ce token dans chaque requête (`Authorization: Bearer <token>`)
- Symfony vérifie le token et identifie l'utilisateur

#### Doctrine ORM — Pourquoi pas SQL brut ?

Doctrine est un ORM (*Object Relational Mapper*). Il fait la traduction entre le code PHP et la base de données :
- Tu écris du code PHP (des classes appelées "Entités")
- Doctrine traduit automatiquement en SQL
- Les migrations gèrent l'évolution de la structure de la base de données

---

## 4. Schéma des entités et relations

### Vue d'ensemble des entités (Modules 1 à 6)

```
┌─────────────────────────────────────────────────────────────────┐
│                         BASE DE DONNÉES FITTRACK                │
│                                                                 │
│  ┌──────────────┐     ┌──────────────────┐    ┌─────────────┐  │
│  │     User     │────<│  WorkoutSession  │>───│  Exercise   │  │
│  ├──────────────┤     ├──────────────────┤    ├─────────────┤  │
│  │ id           │     │ id               │    │ id          │  │
│  │ firstName    │     │ user_id (FK)     │    │ name        │  │
│  │ lastName     │     │ name             │    │ muscle      │  │
│  │ email        │     │ type             │    │ level       │  │
│  │ password     │     │ duration         │    │ category_id │  │
│  │ age          │     │ intensity        │    └──────┬──────┘  │
│  │ height       │     │ date             │           │         │
│  │ fitnessGoal  │     └────────┬─────────┘    ┌──────▼──────┐  │
│  │ level        │              │              │  Category   │  │
│  │ roles        │              │              ├─────────────┤  │
│  │ createdAt    │     ┌────────▼─────────┐    │ id          │  │
│  └──────┬───────┘     │  SessionExercise │    │ name        │  │
│         │             ├──────────────────┤    └─────────────┘  │
│         │             │ id               │                     │
│  ┌──────▼───────┐     │ session_id (FK)  │                     │
│  │  Measurement │     │ exercise_id (FK) │                     │
│  ├──────────────┤     │ sets             │                     │
│  │ id           │     │ reps             │    ┌─────────────┐  │
│  │ user_id (FK) │     │ weight           │    │   Program   │  │
│  │ date         │     │ restTime         │    ├─────────────┤  │
│  │ weight       │     │ orderIndex       │    │ id          │  │
│  │ bodyFat      │     └──────────────────┘    │ user_id(FK) │  │
│  │ waist        │                             │ name        │  │
│  │ chest        │                             │ description │  │
│  │ arms         │                             │ durationWks │  │
│  └──────────────┘                             │ frequency   │  │
│                                               │ status      │  │
│                                               │ startDate   │  │
│                                               │ progress    │  │
│                                               └─────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Relations expliquées

| Relation | Description | Type |
|----------|-------------|------|
| User → WorkoutSession | Un utilisateur a plusieurs sessions | **OneToMany** |
| User → Measurement | Un utilisateur a plusieurs mesures | **OneToMany** |
| User → Program | Un utilisateur a plusieurs programmes | **OneToMany** |
| WorkoutSession → SessionExercise | Une session contient plusieurs exercices | **OneToMany** |
| SessionExercise → Exercise | Chaque ligne de session pointe vers un exercice | **ManyToOne** |
| Exercise → Category | Un exercice appartient à une catégorie | **ManyToOne** |

> **Explication OneToMany** : "Un User possède MANY (plusieurs) WorkoutSessions"
> **Explication ManyToOne** : "Many (plusieurs) WorkoutSessions appartiennent à ONE (un) User"

---

## 5. Structure du projet Symfony

### Dossiers importants du Backend

```
backend/
├── bin/
│   └── console                 ← Outil en ligne de commande Symfony
├── config/
│   ├── packages/
│   │   ├── doctrine.yaml       ← Config base de données
│   │   ├── security.yaml       ← Config authentification
│   │   ├── nelmio_cors.yaml    ← Config CORS (React ↔ Symfony)
│   │   └── framework.yaml      ← Config générale Symfony
│   ├── routes.yaml             ← Définition des routes (optionnel)
│   └── services.yaml           ← Injection de dépendances
├── migrations/                 ← Fichiers de migration de BDD
├── public/
│   └── index.php               ← Point d'entrée HTTP (ne pas modifier)
├── src/
│   ├── Controller/             ← 🎯 Reçoit les requêtes HTTP
│   │   └── HealthController.php
│   ├── Entity/                 ← 🗄️ Représentation des tables BDD
│   ├── Repository/             ← 🔍 Requêtes vers la BDD
│   ├── Service/                ← 🧠 Logique métier (à créer)
│   └── Kernel.php              ← Cœur de Symfony (ne pas modifier)
├── var/
│   ├── cache/                  ← Cache Symfony (auto-géré)
│   └── log/                    ← Logs de l'application
├── vendor/                     ← Dépendances PHP (Composer)
├── .env                        ← Variables d'environnement
├── composer.json               ← Liste des dépendances PHP
└── symfony.lock                ← Versions verrouillées
```

### Rôle de chaque couche (Architecture MVC)

Symfony suit le pattern **MVC** (Modèle - Vue - Contrôleur). Dans notre cas d'API REST :

```
Requête HTTP (depuis React)
        ↓
   CONTROLLER          ← Reçoit la requête, coordonne la réponse
        ↓
   SERVICE (optionnel) ← Logique métier complexe
        ↓
   REPOSITORY          ← Communique avec la base de données
        ↓
   ENTITY              ← Représente les données (une table = une Entity)
        ↓
   BASE DE DONNÉES (PostgreSQL)
        ↓
   Réponse JSON        ← Retourne au Controller → React
```

---

## 6. Les fichiers de configuration

### 6.1 Le fichier `.env`

**Chemin :** `backend/.env`

```ini
# Environnement de l'application
APP_ENV=dev        # dev = développement, prod = production, test = tests
APP_SECRET=        # Clé secrète pour sécuriser l'app (générer une valeur unique)

# URL de connexion PostgreSQL
DATABASE_URL="postgresql://app:!ChangeMe!@127.0.0.1:5432/app?serverVersion=16&charset=utf8"
# Format : postgresql://UTILISATEUR:MOT_DE_PASSE@HOTE:PORT/NOM_BDD

# CORS : origines autorisées à faire des requêtes
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'
```

> **⚠️ Important :** Ne jamais mettre le vrai mot de passe de production dans `.env`. Pour le développement local, c'est acceptable.

**Ce que tu dois modifier pour connecter ta BDD locale :**
```ini
DATABASE_URL="postgresql://postgres:TON_MOT_DE_PASSE@127.0.0.1:5432/fittrack"
```

### 6.2 Le fichier `config/packages/doctrine.yaml`

Ce fichier configure comment Doctrine communique avec PostgreSQL.

```yaml
doctrine:
    dbal:
        # Lit l'URL depuis la variable DATABASE_URL dans .env
        url: '%env(resolve:DATABASE_URL)%'
    orm:
        # Génère automatiquement les classes proxy de Doctrine
        auto_generate_proxy_classes: true
        
        # Stratégie de nommage : convertit camelCase PHP → snake_case SQL
        # Ex: firstName (PHP) → first_name (colonne BDD)
        naming_strategy: doctrine.orm.naming_strategy.underscore_number_aware
        
        # Détecte automatiquement les Entités dans src/Entity/
        auto_mapping: true
        mappings:
            App:
                type: attribute      # Utilise les #[Attributs PHP 8] pour les annotations
                dir: '%kernel.project_dir%/src/Entity'
                prefix: 'App\Entity'
```

**Explication de `naming_strategy`:**
- En PHP, on écrit : `$firstName` (camelCase)
- En SQL, Doctrine crée : `first_name` (snake_case)
- Cette convention est automatique grâce à `underscore_number_aware`

### 6.3 Le fichier `config/packages/nelmio_cors.yaml` (CORS)

**CORS = Cross-Origin Resource Sharing**

> **Le problème :** Ton navigateur empêche par défaut React (sur `localhost:3000`) de faire des requêtes vers Symfony (sur `localhost:8000`). C'est une protection de sécurité du navigateur appelée "Same-Origin Policy".

> **La solution :** Symfony doit dire au navigateur : "C'est ok, j'autorise les requêtes venant de localhost". C'est le rôle du CORS.

```yaml
nelmio_cors:
    defaults:
        origin_regex: true
        # Autorise les requêtes depuis localhost (tous les ports)
        allow_origin: ['%env(CORS_ALLOW_ORIGIN)%']
        
        # Méthodes HTTP autorisées
        allow_methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE']
        
        # En-têtes autorisés dans les requêtes
        # Content-Type: pour les requêtes JSON
        # Authorization: pour le token JWT (Module 2)
        allow_headers: ['Content-Type', 'Authorization']
        
        max_age: 3600  # Cache la réponse CORS pendant 1 heure
    paths:
        # Applique ces règles sur toutes les routes /api/
        '^/api/': null
```

**Comment React enverra une requête :**
```javascript
// React fait une requête vers Symfony
fetch('http://localhost:8000/api/workouts', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token_jwt>'  // Module 2
  }
})
```

---

## 7. Configuration de la base de données PostgreSQL

### Étapes pour configurer PostgreSQL

#### Étape 1 : Vérifier que PostgreSQL est installé

```bash
psql --version
# Résultat attendu : psql (PostgreSQL) 16.x
```

#### Étape 2 : Créer la base de données FitTrack

Méthode 1 — Via la ligne de commande Symfony (recommandée) :
```bash
# Depuis le dossier backend/
php bin/console doctrine:database:create
# Crée la base de données "fittrack" automatiquement
```

Méthode 2 — Via psql directement :
```sql
CREATE DATABASE fittrack;
CREATE USER fittrack_user WITH PASSWORD 'mon_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE fittrack TO fittrack_user;
```

#### Étape 3 : Modifier le fichier `.env`

```ini
# Remplace la ligne DATABASE_URL par :
DATABASE_URL="postgresql://postgres:TON_MOT_DE_PASSE@127.0.0.1:5432/fittrack?serverVersion=16&charset=utf8"
```

#### Étape 4 : Tester la connexion

```bash
php bin/console doctrine:schema:validate
# Si la BDD est vide, Symfony dira que le schéma n'est pas synchronisé
# C'est normal car on n'a pas encore créé d'entités
```

### Comprendre l'URL de connexion

```
postgresql://postgres:motdepasse@127.0.0.1:5432/fittrack?serverVersion=16&charset=utf8
│            │       │           │         │    │         │                │
│            │       │           │         │    │         │                └─ Encodage : UTF-8
│            │       │           │         │    │         └─ Version PostgreSQL
│            │       │           │         │    └─ Nom de la base de données
│            │       │           │         └─ Port par défaut de PostgreSQL
│            │       │           └─ Adresse du serveur (ici : ma machine locale)
│            │       └─ Mot de passe
│            └─ Nom d'utilisateur
└─ Protocole (type de base de données)
```

---

## 8. Configuration CORS

### Pourquoi le CORS est crucial pour notre projet

```
SANS CORS :
React (localhost:3000) → Symfony (localhost:8000)
                      ✗ BLOQUÉ par le navigateur
                      "CORS Error: Access-Control-Allow-Origin missing"

AVEC CORS correctement configuré :
React (localhost:3000) → Symfony (localhost:8000)
                      ✓ AUTORISÉ
                      Le navigateur laisse passer la requête
```

### Le bundle NelmioCors

Le projet utilise déjà `nelmio/cors-bundle`. C'est un bundle Symfony qui gère automatiquement les en-têtes CORS.

**Vérification de l'installation :**
```bash
composer show nelmio/cors-bundle
# Doit afficher la version installée
```

### Test du CORS depuis React

Lorsque React fait une requête vers Symfony, le navigateur envoie d'abord une **requête préliminaire** appelée "preflight" (méthode OPTIONS) :

```
1. React → Symfony : OPTIONS /api/health
   En-têtes envoyés : Origin: http://localhost:3000

2. Symfony → React : 200 OK
   En-têtes retournés :
   Access-Control-Allow-Origin: http://localhost:3000
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE
   Access-Control-Allow-Headers: Content-Type, Authorization

3. Maintenant React peut faire la vraie requête :
   React → Symfony : GET /api/health
```

---

## 9. Le Controller de santé

### Chemin du fichier

`backend/src/Controller/HealthController.php`

### Code complet

```php
<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class HealthController extends AbstractController
{
    #[Route('/api/health', name: 'api_health', methods: ['GET'], format: 'json')]
    public function __invoke(): JsonResponse
    {
        return $this->json([
            'status' => 'ok',
            'service' => 'fittrack-api',
        ]);
    }
}
```

### Explication bloc par bloc

#### Le namespace
```php
namespace App\Controller;
```
- Chaque fichier PHP dans Symfony doit déclarer son **namespace** (espace de nom)
- C'est comme une adresse postale pour la classe
- `App\Controller` signifie que ce fichier est dans le dossier `src/Controller/`

#### Les imports (use)
```php
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
```
- `AbstractController` : classe parente qui donne accès à des méthodes utiles (`json()`, `getUser()`, etc.)
- `JsonResponse` : représente une réponse HTTP au format JSON
- `Route` : attribut PHP 8 pour définir l'URL de la route

#### La classe
```php
final class HealthController extends AbstractController
```
- `final` : cette classe ne peut pas être étendue (héritée) — bonne pratique
- `extends AbstractController` : hérite des méthodes de base de Symfony

#### L'attribut de route
```php
#[Route('/api/health', name: 'api_health', methods: ['GET'], format: 'json')]
```
| Paramètre | Valeur | Explication |
|-----------|--------|-------------|
| `/api/health` | URL | L'URL complète sera `http://localhost:8000/api/health` |
| `name: 'api_health'` | Nom interne | Identifiant unique pour générer des URLs en PHP |
| `methods: ['GET']` | Méthode HTTP | Seulement les requêtes GET sont acceptées |
| `format: 'json'` | Format | La réponse sera du JSON |

#### La méthode `__invoke()`
```php
public function __invoke(): JsonResponse
```
- `__invoke()` est une méthode magique PHP : quand la classe est utilisée comme une fonction, c'est cette méthode qui s'exécute
- C'est un pattern moderne de Symfony appelé **"Invokable Controller"** : un fichier = un Controller = une route
- `: JsonResponse` indique le type de retour (PHP 7+ typage)

#### La réponse JSON
```php
return $this->json([
    'status' => 'ok',
    'service' => 'fittrack-api',
]);
```
- `$this->json()` est une méthode héritée de `AbstractController`
- Elle convertit un tableau PHP en JSON et crée une `JsonResponse`
- Par défaut, le code HTTP est 200 (succès)

### Résultat attendu

Quand tu appelles `GET http://localhost:8000/api/health` :
```json
{
  "status": "ok",
  "service": "fittrack-api"
}
```

---

## 10. Routes API

### Conventions de nommage des routes

Toutes nos routes suivront le préfixe `/api/`. Voici l'aperçu complet (sera développé module par module) :

| Méthode | Route | Description | Module |
|---------|-------|-------------|--------|
| GET | `/api/health` | Vérification que l'API fonctionne | 1 ✅ |
| POST | `/api/register` | Inscription | 2 |
| POST | `/api/login` | Connexion | 2 |
| GET | `/api/me` | Profil de l'utilisateur connecté | 3 |
| PUT | `/api/me` | Modifier le profil | 3 |
| GET | `/api/exercises` | Liste des exercices | 4 |
| POST | `/api/exercises` | Créer un exercice | 4 |
| GET | `/api/exercises/{id}` | Détail d'un exercice | 4 |
| PUT | `/api/exercises/{id}` | Modifier un exercice | 4 |
| DELETE | `/api/exercises/{id}` | Supprimer un exercice | 4 |
| GET | `/api/programs` | Liste des programmes | 5 |
| POST | `/api/programs` | Créer un programme | 5 |
| GET | `/api/workouts` | Liste des sessions | 6 |
| POST | `/api/workouts` | Créer une session | 6 |

### Afficher les routes existantes

```bash
php bin/console debug:router
# Liste toutes les routes définies dans le projet
```

Résultat attendu (Module 1) :
```
 Name           Method  Path
 api_health     GET     /api/health
```

---

## 11. Tests et vérification

### 11.1 Démarrer le serveur Symfony

```bash
# Depuis le dossier backend/
php -S localhost:8000 -t public/

# OU avec le CLI Symfony (si installé) :
symfony serve --port=8000
```

**Explication :**
- `php -S localhost:8000` : démarre le serveur web intégré de PHP
- `-t public/` : le dossier racine du serveur est `public/` (où se trouve `index.php`)

### 11.2 Tester le Health Check

#### Avec cURL (terminal) :
```bash
curl -X GET http://localhost:8000/api/health
# Résultat : {"status":"ok","service":"fittrack-api"}
```

#### Avec Postman :
```
Méthode : GET
URL     : http://localhost:8000/api/health
Headers : (aucun nécessaire)
```

**Réponse attendue :**
```json
{
  "status": "ok",
  "service": "fittrack-api"
}
```
Code HTTP : `200 OK`

### 11.3 Tester le CORS

```bash
curl -X OPTIONS http://localhost:8000/api/health \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

**Tu dois voir dans la réponse :**
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, OPTIONS, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 11.4 Vérifier la connexion à la base de données

```bash
php bin/console doctrine:schema:validate
```

Si la BDD est configurée correctement mais vide :
```
[Mapping]  OK - The mapping files are correct.
[Database] FAIL - The database schema is not in sync with the current mapping file.
```
> C'est **normal** à ce stade, car on n'a pas encore créé d'entités (Module 2).

### 11.5 Afficher les informations de configuration

```bash
php bin/console debug:config doctrine
# Affiche la configuration Doctrine actuelle
```

```bash
php bin/console about
# Affiche les informations générales du projet Symfony
```

---

## 12. Plan des modules suivants

Basé sur l'analyse complète du Frontend, voici le plan de développement adapté :

### Module 2 — Authentification et Utilisateurs
**Packages à installer :**
- `lexik/jwt-authentication-bundle` → Authentification par token JWT
- `symfony/security-bundle` → Déjà installé

**Ce que nous allons créer :**
- Entité `User` (table `users`)
- `POST /api/register` → Inscription
- `POST /api/login` → Connexion → Retourne un JWT token
- `POST /api/logout` → Déconnexion
- Protection des routes avec le token

**Données du formulaire React :**
```json
// Register
{ "firstName": "Alex", "lastName": "Morgan", "email": "alex@fittrack.app", 
  "password": "motdepasse", "fitnessGoal": "muscle_gain" }

// Login
{ "email": "alex@fittrack.app", "password": "motdepasse" }
```

### Module 3 — Profil et Préférences
- `GET /api/me` → Récupérer le profil de l'utilisateur connecté
- `PUT /api/me` → Modifier nom, email, âge, taille, objectif, niveau
- `PUT /api/me/password` → Modifier le mot de passe

### Module 4 — Exercices
- Entité `Exercise` + `Category`
- CRUD complet sur les exercices
- Filtrage par muscle/catégorie
- Recherche par nom

### Module 5 — Programmes d'entraînement
- Entité `Program`
- CRUD programmes
- Gestion du statut (ACTIVE, DRAFT)
- Suivi de la progression (progress %)

### Module 6 — Sessions d'entraînement (Workouts)
- Entité `WorkoutSession` + `SessionExercise`
- Création d'une session avec ses exercices (sets, reps, poids, temps de repos)
- Historique des sessions
- Calcul automatique du nombre d'exercices

---

## 13. Questions de validation

Avant de passer au Module 2, vérifie que tu peux répondre à ces questions :

### Questions de compréhension

1. **Qu'est-ce qu'une API REST ?**
   *(Piste : parle des URLs, méthodes HTTP, et format JSON)*

2. **Pourquoi utilise-t-on CORS ?**
   *(Piste : React et Symfony sont sur des ports différents)*

3. **Quelle est la différence entre un Controller, une Entity et un Repository dans Symfony ?**

4. **Pourquoi utilise-t-on Doctrine ORM plutôt que du SQL brut ?**

5. **Dans le fichier `.env`, à quoi sert `DATABASE_URL` ?**

6. **Qu'est-ce qu'une migration Doctrine ? Pourquoi c'est important ?**
   *(Piste : réfléchis à comment la structure de la BDD évolue dans le temps)*

7. **En regardant le Frontend, cite 3 données que l'Entity `User` doit stocker.**

8. **Qu'est-ce qu'une relation OneToMany ? Donne un exemple concret de FitTrack.**

### Exercices pratiques

1. Lance le serveur Symfony et teste `/api/health` avec Postman
2. Affiche la liste des routes avec `php bin/console debug:router`
3. Configure correctement le `.env` avec tes informations PostgreSQL
4. Lance `php bin/console doctrine:database:create` et vérifie que la base de données est créée

---

## 📌 Résumé du Module 1

| Élément | Statut | Description |
|---------|--------|-------------|
| Projet Symfony 7.4 | ✅ Existant | Framework backend PHP |
| PostgreSQL configuré | ⚙️ À configurer | Variable DATABASE_URL dans .env |
| CORS NelmioCors | ✅ Configuré | Autorise React (localhost:3000) |
| Doctrine ORM | ✅ Configuré | Mappage PHP ↔ BDD automatique |
| Health Check | ✅ Fonctionnel | `GET /api/health` |
| Architecture MVC | ✅ Comprise | Controller / Repository / Entity |
| Schéma des entités | ✅ Planifié | 6 entités identifiées |
| Plan des modules | ✅ Défini | Modules 2 à 6 planifiés |

---

## 🔧 Fichiers créés / modifiés dans ce module

| Fichier | Action | Description |
|---------|--------|-------------|
| `backend/.env` | Modifié | Ajout d'un APP_SECRET par défaut |
| `backend/.env.local` | **Créé** | ⚠️ Configuration locale (à personnaliser avec ton mot de passe PostgreSQL) |
| `backend/src/Controller/HealthController.php` | Amélioré | Ajout de `version` et `timestamp` dans la réponse |
| `backend/src/Service/.gitkeep` | Créé | Prépare le dossier Service pour les modules suivants |
| `backend/README_MODULE_1.md` | **Créé** | Ce fichier de documentation |

---

*📅 Module développé le : 15 novembre 2026*
*👨‍💻 Projet : FitTrack — Application de suivi sportif*
*🔧 Technologie : Symfony 7.4 + PostgreSQL + React*
