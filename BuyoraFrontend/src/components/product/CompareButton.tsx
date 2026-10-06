'use client';
import { Columns3, Check } from 'lucide-react';
import { useCompare } from '@/hooks/use-compare';
import Link from 'next/link';
export function CompareButton({ id, compact = false }: { id: number; compact?: boolean }) {
  const { ids, toggle } = useCompare();
  const selected = ids.includes(id);
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label={selected ? 'Remove from comparison' : 'Compare product'}
        aria-pressed={selected}
        disabled={!selected && ids.length >= 4}
        onClick={() => toggle(id)}
        className="text-muted-foreground hover:bg-muted inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-xs font-medium disabled:opacity-40"
      >
        {selected ? (
          <Check size={16} aria-hidden="true" />
        ) : (
          <Columns3 size={16} aria-hidden="true" />
        )}
        {!compact && (selected ? 'Added to comparison' : 'Compare')}
      </button>
      {!compact && ids.length > 0 && (
        <Link href="/compare" className="text-primary text-xs font-semibold underline">
          View comparison ({ids.length})
        </Link>
      )}
    </div>
  );
}
