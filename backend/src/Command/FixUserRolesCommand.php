<?php

namespace App\Command;

use App\Entity\User;
use App\Enum\UserRole;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:fix-user-roles',
    description: 'Harmonise les rôles des utilisateurs existants vers l\'Enum UserRole (athlete par défaut).'
)]
class FixUserRolesCommand extends Command
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $users = $this->userRepository->findAll();

        $updated = 0;
        foreach ($users as $user) {
            // Assigner le rôle strict 'athlete' aux comptes
            $user->setRoles([UserRole::ATHLETE->value]);
            $updated++;
        }

        $this->entityManager->flush();
        $io->success(sprintf('Rôles harmonisés avec succès pour %d utilisateur(s) vers "athlete".', $updated));

        return Command::SUCCESS;
    }
}
