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
  if (trimmed.includes(',')) {
    return trimmed.split(',').map(u => u.trim()).filter(Boolean);
  }
  
  // 4. Single URL
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
