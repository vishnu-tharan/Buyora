import { BuyoraApiError } from '@/lib/api-client';

export function getErrorDetails(error) {
  if (error instanceof BuyoraApiError)
    return { message: error.message, fieldErrors: error.fieldErrors };
  return { message: 'Unable to complete the request. Please try again.' };
}
