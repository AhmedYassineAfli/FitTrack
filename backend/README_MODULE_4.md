# 📘 Module 4 — Gestion des Exercices & Catégories

> **FitTrack Backend | Documentation pédagogique**
> Niveau : Débutant en Symfony | Langue : Français

---

## 📋 Sommaire

1. [Objectif du module](#1-objectif-du-module)
2. [Notions techniques Doctrine & Symfony](#2-notions-techniques-doctrine--symfony)
3. [Architecture et Fichiers créés](#3-architecture-et-fichiers-créés)
4. [L'Entité Category et la relation OneToMany](#4-lentité-category-et-la-relation-onetomany)
5. [L'Entité Exercise et la relation ManyToOne](#5-lentité-exercise-et-la-relation-manytoone)
6. [Le Repository ExerciseRepository et QueryBuilder](#6-le-repository-exerciserepository-et-querybuilder)
7. [La Commande de Seed `app:seed-exercises`](#7-la-commande-de-seed-appseed-exercises)
8. [Le Contrôleur ExerciseController (CRUD complet)](#8-le-contrôleur-exercisecontroller-crud-complet)
9. [Routes API créées](#9-routes-api-créées)
10. [Exemples de requêtes et réponses JSON](#10-exemples-de-requêtes-et-réponses-json)
11. [Connexion avec React (ExercisesPage)](#11-connexion-avec-react-exercisespage)
12. [Tests et résultats](#12-tests-et-résultats)
13. [Questions de validation](#13-questions-de-validation)

---

## 1. Objectif du module

Le **Module 4** met en place la bibliothèque complète des exercices de musculation et de fitness dans FitTrack.
Cette bibliothèque est le cœur de l'application car elle alimentera les modules suivants :
- **Module 5 :** Les exercices associés aux Programmes d'entraînement.
- **Module 6 :** Les exercices sélectionnés et exécutés lors des Séances (Workout sessions).

Fonctionnalités développées :
- Catégorisation des mouvements par groupes musculaires (`Chest`, `Back`, `Legs`, `Shoulders`, `Arms`, `Core`).
- Recherche plein texte dynamique par nom d'exercice ou muscle ciblé.
- Filtrage par niveau (`Beginner`, `Intermediate`, `Advanced`).
- CRUD complet : Création, Consultation, Modification, Suppression d'exercices.

---

## 2. Notions techniques Doctrine & Symfony

### A. La relation Bidirectionnelle `OneToMany` / `ManyToOne`

Dans une base de données relationnelle :
- Une **Catégorie** (ex: *Legs*) possède **plusieurs** exercices (*Squat*, *Fentes*, *Leg Press*). ➔ Côté `Category` : **`OneToMany`**.
- Un **Exercice** appartient à **une seule** catégorie principale. ➔ Côté `Exercise` : **`ManyToOne`**.

```
    ┌────────────────┐                ┌────────────────┐
    │    Category    │ 1            * │    Exercise    │
    ├────────────────┤────────────────├────────────────┤
    │ id             │                │ id             │
    │ name           │◄───────────────│ category_id    │ (Clé étrangère FK)
    │ description    │                │ name           │
    └────────────────┘                │ muscle         │
                                      │ level          │
                                      └────────────────┘
```

> **Règle Doctrine fondamentale :**  
> La clé étrangère (`category_id`) est TOUJOURS située du côté `ManyToOne` (l'entité propriétaire).

### B. Le QueryBuilder de Doctrine
Au lieu d'écrire des requêtes SQL concaténées à la main (qui risquent des injections SQL), Doctrine fournit le **QueryBuilder** en DQL (*Doctrine Query Language*) :
- Requêtes paramétrées sécurisées (`:q`, `:cat`)
- Jointures automatiques (`leftJoin('e.category', 'c')`)
- Conditions conditionnelles (`if ($query) { $qb->andWhere(...) }`)

---

## 3. Architecture et Fichiers créés

```
backend/
├── src/
│   ├── Entity/
│   │   ├── Category.php            ← 🆕 Entité Catégorie (table `categories`)
│   │   └── Exercise.php            ← 🆕 Entité Exercice (table `exercises`)
│   ├── Repository/
│   │   ├── CategoryRepository.php  ← 🆕 Requêtes Doctrine pour Category
│   │   └── ExerciseRepository.php  ← 🆕 Recherche dynamique QueryBuilder
│   ├── Controller/
│   │   └── ExerciseController.php  ← 🆕 Endpoints REST (/api/exercises, /api/categories)
│   └── Command/
│       └── SeedExercisesCommand.php← 🆕 Commande CLI pour insérer la bibliothèque
├── migrations/
│   └── Version20261115170000.php   ← 🆕 Migration créant categories et exercises
frontend/
├── src/
│   ├── services/
│   │   └── api.ts                  ← 🔧 getExercises, getCategories, createExercise...
│   └── pages/
│       └── exercises/ExercisesPage.tsx ← 🔧 Remplacement du mock statique par l'API
```

---

## 4. L'Entité Category et la relation OneToMany

**Chemin :** `backend/src/Entity/Category.php`

```php
#[ORM\Entity(repositoryClass: CategoryRepository::class)]
#[ORM\Table(name: 'categories')]
class Category
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100, unique: true)]
    #[Assert\NotBlank]
    private ?string $name = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    /**
     * mappedBy: 'category' indique la propriété miroir dans l'entité Exercise.
     */
    #[ORM\OneToMany(targetEntity: Exercise::class, mappedBy: 'category', cascade: ['persist', 'remove'])]
    private Collection $exercises;
...
```

---

## 5. L'Entité Exercise et la relation ManyToOne

**Chemin :** `backend/src/Entity/Exercise.php`

```php
#[ORM\Entity(repositoryClass: ExerciseRepository::class)]
#[ORM\Table(name: 'exercises')]
#[ORM\HasLifecycleCallbacks]
class Exercise
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 150)]
    #[Assert\NotBlank(message: 'Le nom de l\'exercice est obligatoire.')]
    private ?string $name = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'Le muscle ciblé est obligatoire.')]
    private ?string $muscle = null;

    #[ORM\Column(length: 50)]
    #[Assert\Choice(choices: ['Beginner', 'Intermediate', 'Advanced'])]
    private ?string $level = 'Beginner';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    /**
     * ManyToOne : Plusieurs exercices peuvent appartenir à une même catégorie.
     */
    #[ORM\ManyToOne(targetEntity: Category::class, inversedBy: 'exercises')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Category $category = null;
...
```

---

## 6. Le Repository ExerciseRepository et QueryBuilder

**Chemin :** `backend/src/Repository/ExerciseRepository.php`

```php
public function search(?string $query = null, ?string $categoryName = null, ?string $level = null): array
{
    $qb = $this->createQueryBuilder('e')
        ->leftJoin('e.category', 'c')
        ->addSelect('c')
        ->orderBy('e.name', 'ASC');

    // Filtre de recherche par mot clé
    if ($query && trim($query) !== '') {
        $qb->andWhere('LOWER(e.name) LIKE :q OR LOWER(e.muscle) LIKE :q')
           ->setParameter('q', '%' . strtolower(trim($query)) . '%');
    }

    // Filtre par catégorie
    if ($categoryName && strtolower($categoryName) !== 'all') {
        $qb->andWhere('LOWER(c.name) = :cat')
           ->setParameter('cat', strtolower(trim($categoryName)));
    }

    // Filtre par niveau
    if ($level && strtolower($level) !== 'all') {
        $qb->andWhere('LOWER(e.level) = :level')
           ->setParameter('level', strtolower($level));
    }

    return $qb->getQuery()->getResult();
}
```

---

## 7. La Commande de Seed `app:seed-exercises`

Pour éviter de devoir insérer manuellement 15 exercices dans MySQL via des requêtes SQL complexes, nous avons créé une commande Symfony :

```bash
php bin/console app:seed-exercises
```

**Ce qu'elle fait :**
1. Crée les 6 catégories : `Chest`, `Back`, `Legs`, `Shoulders`, `Arms`, `Core`.
2. Crée les 10 exercices de base de FitTrack (*Barbell Back Squat*, *Romanian Deadlift*, *Bench Press*, *Pull Up*...).
3. Établit automatiquement les relations de clés étrangères.

---

## 8. Le Contrôleur ExerciseController (CRUD complet)

**Chemin :** `backend/src/Controller/ExerciseController.php`

- `GET /api/categories` : Renvoie toutes les catégories avec le nombre d'exercices qu'elles contiennent.
- `GET /api/exercises` : Renvoie la liste filtrée.
- `GET /api/exercises/{id}` : Renvoie un exercice précis (404 si introuvable).
- `POST /api/exercises` : Crée un exercice avec validation des contraintes.
- `PUT /api/exercises/{id}` : Modifie les champs envoyés.
- `DELETE /api/exercises/{id}` : Supprime l'exercice.

---

## 9. Routes API créées

| Méthode | Route | Description | Filtres / Body |
|---------|-------|-------------|----------------|
| `GET` | `/api/categories` | Liste des groupes musculaires | Aucun |
| `GET` | `/api/exercises` | Bibliothèque des exercices | `?q=...`, `?category=...`, `?level=...` |
| `GET` | `/api/exercises/{id}` | Détail d'un exercice | ID en paramètre |
| `POST` | `/api/exercises` | Créer un exercice | JSON `{ name, muscle, level, description, categoryName }` |
| `PUT` | `/api/exercises/{id}` | Modifier un exercice | JSON `{ name, muscle, level... }` |
| `DELETE` | `/api/exercises/{id}` | Supprimer un exercice | ID en paramètre |

---

## 10. Exemples de requêtes et réponses JSON

### Récupération de la liste (`GET /api/exercises?category=Legs`)

**Réponse HTTP 200 OK :**
```json
[
  {
    "id": 1,
    "name": "Barbell Back Squat",
    "muscle": "Quadriceps",
    "level": "Advanced",
    "description": "Flexion sur jambes avec barre libre sur les trapèzes.",
    "category": {
      "id": 3,
      "name": "Legs"
    },
    "createdAt": "2026-11-15T16:54:07+01:00"
  },
  {
    "id": 2,
    "name": "Romanian Deadlift",
    "muscle": "Hamstrings",
    "level": "Intermediate",
    "description": "Soulevé de terre jambes tendues pour les ischios.",
    "category": {
      "id": 3,
      "name": "Legs"
    },
    "createdAt": "2026-11-15T16:54:07+01:00"
  }
]
```

---

### Création d'un exercice (`POST /api/exercises`)

**Body JSON :**
```json
{
  "name": "Dumbbell Bicep Curl",
  "muscle": "Biceps",
  "level": "Beginner",
  "description": "Flexion des coudes avec haltères.",
  "categoryName": "Arms"
}
```

**Réponse HTTP 201 Created :**
```json
{
  "message": "Exercice créé avec succès.",
  "exercise": {
    "id": 11,
    "name": "Dumbbell Bicep Curl",
    "muscle": "Biceps",
    "level": "Beginner",
    "category": {
      "id": 5,
      "name": "Arms"
    }
  }
}
```

---

## 11. Connexion avec React (ExercisesPage)

Dans [ExercisesPage.tsx](file:///c:/Users/yassin/OneDrive/Desktop/FitTrack/frontend/src/pages/exercises/ExercisesPage.tsx) :
- La liste statique `exerciseLibrary` a été supprimée.
- Un appel `api.getExercises({ q: searchTerm, category: activeFilter })` est effectué avec un **debounce de 250ms**.
- Dès que l'utilisateur tape une lettre dans la barre de recherche ou clique sur un bouton de filtre (`Chest`, `Back`, `Legs`...), React met à jour la grille en temps réel depuis MySQL !
- Un indicateur de chargement (`Loader2`) est affiché pendant la requête.

---

## 12. Tests et résultats

### Tests automatisés exécutés :
```text
Total exercises retrieved: 10
Leg exercises: 3 (Barbell Back Squat, Romanian Deadlift, Bulgarian Split Squat)
Squat search matches: 2
```

---

## 13. Questions de validation

1. **Pourquoi la relation `ManyToOne` porte-t-elle l'attribut `inversedBy` et `OneToMany` l'attribut `mappedBy` ?**
   *(Indice : l'entité possédant la clé étrangère en BDD est le côté propriétaire `inversedBy`, tandis que l'autre côté est la vue miroir `mappedBy`).*

2. **Quelle est la différence entre `findBy()` et `search()` avec QueryBuilder dans ce module ?**
   *(Indice : `findBy` ne sait faire que des égalités exactes, alors que `QueryBuilder` permet des `LIKE %terme%`, `LOWER()`, et des `LEFT JOIN`).*

3. **Que fait l'option `onDelete: 'SET NULL'` sur la clé étrangère `category_id` ?**
   *(Indice : si une catégorie est supprimée, les exercices qui lui appartenaient ne sont pas détruits, leur champ category_id devient simplement NULL).*

---

*📅 Module développé le : 15 novembre 2026*  
*👨‍💻 Projet : FitTrack — Suivi sportif*  
*🔧 Technologie : Symfony 7.4 + MySQL + React*
