<?php

namespace App\Entity;

use App\Repository\SessionExerciseRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SessionExerciseRepository::class)]
#[ORM\Table(name: 'session_exercises')]
class SessionExercise
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // Lien vers la séance parent
    #[ORM\ManyToOne(targetEntity: WorkoutSession::class, inversedBy: 'sessionExercises')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?WorkoutSession $session = null;

    // Lien vers l'exercice de la bibliothèque
    #[ORM\ManyToOne(targetEntity: Exercise::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Exercise $exercise = null;

    // Nombre de séries
    #[ORM\Column(options: ['default' => 3])]
    private int $sets = 3;

    // Nombre de répétitions (null = durée libre)
    #[ORM\Column(nullable: true)]
    private ?int $reps = null;

    // Poids en kg (null = poids du corps)
    #[ORM\Column(type: 'decimal', precision: 5, scale: 2, nullable: true)]
    private ?float $weight = null;

    // Temps de repos en secondes
    #[ORM\Column(nullable: true)]
    private ?int $restTime = null;

    // Ordre dans la séance (1, 2, 3...)
    #[ORM\Column(options: ['default' => 0])]
    private int $orderIndex = 0;

    // Notes spécifiques à cet exercice
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $notes = null;

    // =================== GETTERS & SETTERS ===================

    public function getId(): ?int { return $this->id; }

    public function getSession(): ?WorkoutSession { return $this->session; }
    public function setSession(?WorkoutSession $session): static { $this->session = $session; return $this; }

    public function getExercise(): ?Exercise { return $this->exercise; }
    public function setExercise(?Exercise $exercise): static { $this->exercise = $exercise; return $this; }

    public function getSets(): int { return $this->sets; }
    public function setSets(int $sets): static { $this->sets = $sets; return $this; }

    public function getReps(): ?int { return $this->reps; }
    public function setReps(?int $reps): static { $this->reps = $reps; return $this; }

    public function getWeight(): ?float { return $this->weight; }
    public function setWeight(?float $weight): static { $this->weight = $weight; return $this; }

    public function getRestTime(): ?int { return $this->restTime; }
    public function setRestTime(?int $restTime): static { $this->restTime = $restTime; return $this; }

    public function getOrderIndex(): int { return $this->orderIndex; }
    public function setOrderIndex(int $orderIndex): static { $this->orderIndex = $orderIndex; return $this; }

    public function getNotes(): ?string { return $this->notes; }
    public function setNotes(?string $notes): static { $this->notes = $notes; return $this; }

    public function toArray(): array
    {
        return [
            'id'         => $this->id,
            'exercise'   => [
                'id'     => $this->exercise?->getId(),
                'name'   => $this->exercise?->getName(),
                'muscle' => $this->exercise?->getMuscle(),
                'level'  => $this->exercise?->getLevel(),
            ],
            'sets'       => $this->sets,
            'reps'       => $this->reps,
            'weight'     => $this->weight,
            'restTime'   => $this->restTime,
            'orderIndex' => $this->orderIndex,
            'notes'      => $this->notes,
        ];
    }
}
