<?php

namespace App\Enum;

/**
 * UserRole — Énumération stricte des rôles utilisateur dans FitTrack.
 *
 * Contient exactement les deux rôles autorisés :
 *   - ATHLETE : Rôle standard attribué automatiquement lors de l'inscription.
 *   - ADMIN   : Rôle privilégié réservé aux administrateurs.
 */
enum UserRole: string
{
    case ATHLETE = 'athlete';
    case ADMIN   = 'admin';

    /**
     * Retourne le nom du rôle pour le système de sécurité Symfony (préfixe ROLE_).
     * Exemples :
     *   UserRole::ATHLETE->toSymfonyRole() => 'ROLE_ATHLETE'
     *   UserRole::ADMIN->toSymfonyRole()   => 'ROLE_ADMIN'
     */
    public function toSymfonyRole(): string
    {
        return match ($this) {
            self::ATHLETE => 'ROLE_ATHLETE',
            self::ADMIN   => 'ROLE_ADMIN',
        };
    }

    /**
     * Convertit une chaîne de caractères ('athlete' ou 'admin') en instance d'Enum.
     * Retourne null si la valeur n'est pas valide.
     */
    public static function tryFromString(?string $value): ?self
    {
        if ($value === null) {
            return null;
        }

        return self::tryFrom(strtolower(trim($value)));
    }

    /**
     * Convertit un rôle Symfony ('ROLE_ADMIN', 'ROLE_ATHLETE', etc.) en valeur d'Enum.
     */
    public static function fromSymfonyRole(string $role): self
    {
        return match (strtoupper($role)) {
            'ROLE_ADMIN'   => self::ADMIN,
            'ROLE_ATHLETE' => self::ATHLETE,
            default        => self::ATHLETE,
        };
    }
}
