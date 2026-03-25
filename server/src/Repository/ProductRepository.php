<?php

namespace App\Repository;

use App\Entity\Product;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ProductRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Product::class);
    }

    /**
     * Paginated product search with filters.
     *
     * @return array{items: Product[], total: int}
     */
    public function findFiltered(
        int $page,
        int $limit,
        ?string $category = null,
        ?float $minPrice = null,
        ?float $maxPrice = null,
        ?string $search = null,
        ?string $sortBy = 'newest',
        ?bool $available = null
    ): array {
        $qb = $this->createQueryBuilder('p')
            ->leftJoin('p.category', 'c')
            ->addSelect('c');

        if ($category) {
            $qb->andWhere('c.slug = :cat')->setParameter('cat', $category);
        }
        if ($minPrice !== null) {
            $qb->andWhere('p.price >= :minPrice')->setParameter('minPrice', $minPrice);
        }
        if ($maxPrice !== null) {
            $qb->andWhere('p.price <= :maxPrice')->setParameter('maxPrice', $maxPrice);
        }
        if ($search) {
            $qb->andWhere('p.name ILIKE :search')->setParameter('search', "%$search%");
        }
        if ($available) {
            $qb->andWhere('p.stock > 0');
        }

        $sortMap = [
            'price_asc'  => ['p.price', 'ASC'],
            'price_desc' => ['p.price', 'DESC'],
            'name_asc'   => ['p.name', 'ASC'],
            'name_desc'  => ['p.name', 'DESC'],
            'newest'     => ['p.createdAt', 'DESC'],
        ];
        [$sortField, $sortDir] = $sortMap[$sortBy ?? 'newest'] ?? ['p.createdAt', 'DESC'];
        $qb->orderBy($sortField, $sortDir);

        $countQb = clone $qb;
        $total = (int) $countQb->select('COUNT(p.id)')->getQuery()->getSingleScalarResult();

        $items = $qb
            ->select('p', 'c')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();

        return ['items' => $items, 'total' => $total];
    }
}
