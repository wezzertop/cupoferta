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

/**
 * Intenta transformar una URL de imagen (de Amazon, Miravia, etc)
 * a su versión de máxima resolución posible antes de procesarla o enviarla.
 */
export function getHighResImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // 1. URLs de Amazon (ej: ._AC_SX679_.jpg -> ._AC_SL1500_.jpg)
  if (url.includes('media-amazon.com') || url.includes('ssl-images-amazon.com')) {
    // Reemplaza cualquier transformador de Amazon por uno de alta resolución (1500px)
    // O simplemente quita el transformador para obtener la original
    return url.replace(/\._AC_[^.]+\./, '._AC_SL1500_.');
  }
  
  // 2. AliExpress / Miravia (ej: img.alicdn.com/..._220x220.jpg)
  if (url.includes('alicdn.com')) {
    // Quita el sufijo de dimensiones que suelen añadir
    return url.replace(/_[0-9]+x[0-9]+[^.]+\.[a-z0-9]+$/i, '');
  }

  return url;
}

// --- Cookie Helpers ---
export function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// --- Preference Tracking ---
export function updatePreferences(category: string) {
  if (!category || typeof document === 'undefined') return;
  
  // Only track if user has given consent
  const consent = getCookie('cookie_consent');
  if (consent !== 'true') return;

  const prefsStr = getCookie('user_preferences');
  let prefs: string[] = [];
  
  if (prefsStr) {
    try {
      prefs = JSON.parse(prefsStr);
    } catch (e) {
      prefs = [];
    }
  }

  // Add category if not already in recent (keep last 5)
  prefs = prefs.filter(p => p !== category);
  prefs.unshift(category);
  prefs = prefs.slice(0, 5);


  setCookie('user_preferences', JSON.stringify(prefs), 365);
}

// --- Store Custom Branding ---
// Accepts optional officialStores array from the Zustand cache for dynamic matching.
export function getStoreStyles(
  storeName: string | null | undefined, 
  isDarkMode: boolean, 
  officialStores?: any[]
): { bg: string; text: string; border: string } {
  const store = (storeName || '').toLowerCase().trim();
  
  // 1. Try dynamic match from official stores cache first
  if (officialStores && officialStores.length > 0) {
    const match = officialStores.find(s => {
      const sName = (s.name || '').toLowerCase();
      const sSlug = (s.slug || '').toLowerCase();
      return store.includes(sName) || store.includes(sSlug) || sName.includes(store);
    });
    
    if (match) {
      return {
        bg: `bg-[${match.color_primary}]`,
        text: `text-[${match.color_text}]`,
        border: `border-[${match.color_border || match.color_primary}]`,
      };
    }
  }
  
  // 2. Hardcoded fallback themes (guarantees styling even without DB)
  const themes: Record<string, { bg: string, text: string, border: string }> = {
    'amazon': { 
      bg: 'bg-[#FF9900]', 
      text: 'text-black', 
      border: 'border-[#e68a00]' 
    },
    'mercado libre': { 
      bg: 'bg-[#FFE600]', 
      text: 'text-black', 
      border: 'border-[#d4bf00]' 
    },
    'tiktok': { 
      bg: isDarkMode ? 'bg-white' : 'bg-black', 
      text: isDarkMode ? 'text-black' : 'text-white', 
      border: isDarkMode ? 'border-white' : 'border-black' 
    },
    'aliexpress': { 
      bg: 'bg-[#E62E04]', 
      text: 'text-white', 
      border: 'border-[#b52403]' 
    },
    'miravia': { 
      bg: 'bg-[#FF004C]', 
      text: 'text-white', 
      border: 'border-[#cc003d]' 
    },
    'temu': { 
      bg: 'bg-[#FF6000]', 
      text: 'text-white', 
      border: 'border-[#cc4d00]' 
    },
    'walmart': { 
      bg: 'bg-[#0071CE]', 
      text: 'text-white', 
      border: 'border-[#005ba6]' 
    },
    'pccomponentes': { 
      bg: 'bg-[#FF6000]', 
      text: 'text-white', 
      border: 'border-[#cc4d00]' 
    },
    'samsung': { 
      bg: 'bg-[#1428A0]', 
      text: 'text-white', 
      border: 'border-[#102080]' 
    },
    'apple': { 
      bg: isDarkMode ? 'bg-white/20' : 'bg-slate-200', 
      text: isDarkMode ? 'text-white' : 'text-slate-900', 
      border: isDarkMode ? 'border-white/10' : 'border-slate-300' 
    },
    'nike': { 
      bg: isDarkMode ? 'bg-white' : 'bg-black', 
      text: isDarkMode ? 'text-black' : 'text-white', 
      border: isDarkMode ? 'border-white' : 'border-black' 
    },
    'adidas': { 
      bg: isDarkMode ? 'bg-white' : 'bg-black', 
      text: isDarkMode ? 'text-black' : 'text-white', 
      border: isDarkMode ? 'border-white' : 'border-black' 
    },
    'shein': { 
      bg: 'bg-black', 
      text: 'text-white', 
      border: 'border-black' 
    }
  };

  if (store.includes('amazon')) return themes['amazon'];
  if (store.includes('mercado libre') || store.includes('mercadolibre')) return themes['mercado libre'];
  if (store.includes('tiktok')) return themes['tiktok'];
  if (store.includes('aliexpress')) return themes['aliexpress'];
  if (store.includes('miravia')) return themes['miravia'];
  if (store.includes('temu')) return themes['temu'];
  if (store.includes('walmart')) return themes['walmart'];
  if (store.includes('pccomponentes')) return themes['pccomponentes'];
  if (store.includes('samsung')) return themes['samsung'];
  if (store.includes('apple')) return themes['apple'];
  if (store.includes('nike')) return themes['nike'];
  if (store.includes('adidas')) return themes['adidas'];
  if (store.includes('shein')) return themes['shein'];

  return { 
    bg: isDarkMode ? 'bg-white/10' : 'bg-white/90', 
    text: isDarkMode ? 'text-white' : 'text-[#111727]', 
    border: isDarkMode ? 'border-white/10' : 'border-slate-200' 
  };
}

/**
 * Returns inline style object for store branding from official store data.
 * Use this instead of Tailwind classes for dynamically generated colors.
 */
export function getStoreInlineStyles(
  storeName: string | null | undefined,
  officialStores: any[]
): { backgroundColor: string; color: string; borderColor: string } | null {
  const store = (storeName || '').toLowerCase().trim();
  
  const match = officialStores.find(s => {
    const sName = (s.name || '').toLowerCase();
    const sSlug = (s.slug || '').toLowerCase();
    return store.includes(sName) || store.includes(sSlug) || sName.includes(store);
  });
  
  if (match) {
    return {
      backgroundColor: match.color_primary,
      color: match.color_text,
      borderColor: match.color_border || match.color_primary,
    };
  }
  
  return null;
}

