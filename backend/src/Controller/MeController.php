<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * MeController — Gère le profil de l'utilisateur connecté.
 *
 * Toutes les routes de ce controller nécessitent d'être connecté.
 * L'attribut #[IsGranted('ROLE_USER')] protège chaque route.
 *
 * Routes :
 *   GET  /api/me          → Récupérer son profil
 *   PUT  /api/me          → Modifier ses informations personnelles
 *   PUT  /api/me/password → Modifier son mot de passe
 */
#[Route('/api/me', format: 'json')]
#[IsGranted('ROLE_USER')]
final class MeController extends AbstractController
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly ValidatorInterface $validator,
    ) {}

    // =========================================================================
    // GET /api/me — Récupérer le profil de l'utilisateur connecté
    // =========================================================================

    /**
     * Retourne les informations de l'utilisateur actuellement connecté.
     *
     * Comment Symfony sait qui est connecté ?
     * → Le bundle LexikJWT lit le token dans l'en-tête Authorization
     * → Il décode le token et trouve l'email de l'utilisateur
     * → Il charge l'utilisateur depuis la BDD via UserRepository
     * → $this->getUser() retourne cet utilisateur
     */
    #[Route('', name: 'api_me_get', methods: ['GET'])]
    public function getProfile(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        return $this->json($this->serializeUser($user));
    }

    // =========================================================================
    // PUT /api/me — Modifier ses informations personnelles
    // =========================================================================

    /**
     * Met à jour les informations de l'utilisateur connecté.
     *
     * Corps JSON accepté (tous les champs sont optionnels) :
     * {
     *   "firstName": "Alexandre",
     *   "lastName": "Morgan",
     *   "age": 29,
     *   "height": 182,
     *   "fitnessGoal": "weight_loss",
     *   "experienceLevel": "advanced"
     * }
     *
     * Note : L'email ne peut PAS être modifié ici (sécurité).
     */
    #[Route('', name: 'api_me_update', methods: ['PUT', 'PATCH'])]
    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'Format JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        // Mise à jour sélective — on ne modifie que les champs envoyés
        // array_key_exists() vérifie si la clé est présente (même si la valeur est null)
        if (array_key_exists('firstName', $data) && !empty($data['firstName'])) {
            $user->setFirstName(trim($data['firstName']));
        }
        if (array_key_exists('lastName', $data) && !empty($data['lastName'])) {
            $user->setLastName(trim($data['lastName']));
        }
        if (array_key_exists('age', $data)) {
            $user->setAge($data['age'] !== null ? (int) $data['age'] : null);
        }
        if (array_key_exists('height', $data)) {
            $user->setHeight($data['height'] !== null ? (int) $data['height'] : null);
        }
        if (array_key_exists('fitnessGoal', $data)) {
            $user->setFitnessGoal($data['fitnessGoal']);
        }
        if (array_key_exists('experienceLevel', $data)) {
            $user->setExperienceLevel($data['experienceLevel']);
        }
        if (array_key_exists('preferences', $data) && is_array($data['preferences'])) {
            $currentPreferences = $user->getPreferences();
            $user->setPreferences(array_replace_recursive($currentPreferences, $data['preferences']));
        }

        // Validation des contraintes #[Assert\...]
        $violations = $this->validator->validate($user);
        if (count($violations) > 0) {
            $errors = [];
            foreach ($violations as $violation) {
                $errors[$violation->getPropertyPath()] = $violation->getMessage();
            }
            return $this->json(['errors' => $errors], Response::HTTP_BAD_REQUEST);
        }

        // Sauvegarde (UPDATE en SQL)
        $this->userRepository->save($user);

        return $this->json([
            'message' => 'Profil mis à jour avec succès.',
            'user'    => $this->serializeUser($user),
        ]);
    }

    // =========================================================================
    // PUT /api/me/preferences — Modifier ses préférences
    // =========================================================================

    /**
     * Met à jour les préférences de l'utilisateur (système métrique, notifications, etc.).
     */
    #[Route('/preferences', name: 'api_me_preferences', methods: ['PUT', 'PATCH'])]
    public function updatePreferences(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'Format JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $currentPreferences = $user->getPreferences();
        $user->setPreferences(array_replace_recursive($currentPreferences, $data));

        $this->userRepository->save($user);

        return $this->json([
            'message'     => 'Préférences mises à jour avec succès.',
            'preferences' => $user->getPreferences(),
        ]);
    }

    // =========================================================================
    // PUT /api/me/password — Modifier son mot de passe
    // =========================================================================

    /**
     * Modifie le mot de passe de l'utilisateur connecté.
     *
     * Corps JSON attendu :
     * {
     *   "currentPassword": "ancien_mot_de_passe",
     *   "newPassword": "nouveau_mot_de_passe",
     *   "confirmPassword": "nouveau_mot_de_passe"
     * }
     */
    #[Route('/password', name: 'api_me_password', methods: ['PUT'])]
    public function changePassword(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'Format JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        // Vérification des champs obligatoires
        if (empty($data['currentPassword']) || empty($data['newPassword']) || empty($data['confirmPassword'])) {
            return $this->json(
                ['error' => 'currentPassword, newPassword et confirmPassword sont obligatoires.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Vérifier que l'ancien mot de passe est correct
        // isPasswordValid() compare le mot de passe en clair avec le hash stocké
        if (!$this->passwordHasher->isPasswordValid($user, $data['currentPassword'])) {
            return $this->json(
                ['error' => 'Le mot de passe actuel est incorrect.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Vérifier que les deux nouveaux mots de passe correspondent
        if ($data['newPassword'] !== $data['confirmPassword']) {
            return $this->json(
                ['error' => 'Les nouveaux mots de passe ne correspondent pas.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Vérifier la longueur minimale
        if (strlen($data['newPassword']) < 8) {
            return $this->json(
                ['error' => 'Le nouveau mot de passe doit contenir au moins 8 caractères.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Hasher et sauvegarder le nouveau mot de passe
        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['newPassword']);
        $user->setPassword($hashedPassword);
        $this->userRepository->save($user);

        return $this->json(['message' => 'Mot de passe modifié avec succès.']);
    }

    // =========================================================================
    // MÉTHODE PRIVÉE — Sérialisation
    // =========================================================================

    private function serializeUser(User $user): array
    {
        return [
            'id'              => $user->getId(),
            'firstName'       => $user->getFirstName(),
            'lastName'        => $user->getLastName(),
            'fullName'        => $user->getFullName(),
            'email'           => $user->getEmail(),
            'age'             => $user->getAge(),
            'height'          => $user->getHeight(),
            'fitnessGoal'     => $user->getFitnessGoal(),
            'experienceLevel' => $user->getExperienceLevel(),
            'preferences'     => $user->getPreferences(),
            'roles'           => $user->getRoles(),
            'role'            => $user->getMainRole()->value,
            'createdAt'       => $user->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'updatedAt'       => $user->getUpdatedAt()?->format(\DateTimeInterface::ATOM),
        ];
    }
}
