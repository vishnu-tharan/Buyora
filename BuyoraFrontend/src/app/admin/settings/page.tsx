'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useState } from 'react';
import { Store, Save, Truck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/ErrorState';
import { getErrorDetails } from '@/lib/api/errors';
import { SRI_LANKA_DISTRICTS } from '@/constants';
interface Settings {
  businessName: string;
  businessAddress: string;
  supportEmail: string;
  whatsappNumber: string;
  supportHours: string;
  returnWindowDays: number;
  freeReturnShipping: boolean;
  deliveryMinDays: number;
  deliveryMaxDays: number;
  codDistricts: string[];
  districtExtraDays: Record<string, number>;
}
function Editor({ initial }: { initial: Settings }) {
  const [values, setValues] = useState(initial);
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: () => api.put<Settings>('/admin/store-settings', values),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['store-settings'] });
      client.invalidateQueries({ queryKey: ['store-info'] });
      client.invalidateQueries({ queryKey: ['delivery'] });
    },
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="bg-card max-w-3xl space-y-6 rounded-2xl border p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            'businessName',
            'supportEmail',
            'whatsappNumber',
            'supportHours',
            'businessAddress',
          ] as const
        ).map((key) => (
          <label key={key} className="text-sm font-medium">
            {
              {
                businessName: 'Business name',
                supportEmail: 'Support email',
                whatsappNumber: 'WhatsApp number with country code',
                supportHours: 'Support hours',
                businessAddress: 'Business address',
              }[key]
            }
            <Input
              value={values[key]}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              type={key === 'supportEmail' ? 'email' : 'text'}
              required={key === 'businessName'}
              maxLength={key === 'businessAddress' ? 500 : 200}
              className="mt-2"
            />
          </label>
        ))}
      </div>
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Truck size={20} aria-hidden="true" />
        Delivery & returns
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {(['deliveryMinDays', 'deliveryMaxDays', 'returnWindowDays'] as const).map((key) => (
          <label key={key} className="text-sm">
            {key === 'deliveryMinDays'
              ? 'Minimum delivery days'
              : key === 'deliveryMaxDays'
                ? 'Maximum delivery days'
                : 'Return window (days)'}
            <Input
              type="number"
              min={1}
              max={key === 'returnWindowDays' ? 90 : 60}
              value={values[key]}
              onChange={(e) => setValues((v) => ({ ...v, [key]: Number(e.target.value) }))}
              required
              className="mt-2"
            />
          </label>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.freeReturnShipping}
          onChange={(e) => setValues((v) => ({ ...v, freeReturnShipping: e.target.checked }))}
        />
        The store covers approved return shipping
      </label>
      <div>
        <h3 className="font-semibold">Cash-on-delivery districts</h3>
        <p className="text-muted-foreground my-2 text-xs">
          Leave all unchecked to allow every district when COD is enabled. Selecting districts
          restricts COD to that list.
        </p>
        <div className="grid grid-cols-2 gap-2 rounded-xl border p-4 sm:grid-cols-3">
          {SRI_LANKA_DISTRICTS.map((d) => (
            <label key={d} className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={values.codDistricts.includes(d)}
                onChange={() =>
                  setValues((v) => ({
                    ...v,
                    codDistricts: v.codDistricts.includes(d)
                      ? v.codDistricts.filter((x) => x !== d)
                      : [...v.codDistricts, d],
                  }))
                }
              />
              {d}
            </label>
          ))}
        </div>
      </div>
      <p className="text-muted-foreground text-xs leading-6">
        Changes affect public support and policy pages, district estimates, and checkout
        eligibility. Confirm that published terms match your actual operations. Payment credentials
        remain in the deployment configuration.
      </p>
      <Button type="submit" disabled={save.isPending}>
        <Save size={16} />
        {save.isPending ? 'Saving…' : 'Save store settings'}
      </Button>
      {save.isSuccess && (
        <p role="status" className="text-sm">
          Store settings saved.
        </p>
      )}
      {save.isError && (
        <p role="alert" className="text-destructive text-sm">
          {getErrorDetails(save.error).message}
        </p>
      )}
    </form>
  );
}
export default function SettingsPage() {
  const query = useQuery({
    queryKey: ['store-settings'],
    queryFn: () => api.get<Settings>('/admin/store-settings'),
  });
  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-3 text-2xl font-semibold">
        <Store size={28} strokeWidth={1.5} aria-hidden="true" />
        Store settings
      </h1>
      {query.isError ? (
        <ErrorState title="Settings unavailable" onRetry={() => query.refetch()} />
      ) : query.data ? (
        <Editor initial={query.data} />
      ) : (
        <p>Loading settings…</p>
      )}
    </div>
  );
}
