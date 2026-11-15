<?php

namespace App\Controller;

use App\Entity\Measurement;
use App\Repository\MeasurementRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/measurements')]
#[IsGranted('ROLE_USER')]
class MeasurementController extends AbstractController
{
    public function __construct(private MeasurementRepository $measurementRepo) {}

    // =====================================================
    // GET /api/measurements
    // Liste toutes les mesures corporelles de l'utilisateur
    // =====================================================
    #[Route('', name: 'api_measurements_list', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $user = $this->getUser();
        $measurements = $this->measurementRepo->findByUser($user);

        return $this->json([
            'measurements' => array_map(fn(Measurement $m) => $m->toArray(), $measurements),
            'total'        => count($measurements),
            'latest'       => $measurements[0]?->toArray(), // La plus récente
        ]);
    }

    // =====================================================
    // POST /api/measurements
    // Enregistre une nouvelle mesure corporelle
    // =====================================================
    #[Route('', name: 'api_measurements_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $measurement = new Measurement();
        $measurement->setUser($this->getUser());

        // Date de la mesure (aujourd'hui par défaut)
        if (!empty($data['date'])) {
            try {
                $measurement->setDate(new \DateTimeImmutable($data['date']));
            } catch (\Exception $e) {
                return $this->json(['error' => 'Format de date invalide. Utilisez YYYY-MM-DD.'], 400);
            }
        } else {
            $measurement->setDate(new \DateTimeImmutable());
        }

        // Mesures optionnelles
        if (isset($data['weight']))  $measurement->setWeight((float)$data['weight']);
        if (isset($data['bodyFat'])) $measurement->setBodyFat((float)$data['bodyFat']);
        if (isset($data['waist']))   $measurement->setWaist((int)$data['waist']);
        if (isset($data['chest']))   $measurement->setChest((int)$data['chest']);
        if (isset($data['arms']))    $measurement->setArms((int)$data['arms']);
        if (isset($data['hips']))    $measurement->setHips((int)$data['hips']);
        if (isset($data['thighs']))  $measurement->setThighs((int)$data['thighs']);

        // Calcul automatique de l'IMC si taille disponible
        $measurement->calculateBmi();

        $this->measurementRepo->save($measurement, true);

        return $this->json([
            'message'     => 'Mesure enregistrée avec succès.',
            'measurement' => $measurement->toArray(),
        ], 201);
    }

    // =====================================================
    // GET /api/measurements/{id}
    // Détails d'une mesure spécifique
    // =====================================================
    #[Route('/{id}', name: 'api_measurements_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $measurement = $this->measurementRepo->find($id);

        if (!$measurement) {
            return $this->json(['error' => 'Mesure introuvable.'], 404);
        }

        if ($measurement->getUser() !== $this->getUser()) {
            return $this->json(['error' => 'Accès refusé.'], 403);
        }

        return $this->json(['measurement' => $measurement->toArray()]);
    }

    // =====================================================
    // DELETE /api/measurements/{id}
    // Supprime une mesure
    // =====================================================
    #[Route('/{id}', name: 'api_measurements_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $measurement = $this->measurementRepo->find($id);

        if (!$measurement) {
            return $this->json(['error' => 'Mesure introuvable.'], 404);
        }

        if ($measurement->getUser() !== $this->getUser()) {
            return $this->json(['error' => 'Accès refusé.'], 403);
        }

        $this->measurementRepo->remove($measurement, true);

        return $this->json(['message' => 'Mesure supprimée avec succès.']);
    }
}
