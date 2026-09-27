# Buyora Frontend Architecture

## Design Principles

1. **Server-first**: Use Server Components for SEO-sensitive and data-heavy pages
2. **Client when needed**: Client Components only when interactivity requires it
3. **Separation of concerns**: Shared transport in the API client, domain services for reusable calls
4. **Backend is source of truth**: Never calculate prices, totals, or payment status client-side
5. **Graceful degradation**: Use loading, error, and empty states; acceptance coverage is recorded in the test matrix

## Routing Architecture

```
app/
  (auth)/          # Auth route group (no store header/footer)
  (store)/         # Main store layout (with header/footer)
    page.tsx         # Homepage
    category/[slug]/ # Category listing
    product/[slug]/  # Product detail
    search/          # Search results
    cart/            # Shopping cart
    wishlist/        # Wishlist
    checkout/        # Multi-step checkout
    payment/         # Payment callbacks
    order-confirmation/[orderNumber]/
    account/         # Customer account (protected)
  admin/           # Admin portal (protected, ADMIN role required)
```

## State Management

| State Type | Tool | Usage |
|-----------|------|-------|
| Server/API state | TanStack Query | Products, cart, orders, reviews |
| Auth state | Zustand (memory only) | Server-validated user |
| Cart UI state | Zustand | Drawer open/close, cart data |
| Wishlist (guest) | Zustand (persist) | Local wishlist IDs |
| Checkout flow | Zustand | Multi-step form state |
| UI state | Zustand | Mobile menu, search open |

## Authentication Model

- Backend uses HTTP-only session cookies
- Frontend calls `GET /auth/me` on app load via `AuthProvider`
- `useAuthStore` holds the current user object
- Client layouts provide login/role navigation; the proxy adds private-route indexing controls
- **Backend ALWAYS enforces auth** — frontend redirects are UX only

## API Layer

```
API call flow:
Component → TanStack Query hook → Service function → api client → Backend
```

- `src/lib/api/client.ts`: Base fetch wrapper with error handling
- `src/lib/api/endpoints.ts`: All API paths as typed constants
- `src/services/*.service.ts`: Domain-specific API functions

## Design Token System

All visual properties use CSS custom properties defined in `globals.css`:
- Colors as HSL values (easy to adjust)
- Dark mode ready (just override variables in `.dark` class)
- Border radius, shadows, z-index scales

## Component Architecture

```
src/components/
  ui/           # Pure UI primitives (no business logic, no API calls)
  layout/       # App-wide layout components
  product/      # Product domain components
  cart/         # Cart domain components
  checkout/     # Checkout domain components
  account/      # Account domain components
  admin/        # Admin domain components
  home/         # Homepage section components
  a11y/         # Accessibility utilities
  seo/          # SEO/structured data components
```

## Performance Strategy

- Server Components for initial HTML (products, categories)
- ISR (`revalidate`) for product/category pages
- Suspense boundaries with skeleton fallbacks
- `next/image` for all images (automatic optimization)
- Dynamic imports for below-fold sections
- Font `display: swap` to prevent FOIT
