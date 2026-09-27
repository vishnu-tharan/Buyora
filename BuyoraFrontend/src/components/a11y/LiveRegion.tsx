'use client';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive';
}

export function LiveRegion({ message, politeness = 'polite' }: LiveRegionProps) {
  return (
    <div aria-live={politeness} aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
