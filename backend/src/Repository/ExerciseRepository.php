<?php

namespace App\Repository;

use App\Entity\Exercise;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Exercise>
 */
class ExerciseRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Exercise::class);
    }

    public function save(Exercise $exercise, bool $flush = true): void
    {
        $this->getEntityManager()->persist($exercise);
        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Exercise $exercise, bool $flush = true): void
    {
        $this->getEntityManager()->remove($exercise);
        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Recherche filtrée des exercices par texte et catégorie.
     */
    public function search(?string $query = null, ?string $categoryName = null, ?string $level = null): array
    {
        $qb = $this->createQueryBuilder('e')
            ->leftJoin('e.category', 'c')
            ->addSelect('c')
            ->orderBy('e.name', 'ASC');

        if ($query && trim($query) !== '') {
            $qb->andWhere('LOWER(e.name) LIKE :q OR LOWER(e.muscle) LIKE :q')
               ->setParameter('q', '%' . strtolower(trim($query)) . '%');
        }

        if ($categoryName && strtolower($categoryName) !== 'all') {
            $categoryLower = strtolower(trim($categoryName));
            if ($categoryLower === 'legs') {
                $qb->andWhere('LOWER(c.name) = :cat OR LOWER(e.muscle) IN (:legMuscles)')
                   ->setParameter('cat', 'legs')
                   ->setParameter('legMuscles', ['quadriceps', 'hamstrings', 'legs', 'calves', 'glutes']);
            } elseif ($categoryLower === 'arms') {
                $qb->andWhere('LOWER(c.name) = :cat OR LOWER(e.muscle) IN (:armMuscles)')
                   ->setParameter('cat', 'arms')
                   ->setParameter('armMuscles', ['biceps', 'triceps', 'forearms']);
            } else {
                $qb->andWhere('LOWER(c.name) = :cat OR LOWER(e.muscle) LIKE :catLike')
                   ->setParameter('cat', $categoryLower)
                   ->setParameter('catLike', '%' . $categoryLower . '%');
            }
        }

        if ($level && strtolower($level) !== 'all') {
            $qb->andWhere('LOWER(e.level) = :level')
               ->setParameter('level', strtolower($level));
        }

        return $qb->getQuery()->getResult();
    }
}
