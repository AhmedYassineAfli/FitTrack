<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/**
 * HealthController — Vérification que l'API fonctionne.
 *
 * Cette route est utilisée pour :
 * - Vérifier que le serveur Symfony est démarré
 * - Tester la connexion React → Symfony (CORS)
 * - Monitorer l'état de l'API
 */
final class HealthController extends AbstractController
{
    /**
     * GET /api/health
     *
     * Retourne le statut de l'API FitTrack.
     * Cette route est publique (pas d'authentification requise).
     */
    #[Route('/api/health', name: 'api_health', methods: ['GET'], format: 'json')]
    public function __invoke(): JsonResponse
    {
        return $this->json([
            'status'    => 'ok',
            'service'   => 'fittrack-api',
            'version'   => '1.0.0',
            'timestamp' => (new \DateTimeImmutable())->format(\DateTimeInterface::ATOM),
        ]);
    }
}
