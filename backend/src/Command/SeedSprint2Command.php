<?php

namespace App\Command;

use App\Entity\Measurement;
use App\Entity\Program;
use App\Entity\SessionExercise;
use App\Entity\WorkoutSession;
use App\Repository\ExerciseRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:seed-sprint2',
    description: 'Crée des données de test pour le Sprint 2 (programmes, séances, mesures)'
)]
class SeedSprint2Command extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserRepository $userRepo,
        private ExerciseRepository $exerciseRepo
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Récupérer le premier utilisateur
        $users = $this->userRepo->findAll();
        if (empty($users)) {
            $io->error("Aucun utilisateur trouvé. Veuillez d'abord créer un compte.");
            return Command::FAILURE;
        }

        $user = $users[0];
        $io->note("Peuplement des données pour l'utilisateur : " . $user->getEmail());

        $exercises = $this->exerciseRepo->findAll();

        // 1. Programmes
        $prog1 = new Program();
        $prog1->setUser($user);
        $prog1->setName('Prise de Masse — Upper / Lower');
        $prog1->setDescription('Programme de musculation structuré sur 4 jours par semaine ciblant l\'hypertrophie.');
        $prog1->setDurationWeeks(12);
        $prog1->setFrequency('4 séances / semaine');
        $prog1->setStatus('active');
        $prog1->setStartDate(new \DateTimeImmutable('-2 weeks'));
        $prog1->setProgress(35);
        $this->em->persist($prog1);

        $prog2 = new Program();
        $prog2->setUser($user);
        $prog2->setName('Conditioning & Mobilité');
        $prog2->setDescription('Programme léger axé sur l\'endurance cardiovasculaire et la souplesse articulaire.');
        $prog2->setDurationWeeks(6);
        $prog2->setFrequency('3 séances / semaine');
        $prog2->setStatus('draft');
        $prog2->setProgress(0);
        $this->em->persist($prog2);

        // 2. Séances (Workout Sessions)
        $w1 = new WorkoutSession();
        $w1->setUser($user);
        $w1->setName('Upper Body Power');
        $w1->setType('strength');
        $w1->setDuration(60);
        $w1->setIntensity('high');
        $w1->setScheduledAt(new \DateTimeImmutable('+1 day 18:00'));
        $w1->setNotes('Focus sur la charge au développé couché et le tirage vertical.');
        $this->em->persist($w1);

        // Ajouter des exercices à la séance si disponibles
        if (!empty($exercises)) {
            foreach (array_slice($exercises, 0, 3) as $i => $ex) {
                $se = new SessionExercise();
                $se->setSession($w1);
                $se->setExercise($ex);
                $se->setSets(4);
                $se->setReps(8 + $i * 2);
                $se->setWeight(60.0 + $i * 10.0);
                $se->setRestTime(90);
                $se->setOrderIndex($i);
                $w1->addSessionExercise($se);
            }
        }

        $w2 = new WorkoutSession();
        $w2->setUser($user);
        $w2->setName('Leg Day Brutal');
        $w2->setType('hypertrophy');
        $w2->setDuration(75);
        $w2->setIntensity('high');
        $w2->setScheduledAt(new \DateTimeImmutable('+3 days 17:30'));
        $w2->setNotes('Squats lourds puis séries longues aux fentes.');
        $this->em->persist($w2);

        // 3. Mesures Corporelles
        $m1 = new Measurement();
        $m1->setUser($user);
        $m1->setDate(new \DateTimeImmutable('-30 days'));
        $m1->setWeight(76.5);
        $m1->setBodyFat(16.5);
        $m1->setWaist(84);
        $m1->setChest(102);
        $m1->setArms(36);
        $m1->calculateBmi();
        $this->em->persist($m1);

        $m2 = new Measurement();
        $m2->setUser($user);
        $m2->setDate(new \DateTimeImmutable('-14 days'));
        $m2->setWeight(75.2);
        $m2->setBodyFat(15.8);
        $m2->setWaist(82);
        $m2->setChest(103);
        $m2->setArms(37);
        $m2->calculateBmi();
        $this->em->persist($m2);

        $m3 = new Measurement();
        $m3->setUser($user);
        $m3->setDate(new \DateTimeImmutable('-2 days'));
        $m3->setWeight(74.2);
        $m3->setBodyFat(14.9);
        $m3->setWaist(80);
        $m3->setChest(104);
        $m3->setArms(38);
        $m3->calculateBmi();
        $this->em->persist($m3);

        $this->em->flush();

        $io->success('Sprint 2 données de test insérées avec succès !');

        return Command::SUCCESS;
    }
}
