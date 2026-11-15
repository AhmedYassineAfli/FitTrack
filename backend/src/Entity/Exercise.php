<?php

namespace App\Entity;

use App\Repository\ExerciseRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Entité Exercise — Représente un mouvement ou exercice de musculation/sport.
 *
 * Correspond aux items de la bibliothèque d'exercices dans React :
 * { name: "Barbell Back Squat", muscle: "Quadriceps", level: "Advanced" }
 */
#[ORM\Entity(repositoryClass: ExerciseRepository::class)]
#[ORM\Table(name: 'exercises')]
#[ORM\HasLifecycleCallbacks]
class Exercise
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /**
     * Nom de l'exercice (ex: "Barbell Bench Press").
     */
    #[ORM\Column(length: 150)]
    #[AssertN\otBlank(message: 'Le nom de l\'exercice est obligatoire.')]
    #[Assert\Lnegth(max: 150)]
    private ?string $name = null;

    /**
     * Muscle ciblé principal (ex: "Quadriceps", "Chest", "Back", "Biceps").
     */
    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'Le muscle ciblé est obligatoire.')]
    #[Assert\Length(max: 100)]
    private ?string $muscle = null;

    /**
     * Niveau requis (Beginner, Intermediate, Advanced).
     */
    #[ORM\Column(length: 50)]
    #[Assert\NotBlank(message: 'Le niveau est obligatoire.')]
    #[Assert\Choice(
        choices: ['Beginner', 'Intermediate', 'Advanced'],
        message: 'Niveau invalide. Choisissez parmi : Beginner, Intermediate, Advanced.'
    )]
    private ?string $level = 'Beginner';

    /**
     * Description ou conseils d'exécution du mouvement.
     */
    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    /**
     * Catégorie à laquelle appartient l'exercice (Chest, Legs, Arms...).
     * Relation ManyToOne : Plusieurs exercices appartiennent à UNE catégorie.
     */
    #[ORM\ManyToOne(targetEntity: Category::class, inversedBy: 'exercises')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Category $category = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\PrePersist]
    public function initializeDates(): void
    {
        $now = new \DateTimeImmutable();
        $this->createdAt = $now;
        $this->updatedAt = $now;
    }

    #[ORM\PreUpdate]
    public function updateTimestamp(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getMuscle(): ?string
    {
        return $this->muscle;
    }

    public function setMuscle(string $muscle): static
    {
        $this->muscle = $muscle;
        return $this;
    }

    public function getLevel(): ?string
    {
        return $this->level;
    }

    public function setLevel(string $level): static
    {
        $this->level = $level;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getCategory(): ?Category
    {
        return $this->category;
    }

    public function setCategory(?Category $category): static
    {
        $this->category = $category;
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
}
