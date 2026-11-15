<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration : Ajout de la colonne `preferences` (JSON) dans `users` (Module 3).
 */
final class Version20261115164000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajout de la colonne preferences (JSON) dans users';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE users ADD preferences JSON DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE users DROP preferences');
    }
}
