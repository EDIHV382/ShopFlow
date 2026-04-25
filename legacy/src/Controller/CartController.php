<?php

namespace App\Controller;

use App\Entity\Cart;
use App\Entity\CartItem;
use App\Entity\User;
use App\Repository\CartRepository;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/cart')]
class CartController extends AbstractController
{
    public function __construct(
        private CartRepository $carts,
        private ProductRepository $products,
        private EntityManagerInterface $em,
    ) {}

    private function getOrCreateCart(): Cart
    {
        /** @var User $user */
        $user = $this->getUser();
        $cart = $this->carts->findOneBy(['user' => $user]);
        if (!$cart) {
            $cart = (new Cart())->setUser($user);
            $this->em->persist($cart);
            $this->em->flush();
        }
        return $cart;
    }

    #[Route('', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $cart = $this->getOrCreateCart();
        return $this->json($this->serialize($cart));
    }

    #[Route('', methods: ['DELETE'])]
    public function clear(): JsonResponse
    {
        $cart = $this->getOrCreateCart();
        foreach ($cart->getItems() as $item) {
            $this->em->remove($item);
        }
        $cart->touch();
        $this->em->flush();
        return $this->json($this->serialize($cart));
    }

    #[Route('/items', methods: ['POST'])]
    public function addItem(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $product = $this->products->find($data['product_id'] ?? 0);
        if (!$product) return $this->json(['error' => 'Producto no encontrado'], 404);

        $quantity = max(1, (int) ($data['quantity'] ?? 1));
        if ($product->getStock() < $quantity) {
            return $this->json(['error' => 'Stock insuficiente'], 400);
        }

        $cart = $this->getOrCreateCart();

        // Check if already in cart
        $existing = null;
        foreach ($cart->getItems() as $ci) {
            if ($ci->getProduct()->getId() === $product->getId()) {
                $existing = $ci;
                break;
            }
        }

        if ($existing) {
            $newQty = min($existing->getQuantity() + $quantity, $product->getStock());
            $existing->setQuantity($newQty);
        } else {
            $item = (new CartItem())->setCart($cart)->setProduct($product)->setQuantity($quantity);
            $this->em->persist($item);
        }

        $cart->touch();
        $this->em->flush();
        return $this->json($this->serialize($cart));
    }

    #[Route('/items/{id}', methods: ['PUT'])]
    public function updateItem(int $id, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $quantity = (int) ($data['quantity'] ?? 1);

        $cart = $this->getOrCreateCart();
        foreach ($cart->getItems() as $ci) {
            if ($ci->getId() === $id) {
                if ($quantity <= 0) {
                    $this->em->remove($ci);
                } else {
                    $ci->setQuantity(min($quantity, $ci->getProduct()->getStock()));
                }
                $cart->touch();
                $this->em->flush();
                return $this->json($this->serialize($cart));
            }
        }

        return $this->json(['error' => 'Item no encontrado'], 404);
    }

    #[Route('/items/{id}', methods: ['DELETE'])]
    public function removeItem(int $id): JsonResponse
    {
        $cart = $this->getOrCreateCart();
        foreach ($cart->getItems() as $ci) {
            if ($ci->getId() === $id) {
                $this->em->remove($ci);
                $cart->touch();
                $this->em->flush();
                return $this->json($this->serialize($cart));
            }
        }
        return $this->json(['error' => 'Item no encontrado'], 404);
    }

    private function serialize(Cart $cart): array
    {
        return [
            'id'         => $cart->getId(),
            'user_id'    => $cart->getUser()->getId(),
            'updated_at' => $cart->getUpdatedAt()->format('c'),
            'items'      => array_values(array_map(function (CartItem $ci) {
                $p = $ci->getProduct();
                return [
                    'id'             => $ci->getId(),
                    'cart_id'        => $ci->getCart()->getId(),
                    'product_id'     => $p->getId(),
                    'product_name'   => $p->getName(),
                    'product_price'  => $p->getPrice(),
                    'product_images' => $p->getImages(),
                    'product_stock'  => $p->getStock(),
                    'quantity'       => $ci->getQuantity(),
                ];
            }, $cart->getItems()->toArray())),
        ];
    }
}
