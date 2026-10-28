'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { RotateCcw, Truck } from 'lucide-react';

export function ProductTabs({ product }) {
  const hasSpecs = product.specifications && Object.keys(product.specifications).length > 0;
  return (
    <Tabs
      defaultValue="description"
      className="bg-card mt-10 w-full min-w-0 gap-0 overflow-hidden rounded-2xl border"
    >
      <TabsList
        variant="line"
        aria-label="Product information"
        className="bg-muted/30 grid h-auto w-full grid-cols-3 gap-1 rounded-none border-b p-2 sm:flex sm:justify-start"
      >
        <TabsTrigger
          value="description"
          className="data-active:border-primary data-active:bg-background data-active:text-primary h-11 min-w-0 flex-none rounded-lg border-b-2 border-transparent px-2 py-2 text-xs leading-4 whitespace-normal after:hidden sm:px-5 sm:text-sm"
        >
          Description
        </TabsTrigger>
        <TabsTrigger
          value="specifications"
          className="data-active:border-primary data-active:bg-background data-active:text-primary h-11 min-w-0 flex-none rounded-lg border-b-2 border-transparent px-2 py-2 text-xs leading-4 whitespace-normal after:hidden sm:px-5 sm:text-sm"
        >
          Specifications
        </TabsTrigger>
        <TabsTrigger
          value="shipping"
          className="data-active:border-primary data-active:bg-background data-active:text-primary h-11 min-w-0 flex-none rounded-lg border-b-2 border-transparent px-2 py-2 text-xs leading-4 whitespace-normal after:hidden sm:px-5 sm:text-sm"
        >
          Shipping & Returns
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="min-w-0 p-5 sm:p-7">
        {product.description ? (
          <div className="text-muted-foreground max-w-4xl text-sm leading-7 break-words whitespace-pre-line">
            {product.description}
          </div>
        ) : (
          <p className="text-muted-foreground">No description available for this product.</p>
        )}
      </TabsContent>

      <TabsContent value="specifications" className="min-w-0 p-5 sm:p-7">
        {hasSpecs ? (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full table-fixed text-left text-sm">
              <tbody>
                {Object.entries(product.specifications).map(([key, value], index) => (
                  <tr key={key} className={index % 2 === 0 ? 'bg-muted/50' : 'bg-background'}>
                    <th className="text-foreground w-2/5 border-r px-4 py-3 align-top font-medium break-words sm:w-1/3">
                      {key}
                    </th>
                    <td className="text-muted-foreground px-4 py-3 align-top break-words">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground">No specifications available for this product.</p>
        )}
      </TabsContent>

      <TabsContent value="shipping" className="min-w-0 p-5 sm:p-7">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="min-w-0 space-y-3 rounded-xl border p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Truck className="text-primary h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">Shipping Information</h3>
            </div>
            <div className="text-muted-foreground text-sm leading-6 break-words">
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

          <div className="min-w-0 space-y-3 rounded-xl border p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <RotateCcw className="text-primary h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">Return Policy</h3>
            </div>
            <div className="text-muted-foreground text-sm leading-6 break-words">
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
