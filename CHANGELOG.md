# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-25

### Added

- **CI/CD**: GitHub Actions workflow for automated linting, type-checking, and testing (`ci.yml`).
- **Security**: Helmet, CORS, and Express Rate Limit applied to all API routes.
- **Validation**: Zod schema validation middleware implemented for all protected and data-modifying API endpoints.
- **Testing**:
  - Vitest setup for unit and integration tests (Vue Pinia stores, Express endpoints).
  - Playwright E2E tests for main user flows (browsing, auth, checkout).
- **SEO & Performance**: Integrated `@nuxt/image` and `@nuxtjs/sitemap`, including `robots.txt` and `useSeoMeta`.
- **Logging**: Added `pino` and `pino-http` for structured API logging.
- **Pagination**: Dedicated pagination utility applied to the `/api/products` endpoint.

### Changed

- **Architecture Refactor**: Re-structured Vercel serverless functions by wrapping them in an Express app (`api/index.ts`) for centralized middleware management.
- **Code Organization**: Moved legacy `server-logic` TypeScript code into the `api` folder and migrated configuration scripts (`init-db.js`, `seed.js`) to TypeScript.
- **Code Quality**: Applied rigorous ESLint and Prettier formatting across the entire monorepo, resolving all previous lint warnings and errors.
- **Pre-commit Hooks**: Integrated Husky and `lint-staged` to enforce code quality before commits.

### Removed

- Removed the compiled `dist/` directory from source control.
- Removed legacy PHP/Symfony directories from primary workflow (moved to `legacy/`).
- Removed outdated and unused scripts (e.g., `fix-imports.ts`).

### Security

- Hardened Stripe webhook endpoint with proper signature verification via raw body parsing.
- Added stricter rate limiting specifically targeting authentication routes (`/api/auth/login`, `/api/auth/register`).
