'use client';
import { getErrorDetails } from '@/lib/api/errors';
import { cartService } from '@/services/cart.service';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { loginSchema } from '@/lib/validation/schemas';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const requestedUrl = searchParams.get('returnUrl') || '/';
  const returnUrl =
    requestedUrl.startsWith('/') && !requestedUrl.startsWith('//') && !requestedUrl.includes('\\')
      ? requestedUrl
      : '/';
  const { toast } = useToast();
  const setUser = useAuthStore((state) => state.setUser);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);

      setUser(response);
      queryClient.setQueryData(['auth', 'me'], response);
      try {
        await cartService.mergeCart();
      } catch {
        toast.add({
          title: 'Signed in',
          description:
            'Some guest cart items could not be merged. Please check stock before retrying.',
          type: 'error',
        });
      }
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      await queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.add({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      router.push(returnUrl);
    } catch (caught) {
      const error = getErrorDetails(caught);
      if (error.fieldErrors) {
        Object.keys(error.fieldErrors).forEach((key) => {
          setError(key as keyof LoginFormValues, {
            type: 'server',
            message: error.fieldErrors?.[key],
          });
        });
      } else {
        toast.add({
          title: 'Sign in failed',
          description: error.message || 'Please check your credentials and try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Sign In</h2>
        <p className="mt-2 text-sm text-gray-500">Welcome back to Buyora</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-primary text-sm font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
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
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Sign In
        </Button>
      </form>

      <div className="mt-6 space-y-2 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            href={`/register?returnUrl=${encodeURIComponent(returnUrl)}`}
            className="text-primary font-medium hover:underline"
          >
            Register
          </Link>
        </p>
        <p className="text-xs text-gray-500">Just browsing? You can checkout as a guest too.</p>
      </div>
    </div>
  );
}
