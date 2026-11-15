<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * AdminController — Routes sécurisées réservées exclusivement au rôle ADMIN.
 */
#[Route('/api/admin', format: 'json')]
#[IsGranted('ROLE_ADMIN')]
class AdminController extends AbstractController
{
    public function __construct(private readonly UserRepository $userRepository) {}

    /**
     * GET /api/admin/dashboard
     * Accessible uniquement si l'utilisateur possède le rôle admin.
     */
    #[Route('/dashboard', name: 'api_admin_dashboard', methods: ['GET'])]
    public function dashboard(): JsonResponse
    {
        $usersCount = count($this->userRepository->findAll());

        return $this->json([
            'message'    => 'Bienvenue dans la zone d\'administration FitTrack.',
            'usersCount' => $usersCount,
            'adminUser'  => $this->getUser()->getUserIdentifier(),
        ]);
    }
}
