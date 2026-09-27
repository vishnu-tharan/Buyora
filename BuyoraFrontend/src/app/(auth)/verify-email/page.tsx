'use client';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';
import { getErrorDetails } from '@/lib/api/errors';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
export default function VerifyEmailPage() {
  const token = useSearchParams().get('token');
  const [pending, setPending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  async function verify() {
    if (!token || pending) return;
    setPending(true);
    setError('');
    try {
      await api.post('/auth/verify-email', { token });
      setVerified(true);
    } catch (error) {
      setError(getErrorDetails(error).message);
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">Verify your email</h1>
      {verified ? (
        <>
          <p>Your email is verified. You can now sign in.</p>
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </>
      ) : (
        <>
          <p>
            {token
              ? 'Confirm your email address to activate your Buyora account.'
              : 'Open the verification link in your email to continue.'}
          </p>
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          <Button onClick={verify} disabled={!token || pending}>
            {pending ? 'Verifying…' : 'Verify email'}
          </Button>
        </>
      )}
    </section>
  );
}
