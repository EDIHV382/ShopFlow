import { describe, it, expect } from 'vitest';
import { validate, RegisterSchema, LoginSchema, ProductQuerySchema } from './schemas.js';

describe('validate() helper', () => {
  it('retorna success:true con datos válidos', () => {
    const result = validate(LoginSchema, { email: 'test@example.com', password: 'password123' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('test@example.com');
    }
  });

  it('retorna success:false con email inválido', () => {
    const result = validate(LoginSchema, { email: 'no-es-email', password: '123' });
    expect(result.success).toBe(false);
  });

  it('retorna success:false con objeto vacío', () => {
    const result = validate(RegisterSchema, {});
    expect(result.success).toBe(false);
  });
});

describe('RegisterSchema', () => {
  it('valida un registro correcto', () => {
    const result = validate(RegisterSchema, {
      name: 'Eduardo',
      email: 'eduardo@example.com',
      password: 'Password123',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza contraseña sin mayúsculas', () => {
    const result = validate(RegisterSchema, {
      name: 'Eduardo',
      email: 'eduardo@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('uppercase');
    }
  });

  it('rechaza contraseña corta', () => {
    const result = validate(RegisterSchema, {
      name: 'Eduardo',
      email: 'eduardo@example.com',
      password: 'Ab1',
    });
    expect(result.success).toBe(false);
  });
});

describe('ProductQuerySchema', () => {
  it('aplica valores por defecto correctamente', () => {
    const result = validate(ProductQuerySchema, {});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(12);
      expect(result.data.sort).toBe('newest');
    }
  });

  it('coerce strings a números', () => {
    const result = validate(ProductQuerySchema, { page: '2', limit: '24' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(24);
    }
  });

  it('rechaza sort inválido', () => {
    const result = validate(ProductQuerySchema, { sort: 'invalid_sort' });
    expect(result.success).toBe(false);
  });

  it('rechaza limit mayor a 100', () => {
    const result = validate(ProductQuerySchema, { limit: '200' });
    expect(result.success).toBe(false);
  });
});
