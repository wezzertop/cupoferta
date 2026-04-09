import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAvatarUrl(url: string | null | undefined, seed: string, updatedAt?: string | null) {
  if (!url) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  
  if (url.includes('supabase')) {
    const version = updatedAt ? new Date(updatedAt).getTime() : '1';
    return `${url}?v=${version}`;
  }
  
  // Handlers for other providers or URLs
  return url;
}

export function getDealImages(urlData: any): string[] {
  if (!urlData) return [];
  
  // 1. Si Postgres (Supabase) ya devuelve un Array nativo de texto (text[])
  if (Array.isArray(urlData)) return urlData;
  
  const urlStr = String(urlData);
  const trimmed = urlStr.trim();

  // 2. Try to parse as JSON (handles ["url1", "url2"])
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // If it looks like JSON but fails, continue to CSV
    }
  }
  
  // 3. Handle CSV (handles "url1, url2")
  // Importante: No separar si es una Data URL (Base64) ya que contiene comas
  if (trimmed.includes(',') && !trimmed.startsWith('data:')) {
    return trimmed.split(',').map(u => u.trim()).filter(Boolean);
  }
  
  // 4. Single URL or Base64
  return [trimmed];
}

export function getRemainingTime(expiresAt: string | null | undefined): string | null {
  if (!expiresAt) return null;
  const target = new Date(expiresAt).getTime();
  const now = new Date().getTime();
  const diff = target - now;

  if (diff <= 0) return 'Expirado';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 7) return `Faltan ${days}d`;
  
  if (days > 0) {
    return `Faltan ${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  
  if (hours > 0) {
    return `Faltan ${hours}h ${minutes}m ${seconds}s`;
  }
  
  return `Faltan ${minutes}m ${seconds}s`;
}

export const CURRENCIES = [
  { code: 'MXN', label: 'Peso Mexicano', symbol: '$', flag: '🇲🇽', country: 'México', iso: 'mx' },
  { code: 'ARS', label: 'Peso Argentino', symbol: '$', flag: '🇦🇷', country: 'Argentina', iso: 'ar' },
  { code: 'USD', label: 'Dólar Estadounidense', symbol: '$', flag: '🇺🇸', country: 'EE.UU.', iso: 'us' },
  { code: 'EUR', label: 'Euro', symbol: '€', flag: '🇪🇺', country: 'Europa', iso: 'eu' },
  { code: 'CLP', label: 'Peso Chileno', symbol: '$', flag: '🇨🇱', country: 'Chile', iso: 'cl' },
  { code: 'COP', label: 'Peso Colombiano', symbol: '$', flag: '🇨🇴', country: 'Colombia', iso: 'co' },
  { code: 'PEN', label: 'Sol Peruano', symbol: 'S/', flag: '🇵🇪', country: 'Perú', iso: 'pe' },
];

export function formatPrice(price: number, currencyCode: string = 'MXN') {
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  return `${currency.symbol}${price.toLocaleString()}`;
}

export function getCurrencyFlag(currencyCode: string = 'MXN') {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  return currency ? currency.flag : '🇲🇽';
}

export function getFlagUrl(currencyCode: string = 'MXN') {
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  return `https://flagcdn.com/w40/${currency.iso}.png`;
}
