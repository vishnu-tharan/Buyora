import { CartDrawer } from '@/components/cart/CartDrawer';
import { FloatingCartButton } from '@/components/cart/FloatingCartButton';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { MobileMenu } from '@/components/layout/MobileMenu';

export default function StoreLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header />
      {process.env.STOREFRONT_DEMO_CATALOG === 'true' && (
        <div
          role="note"
          className="bg-muted text-muted-foreground border-b px-4 py-2 text-center text-[11px]"
        >
          Sample collection · Prices and availability are examples in Sri Lankan rupees.
        </div>
      )}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <MobileMenu />
      <FloatingCartButton />
    </div>
  );
}
