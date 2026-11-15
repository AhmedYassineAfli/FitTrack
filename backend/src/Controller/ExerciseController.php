<?php

namespace App\Controller;

use App\Entity\Exercise;
use App\Repository\CategoryRepository;
use App\Repository\ExerciseRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * ExerciseController — Gestion de la bibliothèque d'exercices et des catégories.
 *
 * Routes :
 *   GET    /api/exercises        → Liste avec filtres (recherche, catégorie, niveau)
 *   GET    /api/exercises/{id}   → Détails d'un exercice
 *   POST   /api/exercises        → Créer un nouvel exercice
 *   PUT    /api/exercises/{id}   → Modifier un exercice
 *   DELETE /api/exercises/{id}   → Supprimer un exercice
 *   GET    /api/categories       → Liste des catégories de muscles
 */
#[Route('/api', format: 'json')]
#[IsGranted('ROLE_USER')]
final class ExerciseController extends AbstractController
{
    public function __construct(
        private readonly ExerciseRepository $exerciseRepository,
        private readonly CategoryRepository $categoryRepository,
        private readonly ValidatorInterface $validator,
    ) {}

    // =========================================================================
    // GET /api/categories — LISTE DES CATÉGORIES
    // =========================================================================

    #[Route('/categories', name: 'api_categories_list', methods: ['GET'])]
    public function listCategories(): JsonResponse
    {
        $categories = $this->categoryRepository->findAll();

        $data = array_map(function ($cat) {
            return [
                'id'          => $cat->getId(),
                'name'        => $cat->getName(),
                'description' => $cat->getDescription(),
                'count'       => $cat->getExercises()->count(),
            ];
        }, $categories);

        return $this->json($data);
    }

    // =========================================================================
    // GET /api/exercises — LISTE DES EXERCICES AVEC FILTRES
    // =========================================================================

    /**
     * Paramètres GET optionnels :
     *   ?q=squat              (recherche par nom ou muscle)
     *   ?category=Legs        (filtre par catégorie ou groupe musculaire)
     *   ?level=Intermediate   (filtre par niveau : Beginner, Intermediate, Advanced)
     */
    #[Route('/exercises', name: 'api_exercises_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $query = $request->query->get('q');
        $category = $request->query->get('category');
        $level = $request->query->get('level');

        $exercises = $this->exerciseRepository->search($query, $category, $level);

        $data = array_map([$this, 'serializeExercise'], $exercises);

        return $this->json($data);
    }

    // =========================================================================
    // GET /api/exercises/{id} — DÉTAIL D'UN EXERCICE
    // =========================================================================

    #[Route('/exercises/{id}', name: 'api_exercises_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $exercise = $this->exerciseRepository->find($id);
        if (!$exercise) {
            return $this->json(['error' => 'Exercice introuvable.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($this->serializeExercise($exercise));
    }

    // =========================================================================
    // POST /api/exercises — CRÉER UN EXERCICE
    // =========================================================================

    #[Route('/exercises', name: 'api_exercises_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'Format JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        if (empty($data['name']) || empty($data['muscle'])) {
            return $this->json(
                ['error' => 'Les champs "name" et "muscle" sont obligatoires.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $exercise = new Exercise();
        $exercise->setName(trim($data['name']));
        $exercise->setMuscle(trim($data['muscle']));
        $exercise->setLevel($data['level'] ?? 'Beginner');

        if (!empty($data['description'])) {
            $exercise->setDescription(trim($data['description']));
        }

        // Associer une catégorie si spécifiée
        if (!empty($data['categoryId'])) {
            $category = $this->categoryRepository->find((int) $data['categoryId']);
            if ($category) {
                $exercise->setCategory($category);
            }
        } elseif (!empty($data['categoryName'])) {
            $category = $this->categoryRepository->findByName(trim($data['categoryName']));
            if ($category) {
                $exercise->setCategory($category);
            }
        }

        // Validation
        $violations = $this->validator->validate($exercise);
        if (count($violations) > 0) {
            $errors = [];
            foreach ($violations as $v) {
                $errors[$v->getPropertyPath()] = $v->getMessage();
            }
            return $this->json(['errors' => $errors], Response::HTTP_BAD_REQUEST);
        }

        $this->exerciseRepository->save($exercise);

        return $this->json(
            [
                'message'  => 'Exercice créé avec succès.',
                'exercise' => $this->serializeExercise($exercise),
            ],
            Response::HTTP_CREATED
        );
    }

    // =========================================================================
    // PUT /api/exercises/{id} — MODIFIER UN EXERCICE
    // =========================================================================

    #[Route('/exercises/{id}', name: 'api_exercises_update', methods: ['PUT', 'PATCH'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $exercise = $this->exerciseRepository->find($id);
        if (!$exercise) {
            return $this->json(['error' => 'Exercice introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'Format JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        if (array_key_exists('name', $data) && !empty($data['name'])) {
            $exercise->setName(trim($data['name']));
        }
        if (array_key_exists('muscle', $data) && !empty($data['muscle'])) {
            $exercise->setMuscle(trim($data['muscle']));
        }
        if (array_key_exists('level', $data) && !empty($data['level'])) {
            $exercise->setLevel($data['level']);
        }
        if (array_key_exists('description', $data)) {
            $exercise->setDescription($data['description']);
        }
        if (array_key_exists('categoryId', $data)) {
            $category = $data['categoryId'] ? $this->categoryRepository->find((int) $data['categoryId']) : null;
            $exercise->setCategory($category);
        }

        // Validation
        $violations = $this->validator->validate($exercise);
        if (count($violations) > 0) {
            $errors = [];
            foreach ($violations as $v) {
                $errors[$v->getPropertyPath()] = $v->getMessage();
            }
            return $this->json(['errors' => $errors], Response::HTTP_BAD_REQUEST);
        }

        $this->exerciseRepository->save($exercise);

        return $this->json([
            'message'  => 'Exercice mis à jour avec succès.',
            'exercise' => $this->serializeExercise($exercise),
        ]);
    }

    // =========================================================================
    // DELETE /api/exercises/{id} — SUPPRIMER UN EXERCICE
    // =========================================================================

    #[Route('/exercises/{id}', name: 'api_exercises_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $exercise = $this->exerciseRepository->find($id);
        if (!$exercise) {
            return $this->json(['error' => 'Exercice introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $this->exerciseRepository->remove($exercise);

        return $this->json(['message' => 'Exercice supprimé avec succès.']);
    }

    // =========================================================================
    // MÉTHODE PRIVÉE — Sérialisation
    // =========================================================================

    private function serializeExercise(Exercise $exercise): array
    {
        return [
            'id'          => $exercise->getId(),
            'name'        => $exercise->getName(),
            'muscle'      => $exercise->getMuscle(),
            'level'       => $exercise->getLevel(),
            'description' => $exercise->getDescription(),
            'category'    => $exercise->getCategory() ? [
                'id'   => $exercise->getCategory()->getId(),
                'name' => $exercise->getCategory()->getName(),
            ] : null,
            'createdAt'   => $exercise->getCreatedAt()?->format(\DateTimeInterface::ATOM),
        ];
    }
}
