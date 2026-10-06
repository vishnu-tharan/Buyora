'use client';
import { Play } from 'lucide-react';
export function ProductVideo({
  url,
  name,
  poster,
}: {
  url?: string;
  name: string;
  poster?: string;
}) {
  if (!url || !/^\/media\/[0-9a-f-]{36}$/i.test(url)) return null;
  return (
    <section className="bg-card mt-8 rounded-2xl border p-5">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Play size={19} strokeWidth={1.5} aria-hidden="true" />A closer look
      </h2>
      <video
        src={url}
        controls
        playsInline
        preload="metadata"
        poster={poster}
        aria-label={'Product demonstration of ' + name}
        className="bg-muted max-h-[480px] w-full rounded-xl"
      />
      <p className="text-muted-foreground mt-2 text-xs">
        Product demonstration provided by the store.
      </p>
    </section>
  );
}
