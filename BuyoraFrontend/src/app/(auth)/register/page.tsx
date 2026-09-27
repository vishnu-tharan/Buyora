'use client';
import { getErrorDetails } from '@/lib/api/errors';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { registerSchema } from '@/lib/validation/schemas';
import { authService } from '@/services/auth.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

const fullRegisterSchema = registerSchema
  .extend({
    confirmPassword: z.string(),
    terms: z
      .boolean()
      .refine((value) => value, { message: 'You must agree to the Terms of Service' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof fullRegisterSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
    setValue,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(fullRegisterSchema),
  });

  const acceptedTerms = useWatch({ control, name: 'terms' });
  const watchPassword = useWatch({ control, name: 'password', defaultValue: '' });

  // Calculate password strength
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

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const registerData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
      };
      await authService.register(registerData);
      toast.add({
        title: 'Account created!',
        description: 'Check your email to verify your account before signing in.',
      });
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    } catch (caught) {
      const error = getErrorDetails(caught);
      if (error.fieldErrors) {
        Object.keys(error.fieldErrors).forEach((key) => {
          setError(key as keyof RegisterFormValues, {
            type: 'server',
            message: error.fieldErrors?.[key],
          });
        });
      } else {
        toast.add({
          title: 'Registration failed',
          description: error.message || 'Something went wrong. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const strength = calculateStrength(watchPassword);

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Create Account</h2>
        <p className="mt-2 text-sm text-gray-500">Join Buyora today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" {...register('firstName')} aria-invalid={!!errors.firstName} />
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" {...register('lastName')} aria-invalid={!!errors.lastName} />
            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            {...register('phone')}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
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
          <Label htmlFor="confirmPassword">Confirm Password</Label>
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

        <div className="flex items-start space-x-2 pt-2">
          <div className="mt-0.5">
            <Checkbox
              id="terms"
              {...register('terms')}
              checked={acceptedTerms}
              onCheckedChange={(val) => setValue('terms', val === true, { shouldValidate: true })}
            />
          </div>
          <Label htmlFor="terms" className="text-sm leading-snug font-normal text-gray-600">
            I agree to the{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </Label>
        </div>
        {errors.terms && <p className="text-sm text-red-500">{errors.terms.message}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
            className="text-primary font-medium hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
