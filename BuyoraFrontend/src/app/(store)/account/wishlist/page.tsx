import { redirect } from 'next/navigation';

export default function WishlistRedirectPage() {
  // Wishlist is a global feature usually in the navbar, but we provide it in account sidebar.
  // Instead of duplicating the UI, we'll redirect to the main wishlist page.
  redirect('/wishlist');
}
