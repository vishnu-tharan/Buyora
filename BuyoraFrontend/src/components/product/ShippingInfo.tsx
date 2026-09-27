import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, ShieldCheck, Truck } from 'lucide-react';

export function ShippingInfo() {
  return (
    <Card className="bg-muted/50 mt-6">
      <CardContent className="space-y-3 p-4 text-sm">
        <div className="text-muted-foreground flex items-start gap-3">
          <Truck className="text-foreground h-5 w-5 shrink-0" />
          <p>
            <span className="text-foreground font-medium">Free shipping</span> on orders over LKR
            5,000. Usually dispatched in 1-2 business days.
          </p>
        </div>
        <div className="text-muted-foreground flex items-start gap-3">
          <RotateCcw className="text-foreground h-5 w-5 shrink-0" />
          <p>
            <span className="text-foreground font-medium">30-day easy returns</span>. Return
            shipping is free.
          </p>
        </div>
        <div className="text-muted-foreground flex items-start gap-3">
          <ShieldCheck className="text-foreground h-5 w-5 shrink-0" />
          <p>
            <span className="text-foreground font-medium">Secure checkout</span> with 256-bit
            encryption.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
