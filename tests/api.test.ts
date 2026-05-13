import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

const { mockedQuery, mockedQueryOne, mockDbPath } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('path');
  return {
    mockedQuery: vi.fn(),
    mockedQueryOne: vi.fn(),
    mockDbPath: path.resolve(__dirname, '../api/_lib/db'),
  };
});

vi.mock(mockDbPath, () => ({
  query: mockedQuery,
  queryOne: mockedQueryOne,
  getPool: vi.fn(),
}));

vi.mock('../../api/_lib/stripe', () => ({
  stripe: {},
  STRIPE_WEBHOOK_SECRET: 'whsec_test',
}));

vi.mock('pino-http', () => ({
  default: () => (req: any, res: any, next: any) => next(),
}));

vi.mock('express-rate-limit', () => ({
  default: () => (req: any, res: any, next: any) => next(),
}));

describe('API Auth Endpoints', () => {
  let app: any;
  let signToken: typeof import('../../api/_lib/auth').signToken;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  async function loadApp() {
    const auth = await import('../../api/_lib/auth');
    signToken = auth.signToken;
    const mod = await import('../../api/index');
    app = mod.default;
  }

  describe('POST /api/auth/login', () => {
    it('returns 400 for invalid input', async () => {
      await loadApp();
      const res = await request(app).post('/api/auth/login').send({ email: 'invalid-email', password: '' });
      expect(res.status).toBe(400);
    });

    it('returns 401 for wrong credentials', async () => {
      mockedQueryOne.mockResolvedValueOnce(null);
      await loadApp();

      const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Credenciales incorrectas');
    });
  });

  describe('GET /api/products', () => {
    it('returns paginated products', async () => {
      mockedQueryOne.mockResolvedValueOnce({ count: '2' });
      mockedQuery.mockResolvedValueOnce([
        { id: 1, name: 'Product 1', price: 100 },
        { id: 2, name: 'Product 2', price: 200 },
      ]);
      await loadApp();

      const res = await request(app).get('/api/products?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta.total).toBe(2);
    });
  });

  describe('Protected Routes (Cart)', () => {
    it('returns 401 without token', async () => {
      await loadApp();
      const res = await request(app).get('/api/cart');
      expect(res.status).toBe(401);
    });

    it('returns cart items with valid token', async () => {
      mockedQueryOne.mockResolvedValueOnce({ id: 1, user_id: 1 });
      mockedQuery.mockResolvedValueOnce([{ id: 1, product_id: 1, quantity: 2, product_name: 'Test Product' }]);
      await loadApp();

      const token = signToken({
        userId: 1,
        email: 'test@test.com',
        roles: ['ROLE_USER'],
      });

      const res = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
    });
  });
});
