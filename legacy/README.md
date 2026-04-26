# Legacy Symfony Codebase

## ⚠️ Purpose

This folder contains the **original Symfony 6 PHP application** that ShopFlow was built upon. It is preserved for:

- **Historical reference** — Understanding the original architecture and domain model
- **Migration documentation** — Comparing PHP entities to TypeScript types
- **Learning purposes** — Seeing how the same business logic was implemented in both stacks

## 🚫 Not in Use

**This code is NOT executed in production.** The current ShopFlow stack is:

- **Frontend:** Nuxt 3 (Vue 3 + TypeScript)
- **Backend:** Vercel Serverless Functions (Node.js + TypeScript + Express)
- **Database:** Neon PostgreSQL
- **Payments:** Stripe

## 📁 Structure

```
legacy/
├── src/
│   ├── Controller/      # Symfony controllers (replaced by API routes)
│   ├── Entity/          # Doctrine entities (replaced by DB schema)
│   ├── Repository/      # Doctrine repositories (replaced by SQL queries)
│   └── DataFixtures/    # Sample data (replaced by seed.ts)
├── config/              # Symfony configuration
├── migrations/          # Doctrine migrations
└── composer.json        # PHP dependencies
```

## 🔄 Migration Notes

| Symfony Component | ShopFlow Replacement                |
| ----------------- | ----------------------------------- |
| Controller        | `api/_routes/**/*.ts`               |
| Entity            | `api/_lib/types.ts` + DB schema     |
| Repository        | `api/_lib/db.ts` helpers            |
| Doctrine ORM      | Raw SQL with `pg` driver            |
| Security Bundle   | JWT middleware (`api/_lib/auth.ts`) |
| Stripe Bundle     | `api/_lib/stripe.ts`                |
