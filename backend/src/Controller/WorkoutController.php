<?php

namespace App\Controller;

use App\Entity\SessionExercise;
use App\Entity\WorkoutSession;
use App\Repository\ExerciseRepository;
use App\Repository\WorkoutSessionRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/workouts')]
#[IsGranted('ROLE_USER')]
class WorkoutController extends AbstractController
{
    public function __construct(
        private WorkoutSessionRepository $workoutRepo,
        private ExerciseRepository $exerciseRepo
    ) {}

    // =====================================================
    // GET /api/workouts
    // Liste toutes les séances de l'utilisateur connecté
    // =====================================================
    #[Route('', name: 'api_workouts_list', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $user = $this->getUser();
        $sessions = $this->workoutRepo->findByUser($user);

        return $this->json([
            'workouts' => array_map(fn(WorkoutSession $w) => $w->toArray(), $sessions),
            'total'    => count($sessions),
        ]);
    }

    // =====================================================
    // POST /api/workouts
    // Crée une nouvelle séance (sans exercices d'abord)
    // =====================================================
    #[Route('', name: 'api_workouts_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['name'])) {
            return $this->json(['error' => 'Le nom de la séance est obligatoire.'], 400);
        }

        $session = new WorkoutSession();
        $session->setUser($this->getUser());
        $session->setName($data['name']);
        $session->setType($data['type'] ?? null);
        $session->setDuration(isset($data['duration']) ? (int)$data['duration'] : null);
        $session->setIntensity($data['intensity'] ?? null);
        $session->setNotes($data['notes'] ?? null);

        if (!empty($data['scheduledAt'])) {
            try {
                $session->setScheduledAt(new \DateTimeImmutable($data['scheduledAt']));
            } catch (\Exception $e) {
                return $this->json(['error' => 'Format de date invalide.'], 400);
            }
        }

        // Ajout des exercices si fournis dans la requête
        if (!empty($data['exercises']) && is_array($data['exercises'])) {
            foreach ($data['exercises'] as $index => $exData) {
                if (empty($exData['exerciseId'])) continue;

                $exercise = $this->exerciseRepo->find($exData['exerciseId']);
                if (!$exercise) continue;

                $se = new SessionExercise();
                $se->setExercise($exercise);
                $se->setSets(isset($exData['sets']) ? (int)$exData['sets'] : 3);
                $se->setReps(isset($exData['reps']) ? (int)$exData['reps'] : null);
                $se->setWeight(isset($exData['weight']) ? (float)$exData['weight'] : null);
                $se->setRestTime(isset($exData['restTime']) ? (int)$exData['restTime'] : null);
                $se->setOrderIndex($index);
                $se->setNotes($exData['notes'] ?? null);

                $session->addSessionExercise($se);
            }
        }

        $this->workoutRepo->save($session, true);

        return $this->json([
            'message' => 'Séance créée avec succès.',
            'workout' => $session->toArray(true),
        ], 201);
    }

    // =====================================================
    // GET /api/workouts/{id}
    // Détails d'une séance avec ses exercices
    // =====================================================
    #[Route('/{id}', name: 'api_workouts_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $session = $this->workoutRepo->find($id);

        if (!$session) {
            return $this->json(['error' => 'Séance introuvable.'], 404);
        }

        if ($session->getUser() !== $this->getUser()) {
            return $this->json(['error' => 'Accès refusé.'], 403);
        }

        return $this->json(['workout' => $session->toArray(true)]);
    }

    // =====================================================
    // PUT /api/workouts/{id}
    // Modifie une séance (métadonnées)
    // =====================================================
    #[Route('/{id}', name: 'api_workouts_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $session = $this->workoutRepo->find($id);

        if (!$session) {
            return $this->json(['error' => 'Séance introuvable.'], 404);
        }

        if ($session->getUser() !== $this->getUser()) {
            return $this->json(['error' => 'Accès refusé.'], 403);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['name']))      $session->setName($data['name']);
        if (isset($data['type']))      $session->setType($data['type']);
        if (isset($data['duration']))  $session->setDuration((int)$data['duration']);
        if (isset($data['intensity'])) $session->setIntensity($data['intensity']);
        if (isset($data['notes']))     $session->setNotes($data['notes']);

        if (isset($data['scheduledAt'])) {
            try {
                $session->setScheduledAt(new \DateTimeImmutable($data['scheduledAt']));
            } catch (\Exception $e) {
                return $this->json(['error' => 'Format de date invalide.'], 400);
            }
        }

        $this->workoutRepo->save($session, true);

        return $this->json([
            'message' => 'Séance mise à jour avec succès.',
            'workout' => $session->toArray(true),
        ]);
    }

    // =====================================================
    // DELETE /api/workouts/{id}
    // Supprime une séance et ses exercices (cascade)
    // =====================================================
    #[Route('/{id}', name: 'api_workouts_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $session = $this->workoutRepo->find($id);

        if (!$session) {
            return $this->json(['error' => 'Séance introuvable.'], 404);
        }

        if ($session->getUser() !== $this->getUser()) {
            return $this->json(['error' => 'Accès refusé.'], 403);
        }

        $this->workoutRepo->remove($session, true);

        return $this->json(['message' => 'Séance supprimée avec succès.']);
    }

    // =====================================================
    // POST /api/workouts/{id}/exercises
    // Ajoute un exercice à une séance existante
    // =====================================================
    #[Route('/{id}/exercises', name: 'api_workouts_add_exercise', methods: ['POST'])]
    public function addExercise(int $id, Request $request): JsonResponse
    {
        $session = $this->workoutRepo->find($id);

        if (!$session) {
            return $this->json(['error' => 'Séance introuvable.'], 404);
        }

        if ($session->getUser() !== $this->getUser()) {
            return $this->json(['error' => 'Accès refusé.'], 403);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['exerciseId'])) {
            return $this->json(['error' => 'exerciseId est obligatoire.'], 400);
        }

        $exercise = $this->exerciseRepo->find($data['exerciseId']);
        if (!$exercise) {
            return $this->json(['error' => 'Exercice introuvable.'], 404);
        }

        $se = new SessionExercise();
        $se->setExercise($exercise);
        $se->setSets(isset($data['sets']) ? (int)$data['sets'] : 3);
        $se->setReps(isset($data['reps']) ? (int)$data['reps'] : null);
        $se->setWeight(isset($data['weight']) ? (float)$data['weight'] : null);
        $se->setRestTime(isset($data['restTime']) ? (int)$data['restTime'] : null);
        $se->setOrderIndex($session->getSessionExercises()->count());
        $se->setNotes($data['notes'] ?? null);

        $session->addSessionExercise($se);
        $this->workoutRepo->save($session, true);

        return $this->json([
            'message' => 'Exercice ajouté à la séance.',
            'workout' => $session->toArray(true),
        ], 201);
    }
}
