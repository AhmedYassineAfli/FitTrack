<?php

namespace App\Entity;

use App\Repository\WorkoutSessionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: WorkoutSessionRepository::class)]
#[ORM\Table(name: 'workout_sessions')]
#[ORM\HasLifecycleCallbacks]
class WorkoutSession
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    // strength | hypertrophy | conditioning | cardio | mobility
    #[ORM\Column(length: 50, nullable: true)]
    private ?string $type = null;

    // Durée en minutes
    #[ORM\Column(nullable: true)]
    private ?int $duration = null;

    // high | medium | low
    #[ORM\Column(length: 20, nullable: true)]
    private ?string $intensity = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $scheduledAt = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $notes = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $updatedAt = null;

    // Relation OneToMany vers les exercices de la séance
    #[ORM\OneToMany(mappedBy: 'session', targetEntity: SessionExercise::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['orderIndex' => 'ASC'])]
    private Collection $sessionExercises;

    public function __construct()
    {
        $this->sessionExercises = new ArrayCollection();
    }

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    // =================== GETTERS & SETTERS ===================

    public function getId(): ?int { return $this->id; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }

    public function getName(): ?string { return $this->name; }
    public function setName(string $name): static { $this->name = $name; return $this; }

    public function getType(): ?string { return $this->type; }
    public function setType(?string $type): static { $this->type = $type; return $this; }

    public function getDuration(): ?int { return $this->duration; }
    public function setDuration(?int $duration): static { $this->duration = $duration; return $this; }

    public function getIntensity(): ?string { return $this->intensity; }
    public function setIntensity(?string $intensity): static { $this->intensity = $intensity; return $this; }

    public function getScheduledAt(): ?\DateTimeImmutable { return $this->scheduledAt; }
    public function setScheduledAt(?\DateTimeImmutable $scheduledAt): static { $this->scheduledAt = $scheduledAt; return $this; }

    public function getNotes(): ?string { return $this->notes; }
    public function setNotes(?string $notes): static { $this->notes = $notes; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): ?\DateTimeImmutable { return $this->updatedAt; }

    public function getSessionExercises(): Collection { return $this->sessionExercises; }

    public function addSessionExercise(SessionExercise $ex): static
    {
        if (!$this->sessionExercises->contains($ex)) {
            $this->sessionExercises->add($ex);
            $ex->setSession($this);
        }
        return $this;
    }

    public function removeSessionExercise(SessionExercise $ex): static
    {
        $this->sessionExercises->removeElement($ex);
        return $this;
    }

    public function toArray(bool $withExercises = false): array
    {
        $data = [
            'id'          => $this->id,
            'name'        => $this->name,
            'type'        => $this->type,
            'duration'    => $this->duration,
            'intensity'   => $this->intensity,
            'scheduledAt' => $this->scheduledAt?->format('c'),
            'notes'       => $this->notes,
            'createdAt'   => $this->createdAt?->format('c'),
            'updatedAt'   => $this->updatedAt?->format('c'),
            'exerciseCount' => $this->sessionExercises->count(),
        ];

        if ($withExercises) {
            $data['exercises'] = array_map(
                fn(SessionExercise $se) => $se->toArray(),
                $this->sessionExercises->toArray()
            );
        }

        return $data;
    }
}
