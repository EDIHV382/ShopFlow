# ShopFlow — TODO / Missing Features

## ✅ Completed

- [x] Database schema initialized (Neon PostgreSQL)
- [x] Test data seeded (10 categories, 47 products, 2 users)
- [x] Authentication system (JWT, bcrypt)
- [x] API routes (auth, products, categories, cart, orders, admin, stripe)
- [x] Nuxt 3 frontend with Pinia stores
- [x] Stripe payment integration
- [x] Dark mode UI with TailwindCSS
- [x] TypeScript strict mode enabled

## ⚠️ Missing / To Improve

### Testing

- [ ] **No test framework configured** — Add Vitest for client, Jest/Vitest for API
- [ ] No integration tests for API endpoints
- [ ] No E2E tests (could add Playwright/Cypress)

### Security

- [ ] **Rate limiting** — Add rate limiting to API routes (e.g., `express-rate-limit`)
- [ ] **Input validation** — Add Zod schemas to all API endpoints
- [ ] **CORS configuration** — Configure allowed origins explicitly
- [ ] **Helmet headers** — Add security HTTP headers
- [ ] **SQL injection protection** — Already using parameterized queries ✅
- [ ] **XSS protection** — Nuxt handles this, but verify all user inputs are sanitized

### DevOps / CI/CD

- [ ] **GitHub Actions** — Add CI workflow for linting, typecheck, tests
- [ ] **Automated deployments** — Vercel auto-deploys, but add preview deployments
- [ ] **Database migrations** — Use a migration tool (e.g., `db-migrate`, `knex`)
- [ ] **Backup strategy** — Set up Neon database backups
- [ ] **Monitoring** — Add error tracking (Sentry, LogRocket)

### Code Quality

- [ ] **ESLint** — Not configured in client or API
- [ ] **Prettier** — No auto-formatting configured
- [ ] **Commit hooks** — Add Husky for pre-commit linting
- [ ] **Code coverage** — No coverage reports

### API Improvements

- [ ] **OpenAPI/Swagger docs** — Generate API documentation
- [ ] **Request logging** — Add structured logging (e.g., `pino`)
- [ ] **Error tracking** — Centralized error handling
- [ ] **Pagination helpers** — Reusable pagination utility
- [ ] **Caching** — Add Redis caching for expensive queries

### Frontend Improvements

- [ ] **Image optimization** — Use Nuxt Image module
- [ ] **SEO meta tags** — Dynamic meta tags per product/page
- [ ] **Sitemap.xml** — Generate for SEO
- [ ] **Robots.txt** — Configure crawl rules
- [ ] **Analytics** — Add Google Analytics / Plausible
- [ ] **Performance monitoring** — Web Vitals tracking

### Stripe / Payments

- [ ] **Webhook signature verification** — Verify Stripe webhook signatures
- [ ] **Refund support** — Admin can process refunds
- [ ] **Subscription support** — Recurring payments
- [ ] **Invoice generation** — PDF invoices for orders

### Admin Features

- [ ] **Bulk product import** — CSV upload for products
- [ ] **Inventory management** — Low stock alerts
- [ ] **Sales analytics** — Charts/dashboard improvements
- [ ] **User management** — CRUD for users
- [ ] **Content management** — Banner/slider management

### Performance

- [ ] **CDN for assets** — Serve images via CDN
- [ ] **Database connection pooling** — Already configured ✅
- [ ] **Lazy loading** — Images and components
- [ ] **Code splitting** — Nuxt handles this ✅
- [ ] **API response compression** — Gzip responses

### Documentation

- [ ] **API documentation** — OpenAPI spec
- [ ] **Architecture diagram** — System overview
- [ ] **Deployment guide** — Step-by-step production deploy
- [ ] **Changelog** — Keep a CHANGELOG.md

### Environment Variables

- [ ] **Use real Stripe keys** — Currently using placeholders
- [ ] **Production JWT_SECRET** — Change from dev value
- [ ] **Add .env.example** — Document all required env vars

## Quick Status Commands

```bash
# Check database connection
cd api && node _lib/init-db.js

# Re-seed database
npm run db:seed

# Run typecheck
cd client && npm run typecheck

# Start dev server
vercel dev

# Build for production
npm run build

# Deploy to Vercel
npm run deploy
```

## Priority Recommendations

### High Priority

1. **Add input validation** (Zod schemas on all API routes)
2. **Configure rate limiting** (protect API from abuse)
3. **Add real Stripe keys** (test payments end-to-end)
4. **Set up ESLint + Prettier** (code quality)

### Medium Priority

5. **Add test framework** (Vitest for client, API tests)
6. **GitHub Actions CI** (automate linting/typecheck)
7. **Error tracking** (Sentry integration)

### Low Priority

8. **OpenAPI docs** (developer experience)
9. **Analytics** (user behavior tracking)
10. **Performance monitoring** (Core Web Vitals)
