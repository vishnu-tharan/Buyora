'use client';
import { getErrorDetails } from '@/lib/api/errors';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { resetPasswordSchema } from '@/lib/validation/schemas';
import { authService } from '@/services/auth.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const watchPassword = useWatch({ control, name: 'password', defaultValue: '' });

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

  const strength = calculateStrength(watchPassword);

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

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0:
        return '';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Strong';
      case 4:
        return 'Very Strong';
      default:
        return '';
    }
  };

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Invalid Reset Link</h2>
        <p className="text-sm text-gray-500">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <div className="pt-4">
          <Button asChild className="w-full">
            <Link href="/forgot-password">Request New Link</Link>
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      await authService.resetPassword({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.add({
        title: 'Password updated',
        description: 'Your password has been successfully reset. Please sign in.',
      });
      router.push('/login');
    } catch (caught) {
      const error = getErrorDetails(caught);
      toast.add({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Set New Password</h2>
        <p className="mt-2 text-sm text-gray-500">Enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('password')}
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {watchPassword && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full ${getStrengthColor(strength)} transition-all duration-300`}
                  style={{ width: `${(strength / 4) * 100}%` }}
                />
              </div>
              <span className="w-16 text-right text-xs text-gray-500">
                {getStrengthLabel(strength)}
              </span>
            </div>
          )}
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('confirmPassword')}
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Reset Password
        </Button>
      </form>
    </div>
  );
}
