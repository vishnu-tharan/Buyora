import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductDetailsEditor } from '@/components/admin/ProductDetailsEditor';
import { api } from '@/lib/api-client';

vi.mock('@/lib/api-client', async (importOriginal) => ({
  ...(await importOriginal()),
  api: { put: vi.fn() },
}));
vi.mock('@/services/admin.service', () => ({ adminService: { uploadImage: vi.fn() } }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function showEditor() {
  const product = {
    id: 1,
    name: 'Notebook',
    variants: [{ id: 10, sku: 'NOTEBOOK', price: 200, isActive: true, attributes: {} }],
    images: [],
    specifications: {},
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
  };
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  api.put.mockResolvedValue(product);
  render(
    <QueryClientProvider client={queryClient}>
      <ProductDetailsEditor product={product} />
    </QueryClientProvider>
  );
}

describe('Product details editing', () => {
  it('saves readable specifications and the edited SKU', async () => {
    showEditor();
    fireEvent.change(screen.getByLabelText('Variant 1 SKU'), { target: { value: 'NOTEBOOK-A5' } });
    fireEvent.change(screen.getByLabelText('Specifications (one Name=Value per line)'), {
      target: { value: 'Size=A5\n Pages = 100 ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save product details' }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        '/admin/products/1/details',
        expect.objectContaining({
          specifications: { Size: 'A5', Pages: '100' },
          variants: [expect.objectContaining({ sku: 'NOTEBOOK-A5', price: 200 })],
        })
      )
    );
  });

  it('rejects invalid specification lines before sending a request', async () => {
    showEditor();
    fireEvent.change(screen.getByLabelText('Specifications (one Name=Value per line)'), {
      target: { value: 'Size without a value' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save product details' }));

    await screen.findByText('Unable to complete the request. Please try again.');
    expect(api.put).not.toHaveBeenCalled();
  });
});
