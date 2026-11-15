# 📘 Module 3 — Gestion du Profil & Préférences

> **FitTrack Backend | Documentation pédagogique**
> Niveau : Débutant en Symfony | Langue : Français

---

## 📋 Sommaire

1. [Objectif du module](#1-objectif-du-module)
2. [Notions techniques abordées](#2-notions-techniques-abordées)
3. [Architecture et Fichiers créés / modifiés](#3-architecture-et-fichiers-créés--modifiés)
4. [L'Entité User et le champ `preferences` (JSON)](#4-lentité-user-et-le-champ-preferences-json)
5. [Le Contrôleur MeController](#5-le-contrôleur-mecontroller)
6. [La Migration Doctrine pour `preferences`](#6-la-migration-doctrine-pour-preferences)
7. [Routes API du Module 3](#7-routes-api-du-module-3)
8. [Exemples de requêtes et réponses JSON](#8-exemples-de-requêtes-et-réponses-json)
9. [Connexion avec React (ProfilePage & SettingsPage)](#9-connexion-avec-react-profilepage--settingspage)
10. [Tests et résultats](#10-tests-et-résultats)
11. [Questions de validation](#11-questions-de-validation)

---

## 1. Objectif du module

Le **Module 3** a pour rôle de permettre à l'utilisateur connecté de :
1. **Consulter son profil personnel** (`GET /api/me`) : nom, prénom, email, âge, taille, niveau sportif, objectif fitness.
2. **Modifier ses informations personnelles** (`PUT /api/me`) : mise à jour sélective et validation des valeurs.
3. **Gérer ses préférences d'entraînement et d'application** (`PUT /api/me/preferences`) : système métrique/impérial, jour de début de semaine, durée par défaut d'entraînement, alertes notifications.
4. **Changer son mot de passe en toute sécurité** (`PUT /api/me/password`) : vérification du mot de passe actuel et hashage robuste du nouveau mot de passe.

---

## 2. Notions techniques abordées

### A. L'utilisateur connecté avec `$this->getUser()`
Dans une application classique, l'identifiant de session est stocké sur le serveur.
Avec **JWT**, à chaque requête envoyée avec le header `Authorization: Bearer <TOKEN>`, Symfony décode le token, extrait l'email de l'utilisateur, interroge la base de données via le `UserRepository` et injecte automatiquement l'instance `User` dans le contrôleur via `$this->getUser()`.

### B. Le stockage JSON dans MySQL (`type: 'json'`)
Plutôt que de créer des colonnes séparées pour chaque petite case à cocher (système métrique, notifications...), Doctrine permet de mapper un tableau PHP directement dans une colonne `JSON` de MySQL :
- En PHP : tableau associatif `$user->getPreferences()`
- En BDD MySQL : chaîne JSON stockée nativement `{"measurementSystem":"metric", ...}`

### C. La protection des routes avec `#[IsGranted('ROLE_USER')]`
Placé au niveau de la classe du contrôleur, cet attribut indique à Symfony :
> *"Refuse immédiatement l'accès (HTTP 401 Unauthorized) si la personne qui appelle cette API n'est pas connectée avec un token JWT valide."*

---

## 3. Architecture et Fichiers créés / modifiés

```
backend/
├── src/
│   ├── Entity/
│   │   └── User.php                  ← 🔧 Ajout de $preferences (JSON) + getters/setters
│   └── Controller/
│       └── MeController.php          ← 🔧 GET /api/me, PUT /api/me, PUT /api/me/preferences, PUT /api/me/password
├── migrations/
│   └── Version20261115164000.php     ← 🆕 ALTER TABLE users ADD preferences JSON
frontend/
├── src/
│   ├── services/
│   │   └── api.ts                    ← 🔧 Ajout de updateProfile, updatePreferences, updatePassword
│   └── pages/
│       ├── profile/ProfilePage.tsx   ← 🔧 Branché sur GET /api/me et PUT /api/me
│       └── settings/SettingsPage.tsx ← 🔧 Branché sur PUT /api/me/preferences
```

---

## 4. L'Entité User et le champ `preferences` (JSON)

**Chemin :** `backend/src/Entity/User.php`

```php
#[ORM\Column(type: 'json', nullable: true)]
private ?array $preferences = [
    'measurementSystem' => 'metric',
    'weekStartsOn' => 'monday',
    'defaultWorkoutDuration' => 60,
    'notifications' => [
        'workoutReminders' => true,
        'weeklyProgressReport' => true,
        'achievementUpdates' => true,
    ],
];
```

### Méthodes associées :
```php
public function getPreferences(): array
{
    return $this->preferences ?? [
        'measurementSystem' => 'metric',
        'weekStartsOn' => 'monday',
        'defaultWorkoutDuration' => 60,
        'notifications' => [
            'workoutReminders' => true,
            'weeklyProgressReport' => true,
            'achievementUpdates' => true,
        ],
    ];
}

public function setPreferences(?array $preferences): static
{
    $this->preferences = $preferences;
    return $this;
}
```

---

## 5. Le Contrôleur MeController

**Chemin :** `backend/src/Controller/MeController.php`

### 1. Consulter le profil : `GET /api/me`
```php
#[Route('', name: 'api_me_get', methods: ['GET'])]
public function getProfile(): JsonResponse
{
    /** @var User $user */
    $user = $this->getUser();

    return $this->json($this->serializeUser($user));
}
```

### 2. Modifier les informations : `PUT /api/me`
```php
#[Route('', name: 'api_me_update', methods: ['PUT', 'PATCH'])]
public function updateProfile(Request $request): JsonResponse
{
    /** @var User $user */
    $user = $this->getUser();
    $data = json_decode($request->getContent(), true);

    if (array_key_exists('firstName', $data)) $user->setFirstName(trim($data['firstName']));
    if (array_key_exists('lastName', $data))  $user->setLastName(trim($data['lastName']));
    if (array_key_exists('age', $data))       $user->setAge($data['age'] ? (int)$data['age'] : null);
    if (array_key_exists('height', $data))    $user->setHeight($data['height'] ? (int)$data['height'] : null);
    if (array_key_exists('fitnessGoal', $data))      $user->setFitnessGoal($data['fitnessGoal']);
    if (array_key_exists('experienceLevel', $data))  $user->setExperienceLevel($data['experienceLevel']);

    // Validation des règles #[Assert\...]
    $violations = $this->validator->validate($user);
    if (count($violations) > 0) {
        $errors = [];
        foreach ($violations as $v) {
            $errors[$v->getPropertyPath()] = $v->getMessage();
        }
        return $this->json(['errors' => $errors], Response::HTTP_BAD_REQUEST);
    }

    $this->userRepository->save($user);

    return $this->json([
        'message' => 'Profil mis à jour avec succès.',
        'user'    => $this->serializeUser($user),
    ]);
}
```

### 3. Modifier ses préférences : `PUT /api/me/preferences`
```php
#[Route('/preferences', name: 'api_me_preferences', methods: ['PUT', 'PATCH'])]
public function updatePreferences(Request $request): JsonResponse
{
    /** @var User $user */
    $user = $this->getUser();
    $data = json_decode($request->getContent(), true);

    $currentPreferences = $user->getPreferences();
    // Fusion récursive des nouvelles préférences avec les anciennes
    $user->setPreferences(array_replace_recursive($currentPreferences, $data));

    $this->userRepository->save($user);

    return $this->json([
        'message'     => 'Préférences mises à jour avec succès.',
        'preferences' => $user->getPreferences(),
    ]);
}
```

### 4. Modifier son mot de passe : `PUT /api/me/password`
```php
#[Route('/password', name: 'api_me_password', methods: ['PUT'])]
public function changePassword(Request $request): JsonResponse
{
    /** @var User $user */
    $user = $this->getUser();
    $data = json_decode($request->getContent(), true);

    // 1. Vérifier l'ancien mot de passe
    if (!$this->passwordHasher->isPasswordValid($user, $data['currentPassword'])) {
        return $this->json(['error' => 'Le mot de passe actuel est incorrect.'], Response::HTTP_BAD_REQUEST);
    }

    // 2. Vérifier la confirmation
    if ($data['newPassword'] !== $data['confirmPassword']) {
        return $this->json(['error' => 'Les nouveaux mots de passe ne correspondent pas.'], Response::HTTP_BAD_REQUEST);
    }

    // 3. Hasher et sauvegarder
    $hashedPassword = $this->passwordHasher->hashPassword($user, $data['newPassword']);
    $user->setPassword($hashedPassword);
    $this->userRepository->save($user);

    return $this->json(['message' => 'Mot de passe modifié avec succès.']);
}
```

---

## 6. La Migration Doctrine pour `preferences`

**Fichier généré :** `backend/migrations/Version20261115164000.php`

```php
public function up(Schema $schema): void
{
    $this->addSql('ALTER TABLE users ADD preferences JSON DEFAULT NULL');
}

public function down(Schema $schema): void
{
    $this->addSql('ALTER TABLE users DROP preferences');
}
```

Commande d'exécution :
```bash
php bin/console doctrine:migrations:migrate
```

---

## 7. Routes API du Module 3

| Méthode | Route | Rôle | Authentification |
|---------|-------|------|------------------|
| `GET` | `/api/me` | Récupérer son profil complet | ✅ Obligatoire (`Bearer token`) |
| `PUT` | `/api/me` | Mettre à jour ses infos personnelles | ✅ Obligatoire (`Bearer token`) |
| `PUT` | `/api/me/preferences` | Mettre à jour ses préférences | ✅ Obligatoire (`Bearer token`) |
| `PUT` | `/api/me/password` | Modifier son mot de passe | ✅ Obligatoire (`Bearer token`) |

---

## 8. Exemples de requêtes et réponses JSON

### Consultation du profil (`GET /api/me`)

**Header :**
```http
Authorization: Bearer eyJ0eXAiOiJKV1Qi...
```

**Réponse HTTP 200 OK :**
```json
{
  "id": 1,
  "firstName": "yassine",
  "lastName": "afli",
  "fullName": "yassine afli",
  "email": "ahmedyassineafli94@gmail.com",
  "age": 28,
  "height": 180,
  "fitnessGoal": "muscle_gain",
  "experienceLevel": "intermediate",
  "preferences": {
    "measurementSystem": "metric",
    "weekStartsOn": "monday",
    "defaultWorkoutDuration": 60,
    "notifications": {
      "workoutReminders": true,
      "weeklyProgressReport": true,
      "achievementUpdates": true
    }
  },
  "roles": ["ROLE_USER"],
  "createdAt": "2026-11-15T16:19:37+01:00",
  "updatedAt": "2026-11-15T16:41:36+01:00"
}
```

---

### Modification du profil (`PUT /api/me`)

**Body JSON :**
```json
{
  "age": 29,
  "height": 182,
  "experienceLevel": "advanced"
}
```

**Réponse HTTP 200 OK :**
```json
{
  "message": "Profil mis à jour avec succès.",
  "user": {
    "id": 1,
    "firstName": "yassine",
    "lastName": "afli",
    "age": 29,
    "height": 182,
    "experienceLevel": "advanced"
  }
}
```

---

## 9. Connexion avec React (ProfilePage & SettingsPage)

Dans React :
1. **[ProfilePage.tsx](file:///c:/Users/yassin/OneDrive/Desktop/FitTrack/frontend/src/pages/profile/ProfilePage.tsx)** :
   - Pré-remplit automatiquement le formulaire avec les valeurs réelles de l'utilisateur connecté via `useAuth()`.
   - L'email est affiché en lecture seule (`disabled`) car l'email est l'identifiant unique.
   - Au clic sur **"Save changes"**, il envoie la requête `PUT /api/me` et met à jour l'état global React.
2. **[SettingsPage.tsx](file:///c:/Users/yassin/OneDrive/Desktop/FitTrack/frontend/src/pages/settings/SettingsPage.tsx)** :
   - Charge les préférences (`measurementSystem`, notifications...).
   - Au clic sur **"Save preferences"**, il envoie `PUT /api/me/preferences` pour enregistrer les choix dans MySQL.

---

## 10. Tests et résultats

### Test automatisé exécuté avec succès :
```powershell
GET /api/me SUCCESS: User is yassine afli, Goal: muscle_gain
PUT /api/me SUCCESS: Age is 28, Height is 180 cm
```

### Vérification de sécurité :
- Si on envoie un token invalide ou absent ➔ `401 Unauthorized` (`JWT Token not found`).
- Si un mot de passe ne correspond pas lors du changement ➔ `400 Bad Request` (`Le mot de passe actuel est incorrect.`).

---

## 11. Questions de validation

1. **Pourquoi l'adresse email ne peut-elle pas être modifiée dans `PUT /api/me` ?**
   *(Indice : l'email est l'identifiant unique encodé dans le token JWT ; changer d'email invaliderait immédiatement la session de l'utilisateur).*

2. **Quelle est l'utilité de la fonction PHP `array_replace_recursive()` pour les préférences ?**
   *(Indice : elle permet de modifier uniquement une sous-clé comme `notifications.workoutReminders` sans écraser le reste du tableau de préférences).*

3. **Dans quel cas Doctrine déclenche-t-il les callbacks `#[ORM\PreUpdate]` ?**
   *(Indice : avant chaque instruction SQL UPDATE, pour rafraîchir la date `updatedAt`).*

---

*📅 Module développé le : 15 novembre 2026*  
*👨‍💻 Projet : FitTrack — Suivi sportif*  
*🔧 Technologie : Symfony 7.4 + MySQL + React*
