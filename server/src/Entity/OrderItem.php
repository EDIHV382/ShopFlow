<?php

namespace App\Entity;

use App\Repository\OrderItemRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OrderItemRepository::class)]
#[ORM\Table(name: 'order_items')]
class OrderItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Order::class, inversedBy: 'items')]
    #[ORM\JoinColumn(name: 'order_id', nullable: false)]
    private Order $order;

    #[ORM\ManyToOne(targetEntity: Product::class)]
    #[ORM\JoinColumn(name: 'product_id', nullable: true, onDelete: 'SET NULL')]
    private ?Product $product = null;

    #[ORM\Column(name: 'product_name', length: 255)]
    private string $productName;

    #[ORM\Column(name: 'product_images', type: 'json')]
    private array $productImages = [];

    #[ORM\Column(type: 'integer')]
    private int $quantity;

    #[ORM\Column(name: 'unit_price', type: 'decimal', precision: 10, scale: 2)]
    private string $unitPrice;

    public function getId(): ?int { return $this->id; }
    public function getOrder(): Order { return $this->order; }
    public function setOrder(Order $order): static { $this->order = $order; return $this; }
    public function getProduct(): ?Product { return $this->product; }
    public function setProduct(?Product $p): static { $this->product = $p; return $this; }
    public function getProductName(): string { return $this->productName; }
    public function setProductName(string $n): static { $this->productName = $n; return $this; }
    public function getProductImages(): array { return $this->productImages; }
    public function setProductImages(array $i): static { $this->productImages = $i; return $this; }
    public function getQuantity(): int { return $this->quantity; }
    public function setQuantity(int $q): static { $this->quantity = $q; return $this; }
    public function getUnitPrice(): float { return (float) $this->unitPrice; }
    public function setUnitPrice(float $p): static { $this->unitPrice = (string) $p; return $this; }
}
