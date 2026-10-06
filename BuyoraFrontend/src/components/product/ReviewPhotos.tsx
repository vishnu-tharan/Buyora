'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
export function ReviewPhotos({ images }: { images?: string[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  if (!images?.length) return null;
  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        {images.map((url, i) => (
          <button
            key={url}
            className="relative size-20 overflow-hidden rounded-xl border"
            type="button"
            onClick={() => setSelected(url)}
            aria-label={'View customer photo ' + (i + 1)}
          >
            <Image
              src={url}
              alt={'Customer photo ' + (i + 1)}
              fill
              sizes="80px"
              className="object-cover"
              unoptimized
            />
          </button>
        ))}
      </div>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogTitle>Customer photo</DialogTitle>
          {selected && (
            <div className="relative h-[60vh]">
              <Image
                src={selected}
                alt="Customer product photo"
                fill
                sizes="80vw"
                className="object-contain"
                unoptimized
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
