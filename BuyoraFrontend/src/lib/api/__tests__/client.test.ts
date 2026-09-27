import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, BuyoraApiError } from '../client';
afterEach(() => vi.unstubAllGlobals());
const csrf = () =>
  new Response(JSON.stringify({ token: 'csrf-value', headerName: 'X-XSRF-TOKEN' }), {
    status: 200,
  });
describe('API boundary', () => {
  it('rejects external paths before sending credentials', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await expect(api.get('//attacker.example/data')).rejects.toThrow('Invalid API path');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('attaches CSRF protection and supports empty success responses', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(csrf())
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetch);
    expect(await api.post('/auth/logout')).toBeNull();
    const options = fetch.mock.calls[1][1];
    expect(options.headers.get('X-XSRF-TOKEN')).toBe('csrf-value');
    expect(options.credentials).toBe('include');
  });
  it('preserves multipart bodies without forcing JSON headers', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(csrf()).mockResolvedValueOnce(new Response('{}'));
    vi.stubGlobal('fetch', fetch);
    const form = new FormData();
    form.append('file', new Blob(['image']), 'photo.png');
    await api.post('/admin/uploads/image', form);
    expect(fetch.mock.calls[1][1].body).toBe(form);
    expect(fetch.mock.calls[1][1].headers.has('Content-Type')).toBe(false);
  });
  it('does not expose server diagnostics or turn failures into success', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ message: 'database secret', status: 200 }), { status: 500 })
        )
    );
    const error = await api.get('/orders').catch((error) => error);
    expect(error).toBeInstanceOf(BuyoraApiError);
    expect(error.status).toBe(500);
    expect(error.message).not.toContain('database secret');
  });
  it('does not send a mutation when obtaining CSRF protection fails', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 503 }));
    vi.stubGlobal('fetch', fetch);
    await expect(api.post('/checkout/place-order', {})).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
