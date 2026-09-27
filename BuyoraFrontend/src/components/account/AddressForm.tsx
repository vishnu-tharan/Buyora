'use client';
import { getErrorDetails } from '@/lib/api/errors';

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
import { useToast } from '@/hooks/use-toast';
import { addressSchema } from '@/lib/validation/schemas';
import { accountService } from '@/services/account.service';
import { Address } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

const SRI_LANKA_DISTRICTS = [
  'Ampara',
  'Anuradhapura',
  'Badulla',
  'Batticaloa',
  'Colombo',
  'Galle',
  'Gampaha',
  'Hambantota',
  'Jaffna',
  'Kalutara',
  'Kandy',
  'Kegalle',
  'Kilinochchi',
  'Kurunegala',
  'Mannar',
  'Matale',
  'Matara',
  'Monaragala',
  'Mullaitivu',
  'Nuwara Eliya',
  'Polonnaruwa',
  'Puttalam',
  'Ratnapura',
  'Trincomalee',
  'Vavuniya',
];

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  initialData?: Address;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddressForm({ initialData, onSuccess, onCancel }: AddressFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<z.input<typeof addressSchema>, unknown, AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData
      ? {
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          phone: initialData.phone,
          addressLine1: initialData.addressLine1,
          addressLine2: initialData.addressLine2 || '',
          city: initialData.city,
          district: initialData.district,
          postalCode: initialData.postalCode || '',
          country: initialData.country,
          label: initialData.label || '',
        }
      : {
          country: 'Sri Lanka',
        },
  });

  const district = useWatch({ control, name: 'district', defaultValue: '' });
  const onSubmit = async (data: AddressFormValues) => {
    setIsLoading(true);
    try {
      if (initialData) {
        await accountService.updateAddress(initialData.publicId, {
          ...data,
          isDefault: initialData.isDefault,
        });
        toast.add({ title: 'Address updated successfully' });
      } else {
        await accountService.addAddress({ ...data, isDefault: false });
        toast.add({ title: 'Address added successfully' });
      }
      onSuccess();
    } catch (caught) {
      const err = getErrorDetails(caught);
      toast.add({
        title: 'Error saving address',
        description: err.message || 'Please check your inputs and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" {...register('firstName')} aria-invalid={!!errors.firstName} />
          {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" {...register('lastName')} aria-invalid={!!errors.lastName} />
          {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" type="tel" {...register('phone')} aria-invalid={!!errors.phone} />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine1">Address Line 1</Label>
        <Input
          id="addressLine1"
          {...register('addressLine1')}
          aria-invalid={!!errors.addressLine1}
        />
        {errors.addressLine1 && (
          <p className="text-sm text-red-500">{errors.addressLine1.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
        <Input id="addressLine2" {...register('addressLine2')} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register('city')} aria-invalid={!!errors.city} />
          {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>District</Label>
          <Select
            value={district}
            onValueChange={(val) => setValue('district', val || '', { shouldValidate: true })}
          >
            <SelectTrigger aria-invalid={!!errors.district}>
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {SRI_LANKA_DISTRICTS.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.district && <p className="text-sm text-red-500">{errors.district.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code (Optional)</Label>
          <Input id="postalCode" {...register('postalCode')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...register('country')} disabled className="bg-gray-50" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="label">Label (Optional)</Label>
        <Input id="label" placeholder="e.g. Home, Work" {...register('label')} />
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {initialData ? 'Update Address' : 'Save Address'}
        </Button>
      </div>
    </form>
  );
}
