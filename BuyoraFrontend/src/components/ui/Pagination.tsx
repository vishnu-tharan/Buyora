import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './button';

interface PaginationProps {
  currentPage: number; // 0-indexed typically for backend, but we'll adapt to 1-indexed for display
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Assume currentPage is 0-indexed from API
  const current = currentPage + 1;

  const handlePageChange = (page: number) => {
    onPageChange(page - 1); // convert back to 0-indexed
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generatePages = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (current >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <nav
      aria-label="Pagination"
      className={cn('mt-8 flex items-center justify-center gap-1', className)}
    >
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => handlePageChange(current - 1)}
        disabled={current === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {generatePages().map((page, index) => {
        if (page === '...') {
          return (
            <div key={`ellipsis-${index}`} className="flex h-8 w-8 items-center justify-center">
              <MoreHorizontal className="text-muted-foreground h-4 w-4" />
            </div>
          );
        }

        const isCurrent = page === current;
        return (
          <Button
            key={page}
            variant={isCurrent ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(page as number)}
            aria-label={`Page ${page}`}
            aria-current={isCurrent ? 'page' : undefined}
          >
            {page}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => handlePageChange(current + 1)}
        disabled={current === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
