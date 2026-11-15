# 📘 Module 2 — Authentification & Utilisateurs

> **FitTrack Backend | Documentation pédagogique**
> Niveau : Débutant en Symfony | Langue : Français

---

## 📋 Sommaire

1. [Objectif du module](#1-objectif-du-module)
2. [Comprendre JWT — La théorie](#2-comprendre-jwt--la-théorie)
3. [Installation du bundle JWT](#3-installation-du-bundle-jwt)
4. [L'entité User — La table `users`](#4-lentité-user--la-table-users)
5. [Le UserRepository — Requêtes BDD](#5-le-userrepository--requêtes-bdd)
6. [Configuration Security — security.yaml](#6-configuration-security--securityyaml)
7. [Configuration JWT — lexik_jwt_authentication.yaml](#7-configuration-jwt--lexik_jwt_authenticationyaml)
8. [AuthController — Inscription et déconnexion](#8-authcontroller--inscription-et-déconnexion)
9. [MeController — Profil utilisateur](#9-mecontroller--profil-utilisateur)
10. [La migration Doctrine — Créer la table en BDD](#10-la-migration-doctrine--créer-la-table-en-bdd)
11. [Routes API créées](#11-routes-api-créées)
12. [Tests Postman](#12-tests-postman)
13. [Communication React ↔ Symfony](#13-communication-react--symfony)
14. [Questions de validation](#14-questions-de-validation)

---

## 1. Objectif du module

Le Module 2 met en place **le système complet d'authentification** de FitTrack. Sans authentification, n'importe qui pourrait lire ou modifier les données de n'importe quel utilisateur — c'est inacceptable.

Ce que nous construisons :

```
Utilisateur (React)                   Symfony Backend
       │                                     │
       │  POST /api/register                 │
       │  { email, password, ... } ─────────▶│ Crée le compte en BDD
       │  ◀── 201 { user } ─────────────────│
       │                                     │
       │  POST /api/login                    │
       │  { email, password } ───────────────▶│ Vérifie email+mdp
       │  ◀── 200 { token: "eyJ..." } ───────│ Retourne un token JWT
       │                                     │
       │  GET /api/me                        │
       │  Authorization: Bearer eyJ... ──────▶│ Vérifie le token
       │  ◀── 200 { profil utilisateur } ────│ Retourne le profil
```

---

## 2. Comprendre JWT — La théorie

### Qu'est-ce qu'un JWT ?

**JWT = JSON Web Token**. C'est un "billet numérique" signé qui prouve l'identité d'un utilisateur.

### Anatomie d'un token JWT

Un token ressemble à ça :
```
eyJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3MzE2MDAwMDAsImV4cCI6MTczMTY4NjQwMH0.SIGNATURE
│─────── HEADER ────│ │───────────────── PAYLOAD ─────────────────────────│ │─ SIG ─│
```

Il est composé de 3 parties séparées par des points (`.`), chacune encodée en **Base64** :

#### Partie 1 — Header (En-tête)
```json
{
  "alg": "RS256",   ← Algorithme de signature (RSA 256-bit)
  "typ": "JWT"      ← Type de token
}
```

#### Partie 2 — Payload (Données)
```json
{
  "iat": 1731600000,              ← "issued at" = date de création (timestamp Unix)
  "exp": 1731686400,              ← "expires at" = date d'expiration
  "roles": ["ROLE_USER"],         ← Rôles de l'utilisateur
  "username": "alex@fittrack.app" ← Identifiant (email)
}
```
> ⚠️ Ces données sont visibles par tout le monde (juste encodées, pas chiffrées).
> Ne jamais mettre de mot de passe ou d'infos sensibles dans le payload !

#### Partie 3 — Signature
Créée avec la clé privée RSA. Symfony vérifie la signature avec la clé publique.
Si quelqu'un modifie le payload, la signature devient invalide → le token est rejeté.

### Comparaison Session vs JWT

| Sessions PHP | JWT |
|---|---|
| Données stockées **côté serveur** | Données stockées **côté client** (React) |
| Symfony doit mémoriser chaque session | Symfony vérifie juste la signature |
| Problème avec plusieurs serveurs | Fonctionne avec n'importe quel nombre de serveurs |
| Pas adapté aux API REST | Fait pour les API REST |

### Flux complet d'authentification

```
1. Connexion
   React → POST /api/login { email, password }
   Symfony → Vérifie BDD → Génère token JWT → Retourne token

2. Utilisation
   React stocke le token (localStorage ou mémoire)
   React → GET /api/me (Authorization: Bearer TOKEN)
   Symfony → Vérifie token → Charge utilisateur BDD → Retourne données

3. Expiration
   Après 1 heure → Token invalide
   Symfony → 401 Unauthorized
   React → Redirige vers page de connexion
```

---

## 3. Installation du bundle JWT

### Commande à exécuter

```bash
# Depuis le dossier backend/
composer require lexik/jwt-authentication-bundle
```

**Ce que Symfony Flex fait automatiquement :**
- Ajoute le bundle dans `composer.json`
- Enregistre `LexikJWTAuthenticationBundle` dans `config/bundles.php`
- Crée `config/packages/lexik_jwt_authentication.yaml`
- Ajoute les variables JWT dans `.env`

### Générer les clés RSA

Après l'installation, tu dois générer la paire de clés (privée + publique) :

```bash
php bin/console lexik:jwt:generate-keypair
```

Cette commande crée :
- `config/jwt/private.pem` → Clé privée (signe les tokens) — **JAMAIS partager !**
- `config/jwt/public.pem`  → Clé publique (vérifie les tokens) — peut être partagée

> **Analogie :** La clé privée c'est ton tampon officiel. La clé publique c'est comme le sceau officiel que tout le monde peut vérifier mais personne ne peut reproduire sans le tampon.

### Ajouter les variables dans `.env.local`

```ini
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=fittrack_jwt_passphrase_change_me
```

---

## 4. L'entité User — La table `users`

**Chemin :** `backend/src/Entity/User.php`

### Structure de la table générée

Quand on exécute la migration, Doctrine crée cette table PostgreSQL :

```sql
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    first_name      VARCHAR(100)        NOT NULL,
    last_name       VARCHAR(100)        NOT NULL,
    email           VARCHAR(180)        NOT NULL UNIQUE,
    age             INTEGER             NULL,
    height          INTEGER             NULL,
    fitness_goal    VARCHAR(50)         NULL,
    experience_level VARCHAR(50)        NULL,
    roles           JSON                NOT NULL DEFAULT '[]',
    password        VARCHAR(255)        NOT NULL,
    created_at      TIMESTAMP           NOT NULL,
    updated_at      TIMESTAMP           NOT NULL
);
```

> **Rappel :** Doctrine traduit automatiquement `camelCase` PHP → `snake_case` SQL :
> `firstName` PHP → `first_name` SQL

### Les attributs PHP importants

#### `#[ORM\Entity]`
```php
#[ORM\Entity(repositoryClass: UserRepository::class)]
```
Dit à Doctrine : "Cette classe correspond à une table, utilise UserRepository pour les requêtes."

#### `#[ORM\Table(name: 'users')]`
Définit le nom exact de la table en BDD. Sans ça, Doctrine utiliserait `user` (sans 's'), ce qui est un mot réservé en PostgreSQL — ça causerait une erreur !

#### `#[ORM\Column]`
Marque une propriété comme colonne de la table.
Options principales :
- `length: 100` → VARCHAR(100)
- `unique: true` → Contrainte UNIQUE
- `nullable: true` → Peut être NULL
- `type: 'json'` → Stocké en JSON (PostgreSQL supporte ça nativement)

#### `#[ORM\HasLifecycleCallbacks]`
Active les callbacks automatiques `#[ORM\PrePersist]` et `#[ORM\PreUpdate]`.

#### Les contraintes de validation `#[Assert\...]`
```php
#[Assert\NotBlank(message: 'Le prénom est obligatoire.')]
#[Assert\Email(message: 'L\'email n\'est pas valide.')]
#[Assert\Choice(choices: ['muscle_gain', ...])]
```
Ces annotations définissent des règles de validation **PHP-side**. Le Validator Symfony les vérifie avant de sauvegarder en BDD.

### Pourquoi `implements UserInterface` ?

Symfony Security a besoin que l'entité User implémente `UserInterface` pour savoir :
- Comment identifier l'utilisateur → `getUserIdentifier()` (retourne l'email)
- Quels sont ses rôles → `getRoles()` (retourne `['ROLE_USER']`)
- Effacer les données sensibles → `eraseCredentials()`

### Pourquoi `implements PasswordAuthenticatedUserInterface` ?

Pour que Symfony sache que cet utilisateur a un mot de passe hashé → `getPassword()`.

### Gestion stricte des rôles : Enum UserRole

FitTrack utilise une énumération PHP native (`App\Enum\UserRole`) pour gérer de manière sécurisée les rôles d'utilisateurs. Seules deux valeurs sont acceptées :

```php
enum UserRole: string
{
    case ATHLETE = 'athlete'; // Rôle standard attribué par défaut
    case ADMIN   = 'admin';   // Rôle d'administration réservé
}
```

#### Principes de sécurité appliqués :
1. **Attribution automatique :** Lors de l'inscription (`POST /api/register`), le rôle est **systématiquement forcé à `'athlete'`**. Toute valeur transmise dans le corps de requête (`role`, `roles`, etc.) est délibérément ignorée par Symfony pour empêcher toute élévation de privilèges.
2. **Immutabilité par le profil :** L'endpoint `PUT /api/me` n'autorise aucune modification du champ `roles`. Un utilisateur ne peut pas changer son propre rôle.
3. **Hiérarchie et protection des routes :**
   - `ROLE_ADMIN` hérite des prérogatives de `ROLE_ATHLETE` et `ROLE_USER`.
   - Les routes sous `/api/admin` sont protégées par `#[IsGranted('ROLE_ADMIN')]` et renvoient une erreur **403 Forbidden** en cas de tentative d'accès par un athlète.
4. **Promotion sécurisée :** Seule la commande console dédiée `php bin/console app:promote-admin <email>` permet à un administrateur d'accorder le rôle `admin`.

---

## 5. Le UserRepository — Requêtes BDD

**Chemin :** `backend/src/Repository/UserRepository.php`

### Méthodes héritées disponibles gratuitement

```php
// Cherche par ID
$user = $userRepository->find(1);

// Retourne tous les utilisateurs
$users = $userRepository->findAll();

// Cherche avec un critère
$user = $userRepository->findOneBy(['email' => 'alex@fittrack.app']);

// Cherche plusieurs avec critères
$users = $userRepository->findBy(['fitnessGoal' => 'muscle_gain']);
```

### Méthodes personnalisées ajoutées

```php
// Cherche par email
$user = $userRepository->findByEmail('alex@fittrack.app');

// Vérifie si un email existe déjà
$exists = $userRepository->emailExists('alex@fittrack.app');  // true/false

// Sauvegarde (INSERT ou UPDATE)
$userRepository->save($user);

// Supprime
$userRepository->remove($user);
```

### La méthode `save($user, $flush)`

```php
public function save(User $user, bool $flush = true): void
{
    $this->getEntityManager()->persist($user);  // "Surveille cet objet"
    if ($flush) {
        $this->getEntityManager()->flush();     // "Exécute le SQL maintenant"
    }
}
```

**Différence persist vs flush :**
- `persist()` = "Doctrine, cet objet a changé, prépare le SQL"
- `flush()` = "Exécute maintenant tous les SQL préparés"

Séparer les deux permet d'optimiser : on peut persister 10 objets, puis faire un seul flush (une seule transaction SQL).

---

## 6. Configuration Security — security.yaml

**Chemin :** `backend/config/packages/security.yaml`

### Les 4 sections principales

#### 1. `password_hashers` — Algorithme de hashage
```yaml
password_hashers:
    Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface: 'auto'
```
`'auto'` = Symfony choisit le meilleur algorithme disponible (bcrypt ou argon2id).

#### 2. `providers` — Comment charger l'utilisateur
```yaml
providers:
    app_user_provider:
        entity:
            class: App\Entity\User
            property: email
```
Symfony charge l'utilisateur depuis la BDD avec `email` comme identifiant.

#### 3. `firewalls` — Zones de sécurité
```yaml
firewalls:
    main:
        json_login:
            check_path: /api/login      # Route de connexion
            username_path: email        # Symfony cherche le champ "email" dans le JSON
        jwt: ~                          # Active la vérification JWT sur toutes les routes
```

#### 4. `access_control` — Qui peut accéder à quoi
```yaml
access_control:
    - { path: ^/api/health,   roles: PUBLIC_ACCESS }  # Tout le monde
    - { path: ^/api/register, roles: PUBLIC_ACCESS }  # Tout le monde
    - { path: ^/api/login,    roles: PUBLIC_ACCESS }  # Tout le monde
    - { path: ^/api,          roles: ROLE_USER }      # Connectés seulement
```
Les règles sont vérifiées **de haut en bas**. La première qui correspond s'applique.

---

## 7. Configuration JWT — lexik_jwt_authentication.yaml

**Chemin :** `backend/config/packages/lexik_jwt_authentication.yaml`

```yaml
lexik_jwt_authentication:
    secret_key: '%env(resolve:JWT_SECRET_KEY)%'  # Chemin vers private.pem
    public_key: '%env(resolve:JWT_PUBLIC_KEY)%'  # Chemin vers public.pem
    pass_phrase: '%env(JWT_PASSPHRASE)%'          # Passphrase de la clé privée
    token_ttl: 3600                               # Durée de vie : 1 heure (en secondes)
```

---

## 8. AuthController — Inscription et déconnexion

**Chemin :** `backend/src/Controller/AuthController.php`

### Route : POST /api/register

#### Flux d'exécution
```
1. React envoie JSON : { firstName, lastName, email, password, fitnessGoal }
2. Symfony lit le JSON → json_decode()
3. Vérifie les champs obligatoires → retourne 400 si manquant
4. Vérifie que l'email n'existe pas déjà → retourne 409 si conflit
5. Crée un objet User, remplit les propriétés
6. Hashe le mot de passe → $passwordHasher->hashPassword()
7. Valide les contraintes #[Assert\...] → retourne 400 si invalide
8. Sauvegarde en BDD → $userRepository->save($user)
9. Retourne 201 avec les données de l'utilisateur (sans le mot de passe)
```

#### L'injection de dépendances dans le constructeur

```php
public function __construct(
    private readonly UserRepository $userRepository,
    private readonly UserPasswordHasherInterface $passwordHasher,
    private readonly ValidatorInterface $validator,
) {}
```

Symfony lit le constructeur et **injecte automatiquement** ces objets. Tu n'as jamais à écrire `new UserRepository()` — Symfony s'en charge.

`readonly` = la propriété ne peut être assignée qu'une seule fois (dans le constructeur). Bonne pratique PHP 8.1+.

#### Le hashage du mot de passe

```php
// ❌ JAMAIS faire ça :
$user->setPassword('motdepasse123');  // En clair !

// ✅ Toujours hasher :
$hashedPassword = $this->passwordHasher->hashPassword($user, 'motdepasse123');
// $hashedPassword = "$2y$13$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" (60 chars)
$user->setPassword($hashedPassword);
```

### Route : POST /api/login (automatique — pas dans AuthController !)

Cette route est **gérée automatiquement par LexikJWT** via la config `json_login` dans `security.yaml`.

```yaml
json_login:
    check_path: /api/login
    username_path: email
    password_path: password
    success_handler: lexik_jwt_authentication.handler.authentication_success
    failure_handler: lexik_jwt_authentication.handler.authentication_failure
```

Quand React envoie `POST /api/login { email, password }` :
1. Symfony intercepte la requête
2. Charge l'utilisateur depuis la BDD par email
3. Compare le mot de passe avec le hash stocké
4. Si correct → génère un token JWT → retourne `{ token: "eyJ..." }`
5. Si incorrect → retourne `401 Unauthorized`

---

## 9. MeController — Profil utilisateur

**Chemin :** `backend/src/Controller/MeController.php`

### L'attribut `#[IsGranted('ROLE_USER')]`

```php
#[Route('/api/me', format: 'json')]
#[IsGranted('ROLE_USER')]
final class MeController extends AbstractController
```

Cette annotation sur **la classe entière** protège **toutes les routes** du controller.
Si un utilisateur non connecté essaie d'accéder à `/api/me`, Symfony retourne automatiquement `401 Unauthorized`.

### `$this->getUser()`

```php
/** @var User $user */
$user = $this->getUser();
```

Méthode héritée de `AbstractController`. Elle retourne l'objet User de la personne connectée.

Symfony sait qui est connecté grâce au token JWT envoyé dans l'en-tête :
```
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3MzE2...
```

### La mise à jour partielle (PATCH)

```php
// array_key_exists() vérifie si la clé est présente dans le JSON
// Différent de empty() : array_key_exists retourne true même si la valeur est null
if (array_key_exists('firstName', $data) && !empty($data['firstName'])) {
    $user->setFirstName(trim($data['firstName']));
}
```

Pourquoi pas `isset()` ? Parce que `isset()` retourne `false` si la valeur est `null`, ce qui nous empêcherait de remettre un champ à null intentionnellement.

---

## 10. La migration Doctrine — Créer la table en BDD

### Qu'est-ce qu'une migration ?

Une migration = un fichier PHP qui contient les instructions SQL pour faire évoluer la structure de la base de données.

**Avantages :**
- Versionner la structure de la BDD comme du code
- Partager les modifications avec l'équipe
- Pouvoir revenir en arrière (rollback)

### Commandes à exécuter dans l'ordre

```bash
# Étape 1 : Générer la migration
# Doctrine compare l'entité User avec la BDD actuelle
# et génère le SQL nécessaire pour les synchroniser
php bin/console make:migration

# Étape 2 : Vérifier le fichier généré (dans migrations/)
# Lis le fichier pour t'assurer que le SQL est correct

# Étape 3 : Exécuter la migration
# Crée réellement la table `users` dans PostgreSQL
php bin/console doctrine:migrations:migrate

# Vérification
php bin/console doctrine:schema:validate
```

### Que contient un fichier de migration ?

```php
// migrations/Version20261115XXXXXX.php
public function up(Schema $schema): void
{
    // SQL exécuté en allant "vers l'avant"
    $this->addSql('CREATE TABLE users (
        id SERIAL NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(180) NOT NULL,
        ...
        PRIMARY KEY(id)
    )');
    $this->addSql('CREATE UNIQUE INDEX UNIQ_EMAIL ON users (email)');
}

public function down(Schema $schema): void
{
    // SQL pour annuler la migration (rollback)
    $this->addSql('DROP TABLE users');
}
```

---

## 11. Routes API créées

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/register` | ❌ Public | Créer un compte |
| POST | `/api/login` | ❌ Public | Se connecter → reçoit un JWT token |
| POST | `/api/logout` | ✅ JWT | Se déconnecter |
| GET | `/api/me` | ✅ JWT | Voir son profil |
| PUT | `/api/me` | ✅ JWT | Modifier son profil |
| PATCH | `/api/me` | ✅ JWT | Modifier partiellement son profil |
| PUT | `/api/me/password` | ✅ JWT | Changer son mot de passe |

---

## 12. Tests Postman

### Test 1 — Inscription

```
Méthode : POST
URL     : http://localhost:8000/api/register
Headers : Content-Type: application/json
Body (JSON) :
{
  "firstName": "Alex",
  "lastName": "Morgan",
  "email": "alex@fittrack.app",
  "password": "motdepasse123",
  "fitnessGoal": "muscle_gain"
}
```

**Réponse attendue (201 Created) :**
```json
{
  "message": "Compte créé avec succès.",
  "user": {
    "id": 1,
    "firstName": "Alex",
    "lastName": "Morgan",
    "fullName": "Alex Morgan",
    "email": "alex@fittrack.app",
    "age": null,
    "height": null,
    "fitnessGoal": "muscle_gain",
    "experienceLevel": null,
    "roles": ["ROLE_USER"],
    "createdAt": "2026-11-15T15:00:00+01:00"
  }
}
```

**Test d'erreur — Email déjà utilisé (409 Conflict) :**
```json
{
  "error": "Cette adresse email est déjà utilisée."
}
```

---

### Test 2 — Connexion

```
Méthode : POST
URL     : http://localhost:8000/api/login
Headers : Content-Type: application/json
Body (JSON) :
{
  "email": "alex@fittrack.app",
  "password": "motdepasse123"
}
```

**Réponse attendue (200 OK) :**
```json
{
  "token": "eyJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3MzE2NzIwMDAsImV4cCI6MTczMTY3NTYwMCwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoiYWxleEBmaXR0cmFjay5hcHAifQ.SIGNATURE"
}
```

> **Important :** Copie ce token ! Tu en as besoin pour les prochains tests.

**Test d'erreur — Mauvais mot de passe (401 Unauthorized) :**
```json
{
  "code": 401,
  "message": "Invalid credentials."
}
```

---

### Test 3 — Récupérer le profil (protégé)

```
Méthode : GET
URL     : http://localhost:8000/api/me
Headers :
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.eyJpYXQi...  ← Colle ton token ici
```

**Réponse attendue (200 OK) :**
```json
{
  "id": 1,
  "firstName": "Alex",
  "lastName": "Morgan",
  "fullName": "Alex Morgan",
  "email": "alex@fittrack.app",
  "age": null,
  "height": null,
  "fitnessGoal": "muscle_gain",
  "experienceLevel": null,
  "roles": ["ROLE_USER"],
  "createdAt": "2026-11-15T15:00:00+01:00",
  "updatedAt": "2026-11-15T15:00:00+01:00"
}
```

**Test sans token (401 Unauthorized) :**
```json
{
  "code": 401,
  "message": "JWT Token not found"
}
```

---

### Test 4 — Modifier le profil

```
Méthode : PUT
URL     : http://localhost:8000/api/me
Headers :
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
Body (JSON) :
{
  "age": 29,
  "height": 182,
  "experienceLevel": "advanced"
}
```

**Réponse attendue (200 OK) :**
```json
{
  "message": "Profil mis à jour avec succès.",
  "user": {
    "id": 1,
    "firstName": "Alex",
    "age": 29,
    "height": 182,
    "experienceLevel": "advanced",
    ...
  }
}
```

---

### Test 5 — Changer le mot de passe

```
Méthode : PUT
URL     : http://localhost:8000/api/me/password
Headers :
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
Body (JSON) :
{
  "currentPassword": "motdepasse123",
  "newPassword": "nouveaumotdepasse456",
  "confirmPassword": "nouveaumotdepasse456"
}
```

**Réponse attendue (200 OK) :**
```json
{
  "message": "Mot de passe modifié avec succès."
}
```

---

## 13. Communication React ↔ Symfony

### Comment React doit appeler ces routes

```typescript
// ── Service d'authentification (à créer dans React) ──

const API_URL = 'http://localhost:8000';

// Connexion
const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error('Identifiants incorrects');

  const data = await response.json();
  // Stocker le token pour les prochaines requêtes
  localStorage.setItem('fittrack_token', data.token);
  return data.token;
};

// Inscription
const register = async (formData: RegisterData) => {
  const response = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  return response.json();
};

// Récupérer le profil (requête authentifiée)
const getProfile = async () => {
  const token = localStorage.getItem('fittrack_token');
  const response = await fetch(`${API_URL}/api/me`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (response.status === 401) {
    // Token expiré → rediriger vers login
    localStorage.removeItem('fittrack_token');
    // navigate('/login')
  }
  return response.json();
};
```

### Gestion des erreurs dans React

```typescript
// Codes HTTP importants à gérer
// 200 OK          → Succès
// 201 Created     → Ressource créée (inscription)
// 400 Bad Request → Données invalides (afficher les erreurs)
// 401 Unauthorized → Non connecté ou token expiré (→ login)
// 409 Conflict    → Email déjà utilisé
// 500 Server Error → Erreur interne (afficher un message générique)
```

---

## 14. Questions de validation

### Questions de compréhension

1. **Qu'est-ce qu'un token JWT et pourquoi React doit le stocker ?**

2. **Pourquoi ne stocke-t-on jamais le mot de passe en clair dans la base de données ?**
   *(Piste : que se passe-t-il si la BDD est piratée ?)*

3. **Quelle est la différence entre `persist()` et `flush()` dans Doctrine ?**

4. **Dans `security.yaml`, à quoi sert la section `access_control` ?**

5. **Pourquoi `getUserIdentifier()` retourne l'email et pas l'ID ?**
   *(Piste : c'est le "nom d'utilisateur" que JWT stocke dans le token)*

6. **Qu'est-ce qu'une migration Doctrine ? Pourquoi ne pas modifier directement la BDD ?**

7. **Regarde la réponse de `/api/register` — pourquoi le mot de passe n'y apparaît pas ?**

8. **Si un utilisateur envoie un token JWT invalide ou expiré, que se passe-t-il ?**

### Exercices pratiques

1. Inscris-toi avec Postman → vérifie dans pgAdmin/DBeaver que l'utilisateur est en BDD
2. Connecte-toi → copie le token
3. Va sur [jwt.io](https://jwt.io) et colle le token → lis le payload (que contient-il ?)
4. Teste `/api/me` sans token → que retourne Symfony ?
5. Teste `/api/me` avec un token invalide (modifie un caractère) → que se passe-t-il ?

---

## 🔧 Fichiers créés / modifiés dans ce module

| Fichier | Action | Description |
|---------|--------|-------------|
| `C:\xampp\php\php.ini` | 🔧 Modifié | Activé `extension=sodium` et `extension=zip` |
| `composer.json` | 🔧 Modifié | Ajouté `lexik/jwt-authentication-bundle` (v3.2.0) |
| `config/jwt/private.pem` | ✅ Généré | Clé privée RSA pour signature JWT |
| `config/jwt/public.pem` | ✅ Généré | Clé publique RSA pour vérification JWT |
| `src/Entity/User.php` | ✅ Créé | Entité User avec toutes les propriétés et validations |
| `src/Repository/UserRepository.php` | ✅ Créé | Requêtes BDD pour User |
| `src/Controller/AuthController.php` | ✅ Créé | Inscription (`/api/register`) + déconnexion |
| `src/Controller/MeController.php` | ✅ Créé | Profil utilisateur (`/api/me`, `/api/me/password`) |
| `config/packages/security.yaml` | 🔧 Modifié | Config JWT + provider `app_user_provider` |
| `config/packages/lexik_jwt_authentication.yaml` | ✅ Configuré | Config bundle JWT |
| `.env.local` | 🔧 Modifié | Ajout des variables JWT et DATABASE_URL |
| `migrations/Version20261115160000.php` | ✅ Prêt | Migration Doctrine créant la table `users` |
| `README_MODULE_2.md` | ✅ Créé | Documentation complète du module |

---

## 📋 Résumé des commandes du module

```bash
# 1. Installer le bundle JWT
composer require lexik/jwt-authentication-bundle

# 2. Générer les clés RSA
php bin/console lexik:jwt:generate-keypair

# 3. Générer la migration (après création de l'entité User)
php bin/console make:migration

# 4. Exécuter la migration
php bin/console doctrine:migrations:migrate

# 5. Vérifier la structure
php bin/console doctrine:schema:validate

# 6. Lister les routes
php bin/console debug:router

# 7. Démarrer le serveur
php -S localhost:8000 -t public/
```

---

*📅 Module développé le : 15 novembre 2026*
*👨‍💻 Projet : FitTrack — Application de suivi sportif*
*🔧 Technologie : Symfony 7.4 + LexikJWT + PostgreSQL*
