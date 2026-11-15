<?php

namespace App\Controller;

use App\Entity\Program;
use App\Repository\ProgramRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/programs')]
#[IsGranted('ROLE_USER')]
class ProgramController extends AbstractController
{
    public function __construct(private ProgramRepository $programRepo) {}

    // =====================================================
    // GET /api/programs
    // Retourne tous les programmes de l'utilisateur connecté
    // =====================================================
    #[Route('', name: 'api_programs_list', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $user = $this->getUser();
        $programs = $this->programRepo->findByUser($user);

        return $this->json([
            'programs' => array_map(fn(Program $p) => $p->toArray(), $programs),
            'total'    => count($programs),
        ]);
    }

    // =====================================================
    // POST /api/programs
    // Crée un nouveau programme pour l'utilisateur connecté
    // =====================================================
    #[Route('', name: 'api_programs_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['name'])) {
            return $this->json(['error' => 'Le nom du programme est obligatoire.'], 400);
        }

        $program = new Program();
        $program->setUser($this->getUser());
        $program->setName($data['name']);
        $program->setDescription($data['description'] ?? null);
        $program->setDurationWeeks(isset($data['durationWeeks']) ? (int)$data['durationWeeks'] : null);
        $program->setFrequency($data['frequency'] ?? null);
        $program->setStatus($data['status'] ?? 'draft');
        $program->setProgress($data['progress'] ?? 0);

        if (!empty($data['startDate'])) {
            try {
                $program->setStartDate(new \DateTimeImmutable($data['startDate']));
            } catch (\Exception $e) {
                return $this->json(['error' => 'Format de date invalide. Utilisez YYYY-MM-DD.'], 400);
            }
        }

        $this->programRepo->save($program, true);

        return $this->json([
            'message' => 'Programme créé avec succès.',
            'program' => $program->toArray(),
        ], 201);
    }

    // =====================================================
    // GET /api/programs/{id}
    // Retourne les détails d'un programme spécifique
    // =====================================================
    #[Route('/{id}', name: 'api_programs_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $program = $this->programRepo->find($id);

        if (!$program) {
            return $this->json(['error' => 'Programme introuvable.'], 404);
        }

        // Vérifier que le programme appartient à l'utilisateur connecté
        if ($program->getUser() !== $this->getUser()) {
            return $this->json(['error' => 'Accès refusé.'], 403);
        }

        return $this->json(['program' => $program->toArray()]);
    }

    // =====================================================
    // PUT /api/programs/{id}
    // Modifie un programme existant
    // =====================================================
    #[Route('/{id}', name: 'api_programs_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $program = $this->programRepo->find($id);

        if (!$program) {
            return $this->json(['error' => 'Programme introuvable.'], 404);
        }

        if ($program->getUser() !== $this->getUser()) {
            return $this->json(['error' => 'Accès refusé.'], 403);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['name']))          $program->setName($data['name']);
        if (isset($data['description']))   $program->setDescription($data['description']);
        if (isset($data['durationWeeks'])) $program->setDurationWeeks((int)$data['durationWeeks']);
        if (isset($data['frequency']))     $program->setFrequency($data['frequency']);
        if (isset($data['status']))        $program->setStatus($data['status']);
        if (isset($data['progress']))      $program->setProgress((int)$data['progress']);

        if (isset($data['startDate'])) {
            try {
                $program->setStartDate(new \DateTimeImmutable($data['startDate']));
            } catch (\Exception $e) {
                return $this->json(['error' => 'Format de date invalide.'], 400);
            }
        }

        $this->programRepo->save($program, true);

        return $this->json([
            'message' => 'Programme mis à jour avec succès.',
            'program' => $program->toArray(),
        ]);
    }

    // =====================================================
    // DELETE /api/programs/{id}
    // Supprime un programme
    // =====================================================
    #[Route('/{id}', name: 'api_programs_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $program = $this->programRepo->find($id);

        if (!$program) {
            return $this->json(['error' => 'Programme introuvable.'], 404);
        }

        if ($program->getUser() !== $this->getUser()) {
            return $this->json(['error' => 'Accès refusé.'], 403);
        }

        $this->programRepo->remove($program, true);

        return $this->json(['message' => 'Programme supprimé avec succès.']);
    }
}
