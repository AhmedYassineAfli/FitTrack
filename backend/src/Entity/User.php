<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Entité User — Représente la table `users` dans PostgreSQL.
 *
 * Cette classe implémente deux interfaces Symfony :
 *   - UserInterface             : permet à Symfony Security de gérer cet objet comme un "utilisateur"
 *   - PasswordAuthenticatedUserInterface : indique que cet utilisateur a un mot de passe hashé
 *
 * RAPPEL : Une "entité" en Symfony = une classe PHP qui correspond à une table en base de données.
 * Chaque propriété de la classe = une colonne dans la table.
 */
#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'users')]
#[ORM\HasLifecycleCallbacks]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    // =========================================================================
    // IDENTIFIANT
    // =========================================================================

    /**
     * Identifiant unique auto-généré par PostgreSQL.
     *
     * #[ORM\Id]              → C'est la clé primaire de la table
     * #[ORM\GeneratedValue]  → PostgreSQL génère la valeur automatiquement (auto-increment)
     * #[ORM\Column]          → Cette propriété correspond à une colonne en BDD
     */
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // =========================================================================
    // INFORMATIONS PERSONNELLES
    // =========================================================================

    /**
     * Prénom de l'utilisateur.
     * length: 100 → maximum 100 caractères dans la colonne
     * nullable: false → champ obligatoire en BDD (valeur par défaut)
     */
    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'Le prénom est obligatoire.')]
    #[Assert\Length(max: 100, maxMessage: 'Le prénom ne peut pas dépasser {{ limit }} caractères.')]
    private ?string $firstName = null;

    /**
     * Nom de famille de l'utilisateur.
     */
    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'Le nom est obligatoire.')]
    #[Assert\Length(max: 100, maxMessage: 'Le nom ne peut pas dépasser {{ limit }} caractères.')]
    private ?string $lastName = null;

    /**
     * Adresse email — unique dans la table (deux users ne peuvent pas avoir le même email).
     * unique: true → Doctrine crée un index UNIQUE sur cette colonne en PostgreSQL.
     */
    #[ORM\Column(length: 180, unique: true)]
    #[Assert\NotBlank(message: 'L\'email est obligatoire.')]
    #[Assert\Email(message: 'L\'adresse email "{{ value }}" n\'est pas valide.')]
    private ?string $email = null;

    /**
     * Âge de l'utilisateur (en années).
     * nullable: true → le champ est optionnel (peut être NULL en BDD)
     */
    #[ORM\Column(nullable: true)]
    #[Assert\Positive(message: 'L\'âge doit être un nombre positif.')]
    #[Assert\LessThan(value: 120, message: 'L\'âge doit être inférieur à 120 ans.')]
    private ?int $age = null;

    /**
     * Taille de l'utilisateur en centimètres.
     * nullable: true → optionnel
     */
    #[ORM\Column(nullable: true)]
    #[Assert\Positive(message: 'La taille doit être un nombre positif.')]
    private ?int $height = null;

    // =========================================================================
    // OBJECTIF FITNESS ET NIVEAU
    // Ces valeurs correspondent exactement à celles du Frontend React (mockData.ts)
    // =========================================================================

    /**
     * Objectif fitness principal de l'utilisateur.
     *
     * Valeurs possibles (enum côté PHP) :
     *   - 'weight_loss'      → Perte de poids
     *   - 'muscle_gain'      → Prise de masse (défaut du formulaire React)
     *   - 'general_fitness'  → Forme générale
     */
    #[ORM\Column(length: 50, nullable: true)]
    #[Assert\Choice(
        choices: ['weight_loss', 'muscle_gain', 'general_fitness'],
        message: 'Objectif invalide. Choisissez parmi : weight_loss, muscle_gain, general_fitness.'
    )]
    private ?string $fitnessGoal = null;

    /**
     * Niveau d'expérience de l'utilisateur.
     *
     * Valeurs possibles :
     *   - 'beginner'      → Débutant
     *   - 'intermediate'  → Intermédiaire
     *   - 'advanced'      → Avancé
     */
    #[ORM\Column(length: 50, nullable: true)]
    #[Assert\Choice(
        choices: ['beginner', 'intermediate', 'advanced'],
        message: 'Niveau invalide. Choisissez parmi : beginner, intermediate, advanced.'
    )]
    private ?string $experienceLevel = null;

    /**
     * Préférences utilisateur (système de mesure, notifications, etc.).
     * Stockées au format JSON.
     */
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

    // =========================================================================
    // SÉCURITÉ — Champs gérés par Symfony Security
    // =========================================================================

    /**
     * Rôles de l'utilisateur pour la gestion des permissions.
     *
     * Stocké sous forme de JSON en BDD.
     * Les deux rôles métiers FitTrack (Enum UserRole) sont :
     *   - 'athlete' (qui donne ROLE_ATHLETE et ROLE_USER)
     *   - 'admin'   (qui donne ROLE_ADMIN)
     */
    #[ORM\Column(type: 'json')]
    private array $roles = ['athlete'];

    /**
     * Mot de passe hashé (jamais le mot de passe en clair !).
     *
     * Symfony utilise bcrypt/argon2 pour hasher le mot de passe.
     * Le hash ressemble à : $2y$13$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
     * Il est impossible de retrouver le mot de passe original depuis le hash.
     */
    #[ORM\Column]
    private ?string $password = null;

    // =========================================================================
    // MÉTADONNÉES — Dates automatiques
    // =========================================================================

    /**
     * Date de création du compte — renseignée automatiquement par Symfony.
     * DateTimeImmutable = objet date immuable (ne peut pas être modifié après création)
     */
    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    /**
     * Date de dernière modification — mise à jour automatiquement.
     */
    #[ORM\Column]
    private ?\DateTimeImmutable $updatedAt = null;

    // =========================================================================
    // LIFECYCLE CALLBACKS — Méthodes appelées automatiquement par Doctrine
    // =========================================================================

    /**
     * Appelée automatiquement par Doctrine AVANT l'insertion en BDD.
     * Initialise les dates createdAt et updatedAt.
     *
     * #[ORM\PrePersist] = "avant de persister (sauvegarder pour la 1ère fois)"
     */
    #[ORM\PrePersist]
    public function initializeDates(): void
    {
        $now = new \DateTimeImmutable();
        $this->createdAt = $now;
        $this->updatedAt = $now;
    }

    /**
     * Appelée automatiquement par Doctrine AVANT une mise à jour en BDD.
     *
     * #[ORM\PreUpdate] = "avant de mettre à jour"
     */
    #[ORM\PreUpdate]
    public function updateTimestamp(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    // =========================================================================
    // GETTERS ET SETTERS
    // Les getters lisent les données, les setters les modifient.
    // =========================================================================

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): static
    {
        $this->firstName = $firstName;
        // "static" = retourne $this pour permettre le chaînage :
        // $user->setFirstName('Alex')->setLastName('Morgan')
        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): static
    {
        $this->lastName = $lastName;
        return $this;
    }

    /**
     * Retourne le nom complet (prénom + nom).
     * Méthode utilitaire calculée, pas stockée en BDD.
     */
    public function getFullName(): string
    {
        return trim($this->firstName . ' ' . $this->lastName);
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getAge(): ?int
    {
        return $this->age;
    }

    public function setAge(?int $age): static
    {
        $this->age = $age;
        return $this;
    }

    public function getHeight(): ?int
    {
        return $this->height;
    }

    public function setHeight(?int $height): static
    {
        $this->height = $height;
        return $this;
    }

    public function getFitnessGoal(): ?string
    {
        return $this->fitnessGoal;
    }

    public function setFitnessGoal(?string $fitnessGoal): static
    {
        $this->fitnessGoal = $fitnessGoal;
        return $this;
    }

    public function getExperienceLevel(): ?string
    {
        return $this->experienceLevel;
    }

    public function setExperienceLevel(?string $experienceLevel): static
    {
        $this->experienceLevel = $experienceLevel;
        return $this;
    }

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

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    // =========================================================================
    // MÉTHODES REQUISES PAR UserInterface (Symfony Security)
    // Ces méthodes sont obligatoires — Symfony les appelle en interne.
    // =========================================================================

    /**
     * Retourne l'identifiant unique de l'utilisateur pour Symfony Security.
     * Symfony utilise l'email comme identifiant principal (au lieu du username).
     *
     * Cette méthode est appelée par le JWT Bundle pour savoir "qui est cet utilisateur".
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * Retourne les rôles de l'utilisateur pour le système de sécurité Symfony.
     *
     * Mappe les rôles métiers ('athlete', 'admin') vers les rôles Symfony ('ROLE_ATHLETE', 'ROLE_ADMIN').
     * Garantit toujours la présence de ROLE_USER et de ROLE_ATHLETE par défaut.
     */
    public function getRoles(): array
    {
        $roles = [];

        foreach ($this->roles as $role) {
            $enum = \App\Enum\UserRole::tryFromString($role);
            if ($enum !== null) {
                $roles[] = $enum->toSymfonyRole();
            } elseif (str_starts_with($role, 'ROLE_')) {
                $roles[] = $role;
            }
        }

        // Si aucun rôle explicite, attribue par défaut ROLE_ATHLETE
        if (empty($roles)) {
            $roles[] = 'ROLE_ATHLETE';
        }

        // ROLE_USER est le socle de sécurité Symfony
        $roles[] = 'ROLE_USER';

        return array_values(array_unique($roles));
    }

    /**
     * Définit les rôles en filtrant strictement via l'Enum UserRole.
     * Ne conserve que 'athlete' et 'admin'.
     */
    public function setRoles(array $roles): static
    {
        $filtered = [];
        foreach ($roles as $role) {
            $enum = \App\Enum\UserRole::tryFromString($role);
            if ($enum !== null) {
                $filtered[] = $enum->value;
            }
        }

        // Si la liste est vide, par défaut 'athlete'
        if (empty($filtered)) {
            $filtered[] = \App\Enum\UserRole::ATHLETE->value;
        }

        $this->roles = array_values(array_unique($filtered));
        return $this;
    }

    /**
     * Retourne le rôle principal FitTrack sous forme d'Enum UserRole.
     */
    public function getMainRole(): \App\Enum\UserRole
    {
        if (in_array(\App\Enum\UserRole::ADMIN->value, $this->roles, true) || in_array('ROLE_ADMIN', $this->roles, true)) {
            return \App\Enum\UserRole::ADMIN;
        }

        return \App\Enum\UserRole::ATHLETE;
    }

    /**
     * Vérifie si l'utilisateur est administrateur.
     */
    public function isAdmin(): bool
    {
        return $this->getMainRole() === \App\Enum\UserRole::ADMIN;
    }

    /**
     * Retourne le mot de passe hashé.
     * Symfony vérifie le mot de passe avec cette méthode.
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    /**
     * Efface les données sensibles (si elles étaient en mémoire).
     * Dans notre cas, on ne stocke que le hash, donc rien à effacer.
     * Méthode obligatoire par l'interface.
     */
    public function eraseCredentials(): void
    {
        // Si on stockait temporairement le mot de passe en clair,
        // on le remettrait à null ici.
        // $this->plainPassword = null;
    }
}
