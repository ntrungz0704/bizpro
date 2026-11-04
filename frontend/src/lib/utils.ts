import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Deterministic VND currency formatter to eliminate SSR hydration mismatches across environments
 */
export function formatVND(amount: number): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "0 ₫";
  const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted} ₫`;
}

/**
 * Deterministic integer formatter
 */
export function formatNumber(value: number): string {
  if (value === null || value === undefined || isNaN(value)) return "0";
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
