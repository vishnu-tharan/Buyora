'use client';
import { getErrorDetails } from '@/lib/api/errors';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { changePasswordSchema } from '@/lib/validation/schemas';
import { authService } from '@/services/auth.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function SecurityPage() {
  const { toast } = useToast();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const watchNewPassword = useWatch({ control, name: 'newPassword', defaultValue: '' });

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 8) score += 1;
    if (pass.length > 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(4, score);
  };

  const strength = calculateStrength(watchNewPassword);

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
        return 'bg-gray-200';
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-200';
    }
  };

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setIsLoading(true);
    try {
      await authService.changePassword(data);
      toast.add({ title: 'Password updated successfully' });
      reset();
    } catch (caught) {
      const err = getErrorDetails(caught);
      toast.add({
        title: 'Update failed',
        description: err.message || 'Incorrect current password or something went wrong.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">Security</h1>

      <div className="rounded-xl border border-gray-100 bg-white p-6 md:p-8">
        <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold">
          <Shield className="h-5 w-5 text-gray-400" />
          Change Password
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('currentPassword')}
                aria-invalid={!!errors.currentPassword}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('newPassword')}
                aria-invalid={!!errors.newPassword}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {watchNewPassword && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full ${getStrengthColor(strength)} transition-all duration-300`}
                    style={{ width: `${(strength / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {errors.newPassword && (
              <p className="text-sm text-red-500">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
            <Input
              id="confirmNewPassword"
              type={showNew ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('confirmNewPassword')}
              aria-invalid={!!errors.confirmNewPassword}
            />
            {errors.confirmNewPassword && (
              <p className="text-sm text-red-500">{errors.confirmNewPassword.message}</p>
            )}
          </div>

          <Button type="submit" disabled={!isDirty || isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
