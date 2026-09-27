'use client';
import { getErrorDetails } from '@/lib/api/errors';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { forgotPasswordSchema } from '@/lib/validation/schemas';
import { authService } from '@/services/auth.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword({ email: data.email });
      setSubmittedEmail(data.email);
      setIsSuccess(true);
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

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
            <MailCheck className="text-primary h-6 w-6" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Check your email</h2>
        <p className="text-sm text-gray-500">
          We&apos;ve sent password reset instructions to{' '}
          <span className="font-medium text-gray-900">{submittedEmail}</span>.
        </p>
        <div className="pt-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Return to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Reset Password</h2>
        <p className="mt-2 text-sm text-gray-500">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Send Reset Link
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-primary inline-flex items-center text-sm font-medium hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
