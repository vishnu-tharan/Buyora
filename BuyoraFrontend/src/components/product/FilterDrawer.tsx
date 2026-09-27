import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Filter } from 'lucide-react';
import { useState } from 'react';
import { FilterSidebar } from './FilterSidebar';

export function FilterDrawer(
  props: React.ComponentProps<typeof FilterSidebar> & { activeCount: number }
) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {props.activeCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5"
            >
              {props.activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex h-full w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center justify-between">
            Filters
            {props.hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={props.clearFilters}
                className="text-muted-foreground"
              >
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <FilterSidebar {...props} />
        </div>

        <SheetFooter className="mt-auto border-t p-4">
          <Button className="w-full" onClick={() => setOpen(false)}>
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
