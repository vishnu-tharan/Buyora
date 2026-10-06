import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowUpRight,
  Headphones,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Truck,
  FileText,
} from 'lucide-react';
import { storeService, unavailableStoreInfo } from '@/services/store.service';
import { DeliveryEstimator } from '@/components/product/DeliveryEstimator';
import { AnalyticsPreferences } from '@/components/analytics/AnalyticsPreferences';
const pages = {
  contact: ['Let’s talk.', 'A little help goes a long way.', Headphones],
  faq: ['Good questions. Clear answers.', 'Everything you need for an easier shop.', HelpCircle],
  shipping: ['On its way to you.', 'Explore delivery options for your district.', Truck],
  returns: ['Let’s make it right.', 'Your guide to returns and refunds.', RotateCcw],
  privacy: ['Your privacy matters.', 'How Buyora uses and protects your information.', ShieldCheck],
  terms: ['Shopping with Buyora.', 'The terms that apply to your orders.', FileText],
} as const;
export async function generateMetadata({ params }: { params: Promise<{ info: string }> }) {
  const { info } = await params;
  return { title: info in pages ? pages[info as keyof typeof pages][0] : 'Page not found' };
}
export default async function InformationPage({ params }: { params: Promise<{ info: string }> }) {
  const { info } = await params;
  if (!(info in pages)) notFound();
  const [title, subtitle, Icon] = pages[info as keyof typeof pages];
  const store = await storeService.info().catch(() => unavailableStoreInfo);
  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8 md:py-12">
      <div className="mb-8 rounded-3xl bg-[#e8eff0] p-7 md:p-12">
        <span className="text-primary mb-5 inline-flex size-14 items-center justify-center rounded-2xl bg-white">
          <Icon size={27} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">{title}</h1>
        <p className="text-muted-foreground mt-4">{subtitle}</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="bg-card space-y-6 rounded-2xl border p-6 leading-7 md:p-8">
          {info === 'contact' && (
            <>
              <h2 className="text-xl font-semibold">How can we help?</h2>
              <p className="text-muted-foreground">
                Have a question about a product, delivery, or an order? Include your order number
                when contacting us. Never send passwords or card details.
              </p>
              {store.supportEmail && (
                <a
                  href={`mailto:${store.supportEmail}`}
                  className="flex items-center gap-3 rounded-xl border p-4"
                >
                  <Mail size={20} aria-hidden="true" />
                  {store.supportEmail}
                </a>
              )}
              {/^\+?\d{7,15}$/.test(store.whatsappNumber) && (
                <a
                  href={`https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border p-4"
                >
                  <MessageCircle size={20} aria-hidden="true" />
                  Chat on WhatsApp <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              )}
              {store.supportHours && <p>Support hours: {store.supportHours}</p>}
              {store.businessAddress && (
                <p className="flex items-start gap-3">
                  <MapPin size={20} aria-hidden="true" />
                  {store.businessAddress}
                </p>
              )}
              {!store.supportEmail && !store.whatsappNumber && (
                <p className="text-muted-foreground">
                  Direct contact details will appear here when the store publishes them. You can
                  check existing orders and request eligible returns from your account.
                </p>
              )}
            </>
          )}
          {info === 'faq' && (
            <>
              {[
                [
                  'Can I shop without an account?',
                  'Yes. Guest checkout is available. Keep your order confirmation and use the same browser to access your guest order.',
                ],
                [
                  'How can I pay?',
                  'Available payment methods are shown at checkout. Cash on delivery is offered where enabled; card payments use PayHere when configured.',
                ],
                [
                  'What does delivery cost?',
                  'Choose your district below or visit Delivery information. The final delivery charge is shown before you place your order.',
                ],
                [
                  'Can I return an item?',
                  store.returnWindowDays
                    ? `Eligible delivered items can be requested for return within ${store.returnWindowDays} days of delivery. Each request is reviewed before a refund is arranged.`
                    : 'See Returns & refunds for the current policy.',
                ],
                [
                  'How do product alerts work?',
                  'Sign in to save an alert for a selected variant. You can subscribe to a stock update or a lower price and cancel alerts from your account.',
                ],
                [
                  'Where is my order?',
                  'Use Track an order or open Your orders in your account for the latest status and any courier link.',
                ],
              ].map(([q, a]) => (
                <details key={q} className="group border-b pb-4">
                  <summary className="cursor-pointer font-semibold">{q}</summary>
                  <p className="text-muted-foreground mt-3">{a}</p>
                </details>
              ))}
            </>
          )}
          {info === 'shipping' && (
            <>
              <h2 className="text-xl font-semibold">Delivery across Sri Lanka</h2>
              <p className="text-muted-foreground">
                Select your district to see current delivery methods, estimated business days, and
                cash-on-delivery availability. Estimates may change during holidays or courier
                disruptions; they are not a guaranteed arrival date.
              </p>
              <DeliveryEstimator />
              <p className="text-muted-foreground">
                Your final shipping charge is shown at checkout. Follow your order from processing
                to delivery using the tracking page.
              </p>
              <Link
                href="/track-order"
                className="text-primary inline-flex items-center gap-2 font-semibold"
              >
                Track your order <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </>
          )}
          {info === 'returns' && (
            <>
              <h2 className="text-xl font-semibold">Request a return</h2>
              <p className="text-muted-foreground">
                {store.returnWindowDays
                  ? `Request eligible items within ${store.returnWindowDays} days of delivery.`
                  : 'The return window is temporarily unavailable. Please check again before purchasing.'}{' '}
                Select the items from your delivered order, choose a reason, and provide details.
                You can follow the request’s progress in your account.
              </p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>Open Your orders and choose the delivered order.</li>
                <li>Select the items you want to return and submit your request.</li>
                <li>Wait for approval and return instructions before sending items.</li>
                <li>After receipt and inspection, follow refund progress on the order page.</li>
              </ol>
              <p className="text-muted-foreground">
                Keep the product, accessories, and original packaging where possible. Describe
                damage, defects, or incorrect items clearly.{' '}
                {store.freeReturnShipping
                  ? 'The store covers approved return shipping.'
                  : 'Return shipping arrangements and any charges are confirmed when your request is reviewed.'}
              </p>
              <p className="text-muted-foreground">
                A return request or approval does not mean a refund is complete. Online refunds are
                shown as complete only after payment-provider confirmation. For cash-on-delivery
                orders, the store must confirm the repayment reference. Discounts are allocated to
                the returned items; delivery charges are included only for a whole-order return.
              </p>
              <Link
                href="/account/orders"
                className="text-primary inline-flex items-center gap-2 font-semibold"
              >
                Manage your orders <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </>
          )}
          {info === 'privacy' && (
            <>
              <h2 className="text-xl font-semibold">Information used to fulfil your order</h2>
              <p className="text-muted-foreground">
                Buyora uses your name, email, phone number, delivery address, and order details to
                manage accounts, fulfil purchases, send order updates, and handle support and
                returns. Delivery and payment providers receive the information needed to perform
                their services.
              </p>
              <h2 className="text-xl font-semibold">Payments and security</h2>
              <p className="text-muted-foreground">
                Card payments take place through the payment provider. Do not send card details to
                store support. Authentication cookies and a guest-cart cookie support sign-in,
                checkout, and order access.
              </p>
              <h2 className="text-xl font-semibold">Saved preferences and alerts</h2>
              <p className="text-muted-foreground">
                Recent searches, recently viewed products, comparison selections, and guest
                favourites are saved in your browser. Requested product alerts use your account
                email and can be cancelled in your account.
              </p>
              <h2 id="preferences" className="text-xl font-semibold">
                Optional shopping analytics
              </h2>
              <p className="text-muted-foreground">
                With your permission, Buyora records anonymous shopping event counts to understand
                search, cart, and checkout performance. We exclude search text, contact details, and
                delivery addresses from these events. You can change your choice below.
              </p>
              <AnalyticsPreferences />
              <h2 className="text-xl font-semibold">Questions and requests</h2>
              <p className="text-muted-foreground">
                Contact the store to ask about access, correction, or deletion of your information.
                Order and payment records may need to be retained for fulfilment, dispute handling,
                and accounting.
              </p>
              <Link href="/contact" className="text-primary font-semibold">
                Contact the store
              </Link>
            </>
          )}
          {info === 'terms' && (
            <>
              <h2 className="text-xl font-semibold">Orders and prices</h2>
              <p className="text-muted-foreground">
                Prices are displayed in Sri Lankan rupees. Review your selected product variants,
                quantities, address, delivery charge, and order total before submitting.
                Availability is checked when an order is placed. An order confirmation acknowledges
                receipt of your order; it does not confirm an online payment.
              </p>
              <h2 className="text-xl font-semibold">Payments and delivery</h2>
              <p className="text-muted-foreground">
                Use only the payment methods offered at checkout. Delivery estimates are based on
                the selected district and may be affected by holidays or courier conditions. Provide
                accurate contact and delivery details.
              </p>
              <h2 className="text-xl font-semibold">Cancellations, returns, and refunds</h2>
              <p className="text-muted-foreground">
                Available cancellation and return actions are shown on your order. Read the returns
                policy before purchasing. Refund progress is tracked separately from return
                approval, and payment-provider confirmation is required for online refunds.
              </p>
              <h2 className="text-xl font-semibold">Account use</h2>
              <p className="text-muted-foreground">
                Keep your sign-in details secure and use accurate information. Do not misuse the
                store, submit misleading reviews, or interfere with another customer’s account or
                orders.
              </p>
              <p>
                For questions about these terms,{' '}
                <Link href="/contact" className="text-primary font-semibold underline">
                  contact {store.businessName}
                </Link>
                .
              </p>
            </>
          )}
        </div>
        <aside className="h-fit rounded-2xl bg-[#f1e5d6] p-6">
          <Headphones
            size={30}
            strokeWidth={1.5}
            className="text-primary mb-4"
            aria-hidden="true"
          />
          <h2 className="text-lg font-semibold">A little help?</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Find answers, follow your order, or reach the store.
          </p>
          <div className="mt-5 flex flex-col gap-4 text-sm font-semibold">
            {[
              ['Frequently asked questions', '/faq'],
              ['Track an order', '/track-order'],
              ['Contact us', '/contact'],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="flex items-center justify-between">
                {label}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
