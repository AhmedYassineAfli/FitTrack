<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;

/**
 * UserRepository — Toutes les requêtes vers la table `users`.
 *
 * Un Repository en Symfony, c'est comme un "assistant" qui sait comment
 * chercher des données dans une table spécifique.
 *
 * Il hérite de ServiceEntityRepository qui fournit déjà des méthodes prêtes à l'emploi :
 *   - find($id)              → Cherche par ID
 *   - findAll()              → Retourne tous les enregistrements
 *   - findBy(['email' => x]) → Cherche avec un filtre
 *   - findOneBy(['email' => x]) → Retourne un seul résultat
 *
 * On implémente aussi PasswordUpgraderInterface pour permettre à Symfony
 * de mettre à jour le hash du mot de passe si l'algorithme change.
 *
 * @extends ServiceEntityRepository<User>
 */
class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
    /**
     * Le constructeur injecte le ManagerRegistry (gestionnaire de connexions Doctrine).
     * C'est de l'injection de dépendances — Symfony fournit automatiquement ce paramètre.
     */
    public function __construct(ManagerRegistry $registry)
    {
        // On dit à Doctrine : "Ce Repository gère l'entité User"
        parent::__construct($registry, User::class);
    }

    /**
     * Sauvegarde un User en base de données.
     *
     * @param bool $flush  Si true → exécute le SQL immédiatement
     *                     Si false → prépare le SQL mais ne l'exécute pas encore
     *                     (utile pour grouper plusieurs opérations)
     */
    public function save(User $user, bool $flush = true): void
    {
        // persist() = "Symfony, surveille cet objet et prépare son insertion/mise à jour"
        $this->getEntityManager()->persist($user);

        if ($flush) {
            // flush() = "Exécute maintenant tous les SQL préparés"
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Supprime un User de la base de données.
     */
    public function remove(User $user, bool $flush = true): void
    {
        $this->getEntityManager()->remove($user);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Méthode requise par PasswordUpgraderInterface.
     *
     * Symfony appelle cette méthode pour mettre à jour le hash du mot de passe
     * d'un utilisateur si l'algorithme de hashage a été mis à jour (sécurité).
     */
    public function upgradePassword(PasswordAuthenticatedUserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', $user::class));
        }

        $user->setPassword($newHashedPassword);
        $this->save($user);
    }

    /**
     * Cherche un utilisateur par son email.
     * Retourne null si aucun utilisateur trouvé.
     *
     * Utilisation : $userRepository->findByEmail('alex@fittrack.app')
     */
    public function findByEmail(string $email): ?User
    {
        return $this->findOneBy(['email' => $email]);
    }

    /**
     * Vérifie si un email est déjà utilisé.
     * Utile pour la validation lors de l'inscription.
     */
    public function emailExists(string $email): bool
    {
        return $this->findByEmail($email) !== null;
    }
}
