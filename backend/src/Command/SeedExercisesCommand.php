<?php

namespace App\Command;

use App\Entity\Category;
use App\Entity\Exercise;
use App\Repository\CategoryRepository;
use App\Repository\ExerciseRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Commande pour insérer les catégories et les exercices par défaut dans FitTrack.
 * Utilisation : php bin/console app:seed-exercises
 */
#[AsCommand(
    name: 'app:seed-exercises',
    description: 'Initialise la bibliothèque d\'exercices et catégories FitTrack'
)]
class SeedExercisesCommand extends Command
{
    public function __construct(
        private readonly CategoryRepository $categoryRepository,
        private readonly ExerciseRepository $exerciseRepository,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('FitTrack — Initialisation de la bibliothèque d\'exercices');

        // 1. Définition des catégories
        $categoriesData = [
            'Chest'     => 'Pectoraux et mouvements de poussée horizontale',
            'Back'      => 'Dorsaux, trapèzes et mouvements de tirage',
            'Legs'      => 'Quadriceps, ischios-jambiers, fessiers et mollets',
            'Shoulders' => 'Deltoïdes antérieurs, latéraux et postérieurs',
            'Arms'      => 'Biceps, triceps et avant-bras',
            'Core'      => 'Abdominaux, obliques et lombaires',
        ];

        $categories = [];
        foreach ($categoriesData as $name => $desc) {
            $cat = $this->categoryRepository->findByName($name);
            if (!$cat) {
                $cat = new Category();
                $cat->setName($name);
                $cat->setDescription($desc);
                $this->categoryRepository->save($cat, false);
                $io->text("Catégorie créée : $name");
            }
            $categories[$name] = $cat;
        }

        // 2. Définition des exercices initiaux (issus du Frontend React)
        $exercisesData = [
            [
                'name'     => 'Barbell Back Squat',
                'muscle'   => 'Quadriceps',
                'category' => 'Legs',
                'level'    => 'Advanced',
                'desc'     => 'Flexion sur jambes avec barre guidée ou libre sur les trapèzes.',
            ],
            [
                'name'     => 'Romanian Deadlift',
                'muscle'   => 'Hamstrings',
                'category' => 'Legs',
                'level'    => 'Intermediate',
                'desc'     => 'Soulevé de terre jambes tendues pour cibler les ischios et fessiers.',
            ],
            [
                'name'     => 'Incline Dumbbell Press',
                'muscle'   => 'Chest',
                'category' => 'Chest',
                'level'    => 'Intermediate',
                'desc'     => 'Développé incliné avec haltères pour le haut des pectoraux.',
            ],
            [
                'name'     => 'Pull Up',
                'muscle'   => 'Back',
                'category' => 'Back',
                'level'    => 'Intermediate',
                'desc'     => 'Tractions en pronation pour le grand dorsal.',
            ],
            [
                'name'     => 'Cable Lateral Raise',
                'muscle'   => 'Shoulders',
                'category' => 'Shoulders',
                'level'    => 'Beginner',
                'desc'     => 'Élévations latérales à la poulie pour le faisceau moyen du deltoïde.',
            ],
            [
                'name'     => 'Bulgarian Split Squat',
                'muscle'   => 'Legs',
                'category' => 'Legs',
                'level'    => 'Advanced',
                'desc'     => 'Fente unilatérale avec pied arrière surélevé.',
            ],
            [
                'name'     => 'Hammer Curl',
                'muscle'   => 'Biceps',
                'category' => 'Arms',
                'level'    => 'Beginner',
                'desc'     => 'Curl prise neutre ciblant le brachial antérieur et le long supinateur.',
            ],
            [
                'name'     => 'Hanging Leg Raise',
                'muscle'   => 'Core',
                'category' => 'Core',
                'level'    => 'Intermediate',
                'desc'     => 'Relevé de jambes suspendu à la barre fixe pour les abdominaux.',
            ],
            [
                'name'     => 'Barbell Bench Press',
                'muscle'   => 'Chest',
                'category' => 'Chest',
                'level'    => 'Intermediate',
                'desc'     => 'Développé couché classique à la barre.',
            ],
            [
                'name'     => 'Overhead Press',
                'muscle'   => 'Shoulders',
                'category' => 'Shoulders',
                'level'    => 'Intermediate',
                'desc'     => 'Développé militaire debout pour la force des épaules.',
            ],
        ];

        foreach ($exercisesData as $item) {
            $existing = $this->exerciseRepository->findOneBy(['name' => $item['name']]);
            if (!$existing) {
                $exercise = new Exercise();
                $exercise->setName($item['name']);
                $exercise->setMuscle($item['muscle']);
                $exercise->setLevel($item['level']);
                $exercise->setDescription($item['desc']);
                if (isset($categories[$item['category']])) {
                    $exercise->setCategory($categories[$item['category']]);
                }
                $this->exerciseRepository->save($exercise, false);
                $io->text("Exercice créé : {$item['name']}");
            }
        }

        // Exécuter toutes les insertions en une seule transaction
        $this->categoryRepository->getEntityManager()->flush();

        $io->success('Bibliothèque d\'exercices initialisée avec succès !');

        return Command::SUCCESS;
    }
}
