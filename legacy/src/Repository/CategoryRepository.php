<?php

namespace App\Repository;

use App\Entity\Category;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class CategoryRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Category::class);
    }

    /** @return array{id: int, name: string, slug: string, product_count: int}[] */
    public function findAllWithCount(): array
    {
        return $this->createQueryBuilder('c')
            ->select('c.id, c.name, c.slug, COUNT(p.id) as product_count')
            ->leftJoin('c.products', 'p')
            ->groupBy('c.id')
            ->orderBy('c.name', 'ASC')
            ->getQuery()
            ->getArrayResult();
    }
}
