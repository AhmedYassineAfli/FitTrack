<?php

namespace App\Entity;

use App\Repository\ProgramRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProgramRepository::class)]
#[ORM\Table(name: 'programs')]
#[ORM\HasLifecycleCallbacks]
class Program
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

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(nullable: true)]
    private ?int $durationWeeks = null;

    // ex: "3 fois par semaine", "5 jours / semaine"
    #[ORM\Column(length: 100, nullable: true)]
    private ?string $frequency = null;

    // 'active' ou 'draft'
    #[ORM\Column(length: 20, options: ['default' => 'draft'])]
    private string $status = 'draft';

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $startDate = null;

    // Avancement en % (0-100)
    #[ORM\Column(options: ['default' => 0])]
    private int $progress = 0;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $updatedAt = null;

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

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): static { $this->description = $description; return $this; }

    public function getDurationWeeks(): ?int { return $this->durationWeeks; }
    public function setDurationWeeks(?int $durationWeeks): static { $this->durationWeeks = $durationWeeks; return $this; }

    public function getFrequency(): ?string { return $this->frequency; }
    public function setFrequency(?string $frequency): static { $this->frequency = $frequency; return $this; }

    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): static { $this->status = $status; return $this; }

    public function getStartDate(): ?\DateTimeImmutable { return $this->startDate; }
    public function setStartDate(?\DateTimeImmutable $startDate): static { $this->startDate = $startDate; return $this; }

    public function getProgress(): int { return $this->progress; }
    public function setProgress(int $progress): static { $this->progress = $progress; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): ?\DateTimeImmutable { return $this->updatedAt; }

    public function toArray(): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'description'   => $this->description,
            'durationWeeks' => $this->durationWeeks,
            'frequency'     => $this->frequency,
            'status'        => $this->status,
            'startDate'     => $this->startDate?->format('Y-m-d'),
            'progress'      => $this->progress,
            'createdAt'     => $this->createdAt?->format('c'),
            'updatedAt'     => $this->updatedAt?->format('c'),
        ];
    }
}
