<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\User;
use App\Repository\CartRepository;
use App\Repository\OrderRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/orders')]
class OrderController extends AbstractController
{
    public function __construct(
        private OrderRepository $orders,
        private CartRepository $carts,
        private EntityManagerInterface $em,
    ) {}

    #[Route('', methods: ['GET'])]
    public function index(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $orders = $this->orders->findBy(['user' => $user], ['createdAt' => 'DESC']);
        return $this->json(array_map(fn(Order $o) => $this->serialize($o, true), $orders));
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $order = $this->orders->find($id);
        if (!$order || $order->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Pedido no encontrado'], 404);
        }
        return $this->json($this->serialize($order, true));
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true) ?? [];

        if (empty($data['shippingAddress']) || empty($data['stripePaymentId'])) {
            return $this->json(['error' => 'shippingAddress y stripePaymentId son requeridos'], 400);
        }

        $cart = $this->carts->findOneBy(['user' => $user]);
        if (!$cart || $cart->getItems()->isEmpty()) {
            return $this->json(['error' => 'Carrito vacío'], 400);
        }

        $total = 0.0;
        foreach ($cart->getItems() as $ci) {
            if ($ci->getProduct()->getStock() < $ci->getQuantity()) {
                return $this->json(['error' => sprintf('Stock insuficiente para "%s"', $ci->getProduct()->getName())], 400);
            }
            $total += $ci->getProduct()->getPrice() * $ci->getQuantity();
        }

        $order = (new Order())
            ->setUser($user)
            ->setStatus('pending')
            ->setTotal($total)
            ->setShippingAddress($data['shippingAddress'])
            ->setStripePaymentId($data['stripePaymentId']);

        $this->em->persist($order);

        foreach ($cart->getItems() as $ci) {
            $p = $ci->getProduct();
            $oi = (new OrderItem())
                ->setOrder($order)
                ->setProduct($p)
                ->setProductName($p->getName())
                ->setProductImages($p->getImages())
                ->setQuantity($ci->getQuantity())
                ->setUnitPrice($p->getPrice());
            $this->em->persist($oi);

            $p->setStock($p->getStock() - $ci->getQuantity());
            $this->em->remove($ci);
        }

        $cart->touch();
        $this->em->flush();

        return $this->json($this->serialize($order), 201);
    }

    private function serialize(Order $o, bool $withItems = false): array
    {
        $data = [
            'id'                => $o->getId(),
            'user_id'           => $o->getUser()->getId(),
            'status'            => $o->getStatus(),
            'total'             => $o->getTotal(),
            'shipping_address'  => $o->getShippingAddress(),
            'stripe_payment_id' => $o->getStripePaymentId(),
            'created_at'        => $o->getCreatedAt()->format('c'),
        ];

        if ($withItems) {
            $data['items'] = array_values(array_map(fn(OrderItem $oi) => [
                'id'             => $oi->getId(),
                'product_id'     => $oi->getProduct()?->getId(),
                'product_name'   => $oi->getProductName(),
                'product_images' => $oi->getProductImages(),
                'quantity'       => $oi->getQuantity(),
                'unit_price'     => $oi->getUnitPrice(),
            ], $o->getItems()->toArray()));
        }

        return $data;
    }
}
