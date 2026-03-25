<?php

namespace App\Entity;

use App\Repository\CartItemRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CartItemRepository::class)]
#[ORM\Table(name: 'cart_items')]
class CartItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Cart::class, inversedBy: 'items')]
    #[ORM\JoinColumn(name: 'cart_id', nullable: false, onDelete: 'CASCADE')]
    private Cart $cart;

    #[ORM\ManyToOne(targetEntity: Product::class)]
    #[ORM\JoinColumn(name: 'product_id', nullable: false)]
    private Product $product;

    #[ORM\Column(type: 'integer')]
    private int $quantity = 1;

    public function getId(): ?int { return $this->id; }
    public function getCart(): Cart { return $this->cart; }
    public function setCart(Cart $cart): static { $this->cart = $cart; return $this; }
    public function getProduct(): Product { return $this->product; }
    public function setProduct(Product $product): static { $this->product = $product; return $this; }
    public function getQuantity(): int { return $this->quantity; }
    public function setQuantity(int $quantity): static { $this->quantity = $quantity; return $this; }
}
