import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: bigint | number): string {
    const num = typeof amount === 'bigint' ? Number(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(num / 100);
}

export function formatDate(timestamp: bigint | number): string {
    const ms = typeof timestamp === 'bigint' ? Number(timestamp) / 1_000_000 : timestamp;
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(ms));
}

export function formatDateInput(timestamp: bigint | number): string {
    const ms = typeof timestamp === 'bigint' ? Number(timestamp) / 1_000_000 : timestamp;
    const d = new Date(ms);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function dateInputToNanoseconds(dateStr: string): bigint {
    const ms = new Date(dateStr).getTime();
    return BigInt(ms) * BigInt(1_000_000);
}

export function nowNanoseconds(): bigint {
    return BigInt(Date.now()) * BigInt(1_000_000);
}

export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
