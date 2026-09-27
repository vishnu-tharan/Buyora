import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, addressSchema, reviewSchema } from '../schemas';

describe('loginSchema', () => {
  it('validates valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('email');
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('validates valid registration data', () => {
    const result = registerSchema.safeParse({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'SecurePass1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects weak password (no uppercase)', () => {
    const result = registerSchema.safeParse({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'weakpassword1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without numbers', () => {
    const result = registerSchema.safeParse({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Weakpassword',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short first name', () => {
    const result = registerSchema.safeParse({
      firstName: 'J',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'SecurePass1',
    });
    expect(result.success).toBe(false);
  });
});

describe('addressSchema', () => {
  it('validates complete Sri Lankan address', () => {
    const result = addressSchema.safeParse({
      firstName: 'Nimal',
      lastName: 'Silva',
      phone: '0771234567',
      addressLine1: '123 Main Street',
      city: 'Colombo',
      district: 'Colombo',
      country: 'Sri Lanka',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = addressSchema.safeParse({
      firstName: 'Nimal',
    });
    expect(result.success).toBe(false);
  });
});

describe('reviewSchema', () => {
  it('validates valid review', () => {
    const result = reviewSchema.safeParse({
      rating: 5,
      body: 'This is a great product! Highly recommend it.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects rating out of range', () => {
    const result = reviewSchema.safeParse({
      rating: 6,
      body: 'Great product!',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short review body', () => {
    const result = reviewSchema.safeParse({
      rating: 4,
      body: 'Good',
    });
    expect(result.success).toBe(false);
  });
});
