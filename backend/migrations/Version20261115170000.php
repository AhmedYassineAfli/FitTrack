<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration : Création des tables `categories` et `exercises` (Module 4).
 */
final class Version20261115170000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Création des tables categories et exercises';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE categories (
            id INT AUTO_INCREMENT NOT NULL,
            name VARCHAR(100) NOT NULL,
            description LONGTEXT DEFAULT NULL,
            UNIQUE INDEX UNIQ_3AF346685E237E06 (name),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('CREATE TABLE exercises (
            id INT AUTO_INCREMENT NOT NULL,
            category_id INT DEFAULT NULL,
            name VARCHAR(150) NOT NULL,
            muscle VARCHAR(100) NOT NULL,
            level VARCHAR(50) NOT NULL,
            description LONGTEXT DEFAULT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            INDEX IDX_FA1499112469DE2 (category_id),
            CONSTRAINT FK_FA1499112469DE2 FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE exercises DROP FOREIGN KEY FK_FA1499112469DE2');
        $this->addSql('DROP TABLE exercises');
        $this->addSql('DROP TABLE categories');
    }
}
