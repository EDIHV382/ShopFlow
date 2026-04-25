<?php

namespace App\Entity;

use App\Repository\OrderRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OrderRepository::class)]
#[ORM\Table(name: 'orders')]
class Order
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', nullable: false)]
    private User $user;

    #[ORM\Column(length: 20)]
    private string $status = 'pending';

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private string $total;

    #[ORM\Column(name: 'shipping_address', type: 'json')]
    private array $shippingAddress = [];

    #[ORM\Column(name: 'stripe_payment_id', length: 255, nullable: true)]
    private ?string $stripePaymentId = null;

    #[ORM\Column(name: 'created_at', type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\OneToMany(mappedBy: 'order', targetEntity: OrderItem::class, cascade: ['persist', 'remove'])]
    private Collection $items;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->items = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getUser(): User { return $this->user; }
    public function setUser(User $user): static { $this->user = $user; return $this; }
    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): static { $this->status = $status; return $this; }
    public function getTotal(): float { return (float) $this->total; }
    public function setTotal(float $total): static { $this->total = (string) $total; return $this; }
    public function getShippingAddress(): array { return $this->shippingAddress; }
    public function setShippingAddress(array $addr): static { $this->shippingAddress = $addr; return $this; }
    public function getStripePaymentId(): ?string { return $this->stripePaymentId; }
    public function setStripePaymentId(?string $id): static { $this->stripePaymentId = $id; return $this; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getItems(): Collection { return $this->items; }
}
