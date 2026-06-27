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
