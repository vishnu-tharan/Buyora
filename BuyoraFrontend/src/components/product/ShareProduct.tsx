'use client';
import { Share2 } from 'lucide-react';
import { useState } from 'react';
export function ShareProduct({ name, slug }: { name: string; slug: string }) {
  const [message, setMessage] = useState('');
  async function share() {
    const url = new URL('/product/' + slug, window.location.origin).toString();
    try {
      if (navigator.share) await navigator.share({ title: name, url });
      else {
        await navigator.clipboard.writeText(url);
        setMessage('Link copied');
      }
    } catch {
      setMessage('Sharing unavailable');
    }
  }
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={share}
        className="text-muted-foreground hover:bg-muted inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-xs"
      >
        <Share2 size={16} aria-hidden="true" />
        Share
      </button>
      <span role="status" className="text-muted-foreground text-xs">
        {message}
      </span>
    </span>
  );
}
