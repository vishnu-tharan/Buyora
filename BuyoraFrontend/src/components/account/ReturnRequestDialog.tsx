'use client';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/formatting/currency';
import { OrderItem } from '@/types/order';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ReturnRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: OrderItem[];
  onSubmit: (data: { itemIds: number[]; reason: string; notes: string }) => Promise<void>;
  isLoading: boolean;
}

const RETURN_REASONS = [
  'Item is defective or broken',
  'Wrong item was sent',
  'Item does not match description',
  'Changed my mind',
  'Size/Fit issue',
];

export function ReturnRequestDialog({
  open,
  onOpenChange,
  items,
  onSubmit,
  isLoading,
}: ReturnRequestDialogProps) {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const eligibleIds = selectedItems.filter((id) => items.some((item) => item.id === id));
    if (eligibleIds.length === 0) {
      setError('Please select at least one item to return.');
      return;
    }
    if (!reason) {
      setError('Please select a reason for return.');
      return;
    }

    await onSubmit({
      itemIds: eligibleIds,
      reason,
      notes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Return</DialogTitle>
          <DialogDescription>
            Select the items you want to return and tell us what happened.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <Label>Items in this return</Label>
            <div className="max-h-60 space-y-3 overflow-y-auto rounded-md border p-3 pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    aria-label={'Return ' + item.product.name}
                    checked={selectedItems.includes(item.id)}
                    onChange={() =>
                      setSelectedItems((ids) =>
                        ids.includes(item.id)
                          ? ids.filter((id) => id !== item.id)
                          : [...ids, item.id]
                      )
                    }
                    className="mt-1 size-4"
                  />
                  <div className="flex gap-3">
                    {item.product.primaryImage && (
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded border">
                        <Image
                          src={item.product.primaryImage.url}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <Label className="block cursor-pointer text-sm font-medium">
                        {item.product.name}
                      </Label>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Qty: {item.quantity} • {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason for Return</Label>
            <Select value={reason} onValueChange={(val) => setReason(val || '')}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {RETURN_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              placeholder="Please provide more details about the issue..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
