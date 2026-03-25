// POST /api/auth/register
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from '../_lib/db';
import { hashPassword, validatePassword } from '../_lib/auth';
import { signToken } from '../_lib/auth';
import { setCorsHeaders, handleOptions } from '../_lib/middleware';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  password: z.string().min(8),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);
  return res.status(403).json({ error: "🔒 Modo de Prueba: La creación de cuentas está deshabilitada. Usa las cuentas de prueba (cliente@shopflow.com o admin@shopflow.com)." });
}
