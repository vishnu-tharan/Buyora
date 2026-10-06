'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Truck, Banknote, Loader2 } from 'lucide-react';
import { SRI_LANKA_DISTRICTS } from '@/constants';
import { storeService } from '@/services/store.service';
import { formatCurrency } from '@/lib/formatting/currency';
export function DeliveryEstimator() {
  const [district, setDistrict] = useState('');
  const quote = useQuery({
    queryKey: ['delivery', district],
    queryFn: () => storeService.delivery(district),
    enabled: !!district,
    staleTime: 60000,
  });
  return (
    <div className="bg-background space-y-3 rounded-2xl border p-4">
      <label htmlFor="delivery-district" className="flex items-center gap-2 text-sm font-semibold">
        <MapPin size={16} aria-hidden="true" />
        Delivery to your district
      </label>
      <select
        id="delivery-district"
        value={district}
        onChange={(e) => setDistrict(e.target.value)}
        className="bg-card min-h-11 w-full rounded-xl border px-3 text-sm"
      >
        <option value="">Choose a district</option>
        {SRI_LANKA_DISTRICTS.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>
      <div aria-live="polite" className="text-sm">
        {quote.isFetching && (
          <span className="inline-flex items-center gap-2">
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            Checking delivery…
          </span>
        )}
        {quote.isError && (
          <p className="text-destructive">Delivery information is unavailable. Please try again.</p>
        )}
        {quote.data && (
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <Truck size={16} aria-hidden="true" />
              Estimated {quote.data.minDays}–{quote.data.maxDays} business days
            </p>
            {quote.data.methods.map((m) => (
              <p key={m.id} className="text-muted-foreground flex justify-between gap-3">
                <span>{m.name}</span>
                <span>{m.price === 0 ? 'Free' : formatCurrency(m.price)}</span>
              </p>
            ))}
            <p className="text-muted-foreground flex items-center gap-2">
              <Banknote size={16} aria-hidden="true" />
              {quote.data.codAvailable
                ? 'Cash on delivery available'
                : 'Cash on delivery unavailable'}
            </p>
            <p className="text-muted-foreground text-xs">
              Final charge shown at checkout; discounts may apply.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
