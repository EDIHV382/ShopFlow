// POST /api/auth/logout
// JWT is stateless — logout is handled client-side by deleting the token.
// This endpoint exists for API completeness and future token blacklist support.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyMiddleware, handleOptions } from '../_lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) {
    return;
  }
  applyMiddleware(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Client should delete the JWT from storage
  return res.status(200).json({ message: 'Sesión cerrada correctamente' });
}
