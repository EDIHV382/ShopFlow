import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock mínimo de req y res para tests unitarios
function makeReq(overrides: Partial<VercelRequest> = {}): VercelRequest {
  return {
    method: 'GET',
    headers: {},
    socket: { remoteAddress: '127.0.0.1' },
    ...overrides,
  } as unknown as VercelRequest;
}

function makeRes(): { res: VercelResponse; headers: Record<string, string>; statusCode: number; body: unknown } {
  const headers: Record<string, string> = {};
  let statusCode = 200;
  let body: unknown = null;

  const res = {
    setHeader: (key: string, value: string) => {
      headers[key] = value;
    },
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (data: unknown) => {
      body = data;
      return res;
    },
    end: () => res,
  } as unknown as VercelResponse;

  return { res, headers, statusCode, body };
}

describe('applySecurityHeaders', () => {
  it('agrega X-Content-Type-Options: nosniff', async () => {
    const { applySecurityHeaders } = await import('./security.js');
    const { res, headers } = makeRes();
    applySecurityHeaders(res);
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
  });

  it('agrega X-Frame-Options: DENY', async () => {
    const { applySecurityHeaders } = await import('./security.js');
    const { res, headers } = makeRes();
    applySecurityHeaders(res);
    expect(headers['X-Frame-Options']).toBe('DENY');
  });
});

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('no bloquea dentro del límite', async () => {
    const { checkRateLimit } = await import('./security.js');
    const req = makeReq({ headers: { 'x-forwarded-for': '10.0.0.1' } });
    const { res } = makeRes();
    const blocked = checkRateLimit(req, res, 5, 60_000);
    expect(blocked).toBe(false);
  });
});
