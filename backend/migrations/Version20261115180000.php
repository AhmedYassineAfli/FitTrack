<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261115180000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Sprint 2: Creates programs, workout_sessions, session_exercises, and measurements tables';
    }

    public function up(Schema $schema): void
    {
        // 1. Table programs
        $this->addSql('CREATE TABLE programs (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            description LONGTEXT DEFAULT NULL,
            duration_weeks INT DEFAULT NULL,
            frequency VARCHAR(100) DEFAULT NULL,
            status VARCHAR(20) DEFAULT \'draft\' NOT NULL,
            start_date DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            progress INT DEFAULT 0 NOT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            INDEX IDX_PROGRAMS_USER (user_id),
            PRIMARY KEY(id),
            CONSTRAINT FK_PROGRAMS_USER FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // 2. Table workout_sessions
        $this->addSql('CREATE TABLE workout_sessions (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(50) DEFAULT NULL,
            duration INT DEFAULT NULL,
            intensity VARCHAR(20) DEFAULT NULL,
            scheduled_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            notes LONGTEXT DEFAULT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            INDEX IDX_WORKOUTS_USER (user_id),
            PRIMARY KEY(id),
            CONSTRAINT FK_WORKOUTS_USER FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // 3. Table session_exercises
        $this->addSql('CREATE TABLE session_exercises (
            id INT AUTO_INCREMENT NOT NULL,
            session_id INT NOT NULL,
            exercise_id INT NOT NULL,
            sets INT DEFAULT 3 NOT NULL,
            reps INT DEFAULT NULL,
            weight NUMERIC(5, 2) DEFAULT NULL,
            rest_time INT DEFAULT NULL,
            order_index INT DEFAULT 0 NOT NULL,
            notes LONGTEXT DEFAULT NULL,
            INDEX IDX_SE_SESSION (session_id),
            INDEX IDX_SE_EXERCISE (exercise_id),
            PRIMARY KEY(id),
            CONSTRAINT FK_SE_SESSION FOREIGN KEY (session_id) REFERENCES workout_sessions (id) ON DELETE CASCADE,
            CONSTRAINT FK_SE_EXERCISE FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // 4. Table measurements
        $this->addSql('CREATE TABLE measurements (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            date DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            weight NUMERIC(5, 2) DEFAULT NULL,
            body_fat NUMERIC(5, 2) DEFAULT NULL,
            waist INT DEFAULT NULL,
            chest INT DEFAULT NULL,
            arms INT DEFAULT NULL,
            hips INT DEFAULT NULL,
            thighs INT DEFAULT NULL,
            bmi NUMERIC(5, 2) DEFAULT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            INDEX IDX_MEASUREMENTS_USER (user_id),
            PRIMARY KEY(id),
            CONSTRAINT FK_MEASUREMENTS_USER FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE session_exercises');
        $this->addSql('DROP TABLE workout_sessions');
        $this->addSql('DROP TABLE programs');
        $this->addSql('DROP TABLE measurements');
    }
}
