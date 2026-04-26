// POST /api/auth/register
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyMiddleware, handleOptions } from '../_lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) {
    return;
  }
  applyMiddleware(req, res, true);
  return res.status(403).json({
    error:
      '🔒 Modo de Prueba: La creación de cuentas está deshabilitada. Usa las cuentas de prueba (cliente@shopflow.com o admin@shopflow.com).',
  });
}
