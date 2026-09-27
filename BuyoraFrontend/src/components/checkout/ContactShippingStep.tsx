'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SRI_LANKA_DISTRICTS } from '@/constants';
import { useAuth } from '@/hooks/use-auth';
import { checkoutAddressSchema, checkoutContactSchema } from '@/lib/validation/schemas';
import { useCheckoutStore } from '@/stores';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

const formSchema = checkoutContactSchema.merge(
  checkoutAddressSchema.omit({ label: true, saveAddress: true }).extend({
    saveAddress: z.boolean().optional(),
  })
);

type FormData = z.infer<typeof formSchema>;

export function ContactShippingStep() {
  const { user } = useAuth();
  const checkoutState = useCheckoutStore((state) => state.state);
  const { setStep, setEmail, setShippingAddress } = useCheckoutStore();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<z.input<typeof formSchema>, unknown, FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: checkoutState.email || user?.email || '',
      firstName: checkoutState.shippingAddress?.firstName || user?.firstName || '',
      lastName: checkoutState.shippingAddress?.lastName || user?.lastName || '',
      phone: checkoutState.shippingAddress?.phone || user?.phone || '',
      addressLine1: checkoutState.shippingAddress?.addressLine1 || '',
      addressLine2: checkoutState.shippingAddress?.addressLine2 || '',
      city: checkoutState.shippingAddress?.city || '',
      district: checkoutState.shippingAddress?.district || '',
      postalCode: checkoutState.shippingAddress?.postalCode || '',
      country: 'Sri Lanka',
      saveAddress: checkoutState.shippingAddress?.saveAddress || false,
    },
    mode: 'onTouched',
  });

  const district = useWatch({ control, name: 'district', defaultValue: '' });
  const onSubmit = (data: FormData) => {
    setEmail(data.email);
    setShippingAddress({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      district: data.district,
      postalCode: data.postalCode,
      country: data.country,
      saveAddress: data.saveAddress,
    });
    setStep(2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Contact Section */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Contact Information</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              autoComplete="given-name"
              {...register('firstName')}
              className={errors.firstName ? 'border-red-500' : ''}
            />
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              autoComplete="family-name"
              {...register('lastName')}
              className={errors.lastName ? 'border-red-500' : ''}
            />
            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              {...register('phone')}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Shipping Address Section */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Shipping Address</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input
              id="addressLine1"
              autoComplete="address-line1"
              {...register('addressLine1')}
              className={errors.addressLine1 ? 'border-red-500' : ''}
            />
            {errors.addressLine1 && (
              <p className="text-sm text-red-500">{errors.addressLine1.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
            <Input id="addressLine2" autoComplete="address-line2" {...register('addressLine2')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              autoComplete="address-level2"
              {...register('city')}
              className={errors.city ? 'border-red-500' : ''}
            />
            {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <Select
              value={district || ''}
              onValueChange={(val) => setValue('district', val || '', { shouldValidate: true })}
            >
              <SelectTrigger id="district" className={errors.district ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                {SRI_LANKA_DISTRICTS?.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.district && <p className="text-sm text-red-500">{errors.district.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code (Optional)</Label>
            <Input id="postalCode" autoComplete="postal-code" {...register('postalCode')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              readOnly
              value="Sri Lanka"
              className="cursor-not-allowed bg-gray-50"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" size="lg" className="w-full md:w-auto">
          Continue to Shipping
        </Button>
      </div>
    </form>
  );
}
