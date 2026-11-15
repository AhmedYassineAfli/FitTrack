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
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * AuthController — Gère l'inscription et la déconnexion.
 *
 * IMPORTANT : La route de CONNEXION (/api/login) est gérée automatiquement
 * par le bundle LexikJWT, pas par ce controller. On configure ça dans security.yaml.
 *
 * Ce controller gère :
 *   POST /api/register → Créer un nouveau compte
 *   POST /api/logout   → Déconnexion (invalidation côté client)
 */
#[Route('/api', format: 'json')]
final class AuthController extends AbstractController
{
    /**
     * Le constructeur utilise l'injection de dépendances.
     *
     * Symfony détecte automatiquement que ce Controller a besoin de :
     *   - UserRepository      : pour sauvegarder l'utilisateur en BDD
     *   - UserPasswordHasherInterface : pour hasher le mot de passe
     *   - ValidatorInterface  : pour valider les données reçues
     *
     * On n'a pas besoin d'instancier ces services manuellement — Symfony les fournit.
     */
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly ValidatorInterface $validator,
    ) {}

    // =========================================================================
    // POST /api/login — CONNEXION (Interceptée par Symfony / LexikJWT)
    // =========================================================================

    /**
     * Route déclarée pour que le Router Symfony ne renvoie pas d'erreur 404.
     * Cette méthode ne sera jamais exécutée : le firewall json_login intercepte
     * la requête avant et retourne le token JWT.
     */
    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(): void
    {
        // Intercepté par lexik_jwt_authentication
    }

    // =========================================================================
    // POST /api/register — INSCRIPTION
    // =========================================================================

    /**
     * Crée un nouveau compte utilisateur.
     *
     * Corps de la requête JSON attendu :
     * {
     *   "firstName": "Alex",
     *   "lastName": "Morgan",
     *   "email": "alex@fittrack.app",
     *   "password": "motdepasse123",
     *   "fitnessGoal": "muscle_gain"   (optionnel)
     * }
     *
     * Réponses possibles :
     *   201 Created    → Inscription réussie
     *   400 Bad Request → Données manquantes ou invalides
     *   409 Conflict   → Email déjà utilisé
     */
    #[Route('/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        // ── 1. Lire le JSON envoyé par React ──────────────────────────────────
        // $request->getContent() récupère le corps brut de la requête HTTP
        // json_decode() le convertit en tableau PHP associatif
        $data = json_decode($request->getContent(), true);

        // Si le JSON est malformé (ex: React envoie du texte au lieu de JSON)
        if (!is_array($data)) {
            return $this->json(
                ['error' => 'Format JSON invalide.'],
                Response::HTTP_BAD_REQUEST  // 400
            );
        }

        // ── 2. Vérifier les champs obligatoires ───────────────────────────────
        $required = ['firstName', 'lastName', 'email', 'password'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return $this->json(
                    ['error' => sprintf('Le champ "%s" est obligatoire.', $field)],
                    Response::HTTP_BAD_REQUEST  // 400
                );
            }
        }

        // ── 3. Vérifier que l'email n'est pas déjà utilisé ───────────────────
        if ($this->userRepository->emailExists($data['email'])) {
            return $this->json(
                ['error' => 'Cette adresse email est déjà utilisée.'],
                Response::HTTP_CONFLICT  // 409
            );
        }

        // ── 4. Créer l'entité User ────────────────────────────────────────────
        $user = new User();
        $user->setFirstName(trim($data['firstName']));
        $user->setLastName(trim($data['lastName']));
        $user->setEmail(strtolower(trim($data['email'])));

        // SÉCURITÉ : Le rôle est STRICTEMENT forcé à 'athlete'.
        // Même si un attaquant tente d'injecter "role": "admin" ou "roles": ["ROLE_ADMIN"],
        // la valeur envoyée par le client est TOTALEMENT ignorée.
        $user->setRoles([\App\Enum\UserRole::ATHLETE->value]);

        // Champs optionnels
        if (!empty($data['fitnessGoal'])) {
            $user->setFitnessGoal($data['fitnessGoal']);
        }
        if (!empty($data['experienceLevel'])) {
            $user->setExperienceLevel($data['experienceLevel']);
        }
        if (!empty($data['age'])) {
            $user->setAge((int) $data['age']);
        }
        if (!empty($data['height'])) {
            $user->setHeight((int) $data['height']);
        }

        // ── 5. Hasher le mot de passe ─────────────────────────────────────────
        // JAMAIS stocker le mot de passe en clair !
        // hashPassword() applique bcrypt/argon2 selon la config security.yaml
        // Résultat : "$2y$13$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" (60+ caractères)
        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        // ── 6. Valider l'entité avec les contraintes #[Assert\...] ───────────
        $violations = $this->validator->validate($user);
        if (count($violations) > 0) {
            $errors = [];
            foreach ($violations as $violation) {
                // getPropertyPath() = nom du champ (ex: "email", "firstName")
                // getMessage() = message d'erreur de la contrainte
                $errors[$violation->getPropertyPath()] = $violation->getMessage();
            }
            return $this->json(
                ['errors' => $errors],
                Response::HTTP_BAD_REQUEST  // 400
            );
        }

        // ── 7. Sauvegarder en base de données ─────────────────────────────────
        // save() appelle persist() + flush() → génère le SQL INSERT
        $this->userRepository->save($user);

        // ── 8. Retourner la réponse de succès ─────────────────────────────────
        // On ne retourne PAS le mot de passe hashé dans la réponse !
        return $this->json(
            [
                'message' => 'Compte créé avec succès.',
                'user'    => $this->serializeUser($user),
            ],
            Response::HTTP_CREATED  // 201
        );
    }

    // =========================================================================
    // POST /api/logout — DÉCONNEXION
    // =========================================================================

    /**
     * Déconnexion de l'utilisateur.
     *
     * Avec JWT, la "vraie" déconnexion se fait côté React :
     * React supprime le token du localStorage.
     *
     * Côté serveur, on peut :
     *   1. (Simple) Juste retourner 200 OK → React supprime le token
     *   2. (Avancé) Mettre le token en "liste noire" dans Redis/BDD
     *
     * Pour ce projet universitaire, on utilise l'approche simple.
     */
    #[Route('/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        return $this->json(['message' => 'Déconnexion réussie.']);
    }

    // =========================================================================
    // MÉTHODE PRIVÉE — Sérialisation de l'utilisateur
    // =========================================================================

    /**
     * Convertit un objet User en tableau PHP pour la réponse JSON.
     *
     * "Sérialiser" = transformer un objet PHP en format transmissible (ici JSON).
     * On choisit quels champs exposer — on n'expose JAMAIS le mot de passe !
     */
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
            'roles'           => $user->getRoles(),
            'role'            => $user->getMainRole()->value,
            'createdAt'       => $user->getCreatedAt()?->format(\DateTimeInterface::ATOM),
        ];
    }
}
