<?php

namespace App\Entity;

use App\Repository\MeasurementRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MeasurementRepository::class)]
#[ORM\Table(name: 'measurements')]
#[ORM\HasLifecycleCallbacks]
class Measurement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    // Date de la mesure
    #[ORM\Column]
    private ?\DateTimeImmutable $date = null;

    // Poids en kg
    #[ORM\Column(type: 'decimal', precision: 5, scale: 2, nullable: true)]
    private ?float $weight = null;

    // Taux de masse grasse en %
    #[ORM\Column(type: 'decimal', precision: 5, scale: 2, nullable: true)]
    private ?float $bodyFat = null;

    // Tour de taille en cm
    #[ORM\Column(nullable: true)]
    private ?int $waist = null;

    // Tour de poitrine en cm
    #[ORM\Column(nullable: true)]
    private ?int $chest = null;

    // Tour de bras en cm
    #[ORM\Column(nullable: true)]
    private ?int $arms = null;

    // Tour de hanches en cm
    #[ORM\Column(nullable: true)]
    private ?int $hips = null;

    // Tour de cuisses en cm
    #[ORM\Column(nullable: true)]
    private ?int $thighs = null;

    // IMC calculé automatiquement
    #[ORM\Column(type: 'decimal', precision: 5, scale: 2, nullable: true)]
    private ?float $bmi = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTimeImmutable();
        if ($this->date === null) {
            $this->date = new \DateTimeImmutable();
        }
    }

    // =================== GETTERS & SETTERS ===================

    public function getId(): ?int { return $this->id; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }

    public function getDate(): ?\DateTimeImmutable { return $this->date; }
    public function setDate(\DateTimeImmutable $date): static { $this->date = $date; return $this; }

    public function getWeight(): ?float { return $this->weight; }
    public function setWeight(?float $weight): static { $this->weight = $weight; return $this; }

    public function getBodyFat(): ?float { return $this->bodyFat; }
    public function setBodyFat(?float $bodyFat): static { $this->bodyFat = $bodyFat; return $this; }

    public function getWaist(): ?int { return $this->waist; }
    public function setWaist(?int $waist): static { $this->waist = $waist; return $this; }

    public function getChest(): ?int { return $this->chest; }
    public function setChest(?int $chest): static { $this->chest = $chest; return $this; }

    public function getArms(): ?int { return $this->arms; }
    public function setArms(?int $arms): static { $this->arms = $arms; return $this; }

    public function getHips(): ?int { return $this->hips; }
    public function setHips(?int $hips): static { $this->hips = $hips; return $this; }

    public function getThighs(): ?int { return $this->thighs; }
    public function setThighs(?int $thighs): static { $this->thighs = $thighs; return $this; }

    public function getBmi(): ?float { return $this->bmi; }
    public function setBmi(?float $bmi): static { $this->bmi = $bmi; return $this; }

    /**
     * Calcule l'IMC à partir du poids et de la taille de l'utilisateur.
     * IMC = poids(kg) / (taille(m))²
     */
    public function calculateBmi(): void
    {
        $height = $this->user?->getHeight();
        if ($this->weight && $height && $height > 0) {
            $heightM = $height / 100; // cm → m
            $this->bmi = round($this->weight / ($heightM * $heightM), 2);
        }
    }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }

    public function toArray(): array
    {
        return [
            'id'        => $this->id,
            'date'      => $this->date?->format('Y-m-d'),
            'weight'    => $this->weight,
            'bodyFat'   => $this->bodyFat,
            'waist'     => $this->waist,
            'chest'     => $this->chest,
            'arms'      => $this->arms,
            'hips'      => $this->hips,
            'thighs'    => $this->thighs,
            'bmi'       => $this->bmi,
            'createdAt' => $this->createdAt?->format('c'),
        ];
    }
}
