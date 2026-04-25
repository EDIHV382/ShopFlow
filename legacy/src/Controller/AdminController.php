<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\User;
use App\Repository\OrderRepository;
use App\Repository\ProductRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin')]
class AdminController extends AbstractController
{
    public function __construct(
        private OrderRepository $orders,
        private ProductRepository $products,
        private UserRepository $users,
        private EntityManagerInterface $em,
    ) {}

    // ────────────────────────────── Dashboard ──────────────────────────────

    #[Route('/dashboard', methods: ['GET'])]
    public function dashboard(): JsonResponse
    {
        $conn = $this->em->getConnection();

        $todaySales = $conn->fetchAssociative(
            "SELECT COALESCE(SUM(total),0)::numeric as total, COUNT(*)::int as count
             FROM orders WHERE created_at >= CURRENT_DATE AND status != 'cancelled'"
        );

        $pendingOrders    = (int) $conn->fetchOne("SELECT COUNT(*) FROM orders WHERE status = 'pending'");
        $processingOrders = (int) $conn->fetchOne("SELECT COUNT(*) FROM orders WHERE status = 'processing'");
        $totalProducts    = (int) $conn->fetchOne("SELECT COUNT(*) FROM products");
        $totalUsers       = (int) $conn->fetchOne("SELECT COUNT(*) FROM users");

        $lowStock = $conn->fetchAllAssociative(
            "SELECT id, name, stock FROM products WHERE stock <= 5 ORDER BY stock ASC LIMIT 10"
        );

        $recentOrders = $conn->fetchAllAssociative(
            "SELECT o.id, o.status, o.total::numeric, o.created_at, u.name as user_name
             FROM orders o LEFT JOIN users u ON o.user_id = u.id
             ORDER BY o.created_at DESC LIMIT 5"
        );

        return $this->json([
            'todaySales'       => ['total' => (float)($todaySales['total'] ?? 0), 'count' => (int)($todaySales['count'] ?? 0)],
            'pendingOrders'    => $pendingOrders,
            'processingOrders' => $processingOrders,
            'totalProducts'    => $totalProducts,
            'totalUsers'       => $totalUsers,
            'lowStockProducts' => $lowStock,
            'recentOrders'     => $recentOrders,
        ]);
    }

    // ────────────────────────────── Sales Chart ──────────────────────────────

    #[Route('/sales-chart', methods: ['GET'])]
    public function salesChart(Request $request): JsonResponse
    {
        $days = min(90, max(1, (int) $request->query->get('days', 30)));
        $conn = $this->em->getConnection();

        $rows = $conn->fetchAllAssociative(
            "SELECT TO_CHAR(created_at::date, 'YYYY-MM-DD') as date,
                    COALESCE(SUM(total),0)::numeric as total,
                    COUNT(*)::int as orders
             FROM orders
             WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * :days AND status != 'cancelled'
             GROUP BY created_at::date ORDER BY created_at::date ASC",
            ['days' => $days - 1]
        );

        $byDate = [];
        foreach ($rows as $r) {
            $byDate[$r['date']] = ['total' => (float) $r['total'], 'orders' => (int) $r['orders']];
        }

        $result = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $d = (new \DateTimeImmutable())->modify("-$i days")->format('Y-m-d');
            $result[] = ['date' => $d, 'total' => $byDate[$d]['total'] ?? 0, 'orders' => $byDate[$d]['orders'] ?? 0];
        }

        return $this->json($result);
    }

    // ────────────────────────────── Orders ──────────────────────────────

    #[Route('/orders', methods: ['GET'])]
    public function orders(Request $request): JsonResponse
    {
        $page   = max(1, (int) $request->query->get('page', 1));
        $limit  = min(50, max(1, (int) $request->query->get('limit', 20)));
        $status = $request->query->get('status');

        $qb = $this->orders->createQueryBuilder('o')
            ->leftJoin('o.user', 'u')->addSelect('u')
            ->orderBy('o.createdAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        if ($status) $qb->andWhere('o.status = :s')->setParameter('s', $status);

        $total = (int) (clone $qb)->select('COUNT(o.id)')->getQuery()->getSingleScalarResult();
        $items = $qb->select('o', 'u')->getQuery()->getResult();

        return $this->json([
            'data' => array_map(fn(Order $o) => $this->serializeOrder($o), $items),
            'meta' => ['total' => $total, 'page' => $page, 'limit' => $limit, 'totalPages' => (int) ceil($total / $limit)],
        ]);
    }

    #[Route('/orders/{id}/status', methods: ['PATCH'])]
    public function updateOrderStatus(int $id, Request $request): JsonResponse
    {
        $order = $this->orders->find($id);
        if (!$order) return $this->json(['error' => 'Pedido no encontrado'], 404);

        $data = json_decode($request->getContent(), true) ?? [];
        $valid = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (empty($data['status']) || !in_array($data['status'], $valid, true)) {
            return $this->json(['error' => 'Estado inválido'], 400);
        }

        $order->setStatus($data['status']);
        $this->em->flush();
        return $this->json($this->serializeOrder($order));
    }

    // ────────────────────────────── Users ──────────────────────────────

    #[Route('/users', methods: ['GET'])]
    public function usersList(Request $request): JsonResponse
    {
        $page   = max(1, (int) $request->query->get('page', 1));
        $limit  = min(50, max(1, (int) $request->query->get('limit', 20)));
        $search = $request->query->get('search');

        $items = $this->users->findPaginated($page, $limit, $search);
        $total = $this->users->countAll($search);

        return $this->json([
            'data' => array_map(fn(User $u) => $this->serializeUser($u), $items),
            'meta' => ['total' => $total, 'page' => $page, 'limit' => $limit, 'totalPages' => (int) ceil($total / $limit)],
        ]);
    }

    #[Route('/users', methods: ['PATCH'])]
    public function updateUser(Request $request): JsonResponse
    {
        /** @var User $admin */
        $admin = $this->getUser();
        $id    = (int) $request->query->get('id');
        if (!$id) return $this->json(['error' => 'ID requerido'], 400);
        if ($id === $admin->getId()) return $this->json(['error' => 'No puedes modificar tu propio rol'], 400);

        $user = $this->users->find($id);
        if (!$user) return $this->json(['error' => 'Usuario no encontrado'], 404);

        $data  = json_decode($request->getContent(), true) ?? [];
        $valid = ['ROLE_USER', 'ROLE_ADMIN'];
        $roles = array_filter($data['roles'] ?? [], fn($r) => in_array($r, $valid, true));
        if (empty($roles)) return $this->json(['error' => 'Roles inválidos'], 400);

        $user->setRoles(array_values($roles));
        $this->em->flush();
        return $this->json($this->serializeUser($user));
    }

    #[Route('/users', methods: ['DELETE'])]
    public function deleteUser(Request $request): JsonResponse
    {
        /** @var User $admin */
        $admin = $this->getUser();
        $id    = (int) $request->query->get('id');
        if (!$id) return $this->json(['error' => 'ID requerido'], 400);
        if ($id === $admin->getId()) return $this->json(['error' => 'No puedes eliminar tu propia cuenta'], 400);

        $user = $this->users->find($id);
        if (!$user) return $this->json(['error' => 'Usuario no encontrado'], 404);

        $this->em->remove($user);
        $this->em->flush();
        return new JsonResponse(null, 204);
    }

    // ────────────────────────────── Serializers ──────────────────────────────

    private function serializeOrder(Order $o): array
    {
        return [
            'id'         => $o->getId(),
            'status'     => $o->getStatus(),
            'total'      => $o->getTotal(),
            'created_at' => $o->getCreatedAt()->format('c'),
            'user_name'  => $o->getUser()?->getName(),
            'user_email' => $o->getUser()?->getEmail(),
        ];
    }

    private function serializeUser(User $u): array
    {
        return [
            'id'         => $u->getId(),
            'name'       => $u->getName(),
            'email'      => $u->getEmail(),
            'roles'      => $u->getRoles(),
            'created_at' => $u->getCreatedAt()->format('c'),
        ];
    }
}
