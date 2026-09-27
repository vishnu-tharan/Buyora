# UI Components Reference

## Design System

Buyora uses CSS custom properties for all design tokens.
See `src/app/globals.css` for the complete token set.

## Base Components (from shadcn/ui)

Button, Input, Label, Badge, Card, Dialog, Drawer, Sheet, Select,
Separator, Skeleton, Tabs, Toast, Avatar, DropdownMenu, Checkbox,
RadioGroup, Slider, Switch, Tooltip, Popover, Command, Accordion,
Progress, AlertDialog

## Custom UI Components

| Component | Location | Props |
|-----------|----------|-------|
| `StarRating` | `ui/StarRating.tsx` | `rating`, `max?`, `size?` |
| `PriceDisplay` | `ui/PriceDisplay.tsx` | `price`, `compareAtPrice?` |
| `EmptyState` | `ui/EmptyState.tsx` | `title`, `description?`, `action?`, `icon?` |
| `ErrorState` | `ui/ErrorState.tsx` | `title?`, `message?`, `onRetry?` |
| `LoadingSpinner` | `ui/LoadingSpinner.tsx` | `size?`, `className?` |
| `SectionHeader` | `ui/SectionHeader.tsx` | `title`, `subtitle?`, `linkText?`, `linkHref?` |
| `Breadcrumb` | `ui/Breadcrumb.tsx` | `items: [{label, href?}]` |
| `Pagination` | `ui/Pagination.tsx` | `currentPage`, `totalPages`, `onPageChange` |
| `IconButton` | `ui/IconButton.tsx` | `label` (required), `size?` |
| `SkipNavLink` | `a11y/SkipNavLink.tsx` | none |
| `LiveRegion` | `a11y/LiveRegion.tsx` | `message`, `politeness?` |
| `JsonLd` | `seo/JsonLd.tsx` | `data` |

## Product Components

| Component | Description |
|-----------|-------------|
| `ProductCard` | Grid card for product listings |
| `ProductCardSkeleton` | Loading skeleton for ProductCard |
| `ProductGrid` | Responsive grid of ProductCards |
| `ProductDetail` | Full product detail page client component |
| `ImageGallery` | Product image gallery with zoom |
| `VariantSelector` | Color/size/attribute variant selection |
| `QuantitySelector` | +/- quantity input |
| `ProductTabs` | Description/specs/shipping tabs |
| `ProductReviews` | Reviews section with rating distribution |
| `RelatedProducts` | Related products carousel |
| `RecentlyViewed` | Recently viewed products |

## Form Validation

All forms use Zod schemas from `src/lib/validation/schemas.ts`.
Field errors from the API are automatically mapped to form fields.

## Accessibility Notes

- All interactive elements have visible focus styles
- Icon-only buttons use `IconButton` with required `label` prop
- Modals use `useFocusTrap` hook
- Skip navigation link at top of every page
- ARIA live regions for dynamic announcements
