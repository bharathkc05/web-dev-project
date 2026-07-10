import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes safely, handling conditional classes.
 * @example cn('base', isActive && 'active', className)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
