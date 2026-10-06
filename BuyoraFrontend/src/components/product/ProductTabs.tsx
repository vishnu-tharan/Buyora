'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import type { Product } from '@/types';
import { RotateCcw, Truck } from 'lucide-react';

interface ProductTabsProps {
  product: Product;
}

export function ProductTabs({ product }: ProductTabsProps) {
  const hasSpecs = product.specifications && Object.keys(product.specifications).length > 0;

  return (
    <Tabs defaultValue="description" className="mt-12 w-full">
      <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          value="description"
          className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:bg-transparent"
        >
          Description
        </TabsTrigger>
        <TabsTrigger
          value="specifications"
          className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:bg-transparent"
        >
          Specifications
        </TabsTrigger>
        <TabsTrigger
          value="shipping"
          className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:bg-transparent"
        >
          Shipping & Returns
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="animate-in fade-in-50 py-6">
        {product.description ? (
          <div className="prose prose-sm md:prose-base dark:prose-invert text-muted-foreground max-w-none">
            {product.description}
          </div>
        ) : (
          <p className="text-muted-foreground">No description available for this product.</p>
        )}
      </TabsContent>

      <TabsContent value="specifications" className="animate-in fade-in-50 py-6">
        {hasSpecs ? (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-left text-sm">
              <tbody>
                {Object.entries(product.specifications!).map(([key, value], index) => (
                  <tr key={key} className={index % 2 === 0 ? 'bg-muted/50' : 'bg-background'}>
                    <th className="text-foreground w-1/3 border-r px-4 py-3 font-medium">{key}</th>
                    <td className="text-muted-foreground px-4 py-3">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground">No specifications available for this product.</p>
        )}
      </TabsContent>

      <TabsContent value="shipping" className="animate-in fade-in-50 py-6">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Truck className="text-primary h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">Shipping Information</h3>
            </div>
            <div className="text-muted-foreground prose prose-sm dark:prose-invert">
              {product.shippingInfo ? (
                <div className="whitespace-pre-line">{product.shippingInfo}</div>
              ) : (
                <p>
                  Select your district above for current delivery methods and estimates. The final
                  charge is shown at checkout.{' '}
                  <Link href="/shipping" className="text-primary underline">
                    Delivery details
                  </Link>
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <RotateCcw className="text-primary h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">Return Policy</h3>
            </div>
            <div className="text-muted-foreground prose prose-sm dark:prose-invert">
              {product.returnInfo ? (
                <div className="whitespace-pre-line">{product.returnInfo}</div>
              ) : (
                <p>
                  Choose eligible items from your delivered order to request a return. Approval and
                  refund progress are shown separately.{' '}
                  <Link href="/returns" className="text-primary underline">
                    Read the current returns policy
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
