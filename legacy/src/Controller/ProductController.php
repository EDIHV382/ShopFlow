<?php

namespace App\Controller;

use App\Entity\Product;
use App\Repository\CategoryRepository;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/products')]
class ProductController extends AbstractController
{
    public function __construct(
        private ProductRepository $repo,
        private CategoryRepository $categories,
        private EntityManagerInterface $em,
    ) {}

    #[Route('', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $page     = max(1, (int) $request->query->get('page', 1));
        $limit    = min(100, max(1, (int) $request->query->get('limit', 12)));
        $result   = $this->repo->findFiltered(
            page:      $page,
            limit:     $limit,
            category:  $request->query->get('category'),
            minPrice:  $request->query->get('minPrice') !== null ? (float) $request->query->get('minPrice') : null,
            maxPrice:  $request->query->get('maxPrice') !== null ? (float) $request->query->get('maxPrice') : null,
            search:    $request->query->get('search'),
            sortBy:    $request->query->get('sortBy', 'newest'),
            available: $request->query->get('available') === 'true' ? true : null,
        );

        return $this->json([
            'data' => array_map(fn(Product $p) => $this->serialize($p), $result['items']),
            'meta' => [
                'total'      => $result['total'],
                'page'       => $page,
                'limit'      => $limit,
                'totalPages' => (int) ceil($result['total'] / $limit),
            ],
        ]);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $p = $this->repo->find($id);
        return $p ? $this->json($this->serialize($p)) : $this->json(['error' => 'Producto no encontrado'], 404);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        if (empty($data['name']) || !isset($data['price'], $data['stock'])) {
            return $this->json(['error' => 'name, price y stock son requeridos'], 400);
        }

        $p = new Product();
        $p->setName($data['name'])
          ->setDescription($data['description'] ?? null)
          ->setPrice((float) $data['price'])
          ->setStock((int) $data['stock'])
          ->setImages($data['images'] ?? []);

        if (!empty($data['category_id'])) {
            $cat = $this->categories->find($data['category_id']);
            if ($cat) $p->setCategory($cat);
        }

        $this->em->persist($p);
        $this->em->flush();
        return $this->json($this->serialize($p), 201);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $p = $this->repo->find($id);
        if (!$p) return $this->json(['error' => 'Producto no encontrado'], 404);

        $data = json_decode($request->getContent(), true) ?? [];
        if (isset($data['name']))        $p->setName($data['name']);
        if (isset($data['description'])) $p->setDescription($data['description']);
        if (isset($data['price']))       $p->setPrice((float) $data['price']);
        if (isset($data['stock']))       $p->setStock((int) $data['stock']);
        if (isset($data['images']))      $p->setImages($data['images']);

        if (array_key_exists('category_id', $data)) {
            $p->setCategory($data['category_id'] ? $this->categories->find($data['category_id']) : null);
        }

        $this->em->flush();
        return $this->json($this->serialize($p));
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $p = $this->repo->find($id);
        if (!$p) return $this->json(['error' => 'Producto no encontrado'], 404);

        $this->em->remove($p);
        $this->em->flush();
        return new JsonResponse(null, 204);
    }

    private function serialize(Product $p): array
    {
        return [
            'id'            => $p->getId(),
            'name'          => $p->getName(),
            'description'   => $p->getDescription(),
            'price'         => $p->getPrice(),
            'stock'         => $p->getStock(),
            'images'        => $p->getImages(),
            'category_id'   => $p->getCategory()?->getId(),
            'category_name' => $p->getCategory()?->getName(),
            'category_slug' => $p->getCategory()?->getSlug(),
            'created_at'    => $p->getCreatedAt()->format('c'),
        ];
    }
}
