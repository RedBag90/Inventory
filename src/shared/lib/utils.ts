import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// cn(): merges Tailwind classes safely, resolving conflicts (e.g. p-2 + p-4 → p-4)
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// formatCurrency(): formats a number as EUR currency string (e.g. 25 → "25,00 €")
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

// formatDate(): formats a Date as a localised date string (e.g. "05.04.2026")
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE').format(date);
}
