import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SORT_OPTIONS } from '@/constants';
import { SortOption } from '@/types';

interface ProductListControlsProps {
  totalElements: number;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  mobileFilterTrigger?: React.ReactNode;
}

export function ProductListControls({
  totalElements,
  sort,
  onSortChange,
  mobileFilterTrigger,
}: ProductListControlsProps) {
  return (
    <div className="mb-4 flex flex-col items-start justify-between gap-4 py-2 sm:flex-row sm:items-center">
      <div className="text-muted-foreground text-sm">
        Showing <span className="text-foreground font-medium">{totalElements}</span> results
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        {mobileFilterTrigger && (
          <div className="flex-1 sm:flex-none lg:hidden">{mobileFilterTrigger}</div>
        )}

        <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
          <span className="text-muted-foreground hidden text-sm sm:inline-block">Sort by:</span>
          <Select
            value={sort || 'RELEVANCE'}
            onValueChange={(v) => {
              if (v) onSortChange(v as SortOption);
            }}
          >
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue>
                {SORT_OPTIONS.find((option) => option.value === sort)?.label ?? 'Relevance'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
