<?php

namespace App\Command;

use App\Entity\User;
use App\Enum\UserRole;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Commande sécurisée permettant à un administrateur système
 * d'attribuer ou de révoquer le rôle 'admin' à un utilisateur par son email.
 */
#[AsCommand(
    name: 'app:promote-admin',
    description: 'Attribue le rôle "admin" à un utilisateur par son adresse email.'
)]
class PromoteAdminCommand extends Command
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addArgument('email', InputArgument::REQUIRED, 'Adresse email de l\'utilisateur à promouvoir');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $email = strtolower(trim((string) $input->getArgument('email')));

        $user = $this->userRepository->findOneByEmail($email);
        if (!$user) {
            $io->error(sprintf('Utilisateur avec l\'email "%s" introuvable.', $email));
            return Command::FAILURE;
        }

        // Attribution stricte de l'Enum UserRole::ADMIN
        $user->setRoles([UserRole::ADMIN->value]);
        $this->entityManager->flush();

        $io->success(sprintf('L\'utilisateur "%s" possède désormais le rôle "admin".', $email));

        return Command::SUCCESS;
    }
}
