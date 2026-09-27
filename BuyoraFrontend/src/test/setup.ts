import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useParams: () => ({}),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: () => null,
}));

// Mock environment variables
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080/api/v1';
process.env.NEXT_PUBLIC_SITE_NAME = 'Buyora';
process.env.NEXT_PUBLIC_DEFAULT_CURRENCY = 'LKR';
