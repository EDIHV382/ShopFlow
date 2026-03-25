<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'users')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $name;

    #[ORM\Column(length: 255, unique: true)]
    private string $email;

    #[ORM\Column(name: 'password_hash', length: 255)]
    private string $passwordHash;

    #[ORM\Column(type: 'json')]
    private array $roles = ['ROLE_USER'];

    #[ORM\Column(name: 'created_at', type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getName(): string { return $this->name; }
    public function setName(string $name): static { $this->name = $name; return $this; }
    public function getEmail(): string { return $this->email; }
    public function setEmail(string $email): static { $this->email = $email; return $this; }
    public function getPasswordHash(): string { return $this->passwordHash; }
    public function setPasswordHash(string $hash): static { $this->passwordHash = $hash; return $this; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }

    // UserInterface
    public function getUserIdentifier(): string { return $this->email; }
    public function getRoles(): array { return array_unique(array_merge($this->roles, ['ROLE_USER'])); }
    public function setRoles(array $roles): static { $this->roles = $roles; return $this; }
    public function getPassword(): string { return $this->passwordHash; }
    public function eraseCredentials(): void {}

    public function isAdmin(): bool { return in_array('ROLE_ADMIN', $this->roles, true); }
}
