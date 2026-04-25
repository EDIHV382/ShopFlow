import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../api/index';
import { query, queryOne } from '../../api/_lib/db';
import { signToken } from '../../api/_lib/auth';

// Mock DB
vi.mock('../../api/_lib/db', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
}));

describe('API Auth Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('returns 400 for invalid input', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid-email', password: '' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid email');
    });

    it('returns 401 for wrong credentials', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce(null); // User not found

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Credenciales inválidas');
    });
  });

  describe('GET /api/products', () => {
    it('returns paginated products', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({ count: '2' });
      vi.mocked(query).mockResolvedValueOnce([
        { id: 1, name: 'Product 1', price: 100 },
        { id: 2, name: 'Product 2', price: 200 },
      ]);

      const res = await request(app).get('/api/products?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta.total).toBe(2);
      expect(res.body.meta.page).toBe(1);
    });
  });

  describe('Protected Routes (Cart)', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.status).toBe(401);
    });

    it('returns cart items with valid token', async () => {
      const token = signToken({
        id: 1,
        email: 'test@test.com',
        name: 'Test',
        roles: ['ROLE_USER'],
      });

      vi.mocked(query).mockResolvedValueOnce([
        { id: 1, product_id: 1, quantity: 2, product_name: 'Test Product' },
      ]);

      const res = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
    });
  });
});
