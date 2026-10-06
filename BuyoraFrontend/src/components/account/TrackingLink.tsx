import { ArrowUpRight, Truck } from 'lucide-react';
export function TrackingLink({ number, url }: { number?: string; url?: string }) {
  let safe: string | undefined;
  try {
    const u = new URL(url ?? '');
    if (u.protocol === 'https:' && !u.username && !u.password) safe = u.href;
  } catch {}
  if (!number) return null;
  return (
    <div className="bg-muted/40 rounded-xl border p-4 text-sm">
      <p className="flex items-center gap-2 font-medium">
        <Truck size={18} aria-hidden="true" />
        Courier reference: {number}
      </p>
      {safe && (
        <a
          href={safe}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary mt-2 inline-flex items-center gap-2 underline"
        >
          Track with courier <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
