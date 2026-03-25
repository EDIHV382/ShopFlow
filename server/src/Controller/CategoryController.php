<?php

namespace App\Controller;

use App\Entity\Category;
use App\Repository\CategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/categories')]
class CategoryController extends AbstractController
{
    public function __construct(
        private CategoryRepository $repo,
        private EntityManagerInterface $em,
    ) {}

    #[Route('', methods: ['GET'])]
    public function index(): JsonResponse
    {
        return $this->json($this->repo->findAllWithCount());
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        if (empty($data['name']) || empty($data['slug'])) {
            return $this->json(['error' => 'Nombre y slug son requeridos'], 400);
        }
        if (!preg_match('/^[a-z0-9-]+$/', $data['slug'])) {
            return $this->json(['error' => 'Slug solo puede contener letras minúsculas, números y guiones'], 400);
        }

        $cat = (new Category())->setName($data['name'])->setSlug($data['slug']);
        $this->em->persist($cat);
        $this->em->flush();

        return $this->json(['id' => $cat->getId(), 'name' => $cat->getName(), 'slug' => $cat->getSlug(), 'product_count' => 0], 201);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $cat = $this->repo->find($id);
        if (!$cat) return $this->json(['error' => 'Categoría no encontrada'], 404);

        $data = json_decode($request->getContent(), true) ?? [];
        if (!empty($data['name'])) $cat->setName($data['name']);
        if (!empty($data['slug'])) {
            if (!preg_match('/^[a-z0-9-]+$/', $data['slug'])) {
                return $this->json(['error' => 'Slug inválido'], 400);
            }
            $cat->setSlug($data['slug']);
        }
        $this->em->flush();

        return $this->json(['id' => $cat->getId(), 'name' => $cat->getName(), 'slug' => $cat->getSlug()]);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $cat = $this->repo->find($id);
        if (!$cat) return $this->json(['error' => 'Categoría no encontrada'], 404);

        $this->em->remove($cat);
        $this->em->flush();
        return new JsonResponse(null, 204);
    }
}
