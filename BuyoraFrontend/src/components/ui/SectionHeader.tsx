import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  linkText?: string;
  linkHref?: string;
}

export function SectionHeader({ title, subtitle, linkText, linkHref }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex flex-col justify-between space-y-2 sm:flex-row sm:items-end sm:space-y-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {linkText && linkHref && (
        <Link href={linkHref} className="text-primary text-sm font-medium hover:underline">
          {linkText} &rarr;
        </Link>
      )}
    </div>
  );
}
