'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { accountService } from '@/services/account.service';
import { useAuthStore } from '@/stores/auth.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  phone: z
    .string()
    .regex(/^[0-9+\s-]{9,15}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const updatedUser = await accountService.updateProfile(data);
      setUser({ ...user, ...updatedUser });
      toast.add({
        title: 'Profile updated',
        description: 'Your profile changes have been saved.',
      });
    } catch {
      toast.add({
        title: 'Update failed',
        description: 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 md:p-8">
      <h2 className="mb-6 text-xl font-semibold">My Profile</h2>

      <div className="mb-8 flex flex-col gap-8 border-b border-gray-100 pb-8 md:flex-row">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar} alt={user.firstName} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  aria-invalid={!!errors.firstName}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" {...register('lastName')} aria-invalid={!!errors.lastName} />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500">Contact support to change your email address.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" type="tel" {...register('phone')} aria-invalid={!!errors.phone} />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={!isDirty || isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
