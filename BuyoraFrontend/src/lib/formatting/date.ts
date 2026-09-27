import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export function formatDate(dateString: string, pattern = 'MMM d, yyyy'): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid date';
    return format(date, pattern);
  } catch {
    return 'Invalid date';
  }
}

export function formatRelativeDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Unknown date';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Unknown date';
  }
}

export function formatDateTime(dateString: string): string {
  return formatDate(dateString, 'MMM d, yyyy h:mm a');
}
