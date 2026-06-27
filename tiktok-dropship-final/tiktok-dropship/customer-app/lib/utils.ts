import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: string | null): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateOrderNumber(): string {
  return "#" + Math.floor(10000 + Math.random() * 90000).toString();
}

export function generateReferralCode(): string {
  return "REF" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    usdt_trc20: "USDT TRC20",
    aba: "ABA Bank",
    acleda: "ACLEDA Bank",
    bakong: "Bakong KHQR",
    bank: "Bank Transfer",
  };
  return labels[method] || method;
}

export function normalizePhone(phone: string): string {
  // Remove spaces, dashes, and parentheses
  let cleaned = phone.replace(/[\s\-()]/g, "");

  // If starts with +, keep it; otherwise handle Cambodian formats
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  if (cleaned.startsWith("0")) {
    return "+855" + cleaned.slice(1);
  }

  if (cleaned.startsWith("855")) {
    return "+" + cleaned;
  }

  // Assume Cambodian mobile number without prefix
  return "+855" + cleaned;
}

export function phoneToEmail(phone: string): string {
  const normalized = normalizePhone(phone);
  // Supabase Auth requires an email, so we derive one from the phone number
  return normalized.replace(/^\+/, "") + "@phone.local";
}

export function isValidCambodianPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  // +855 followed by 8 or 9 digits
  return /^\+855\d{8,9}$/.test(normalized);
}
