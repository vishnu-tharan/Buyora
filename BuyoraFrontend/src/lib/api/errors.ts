import { BuyoraApiError } from './client';
export function getErrorDetails(error: unknown): {
  message: string;
  fieldErrors?: Record<string, string>;
} {
  if (error instanceof BuyoraApiError)
    return { message: error.message, fieldErrors: error.fieldErrors };
  return { message: 'Unable to complete the request. Please try again.' };
}
