'use client';
import { useEffect } from 'react';
import { useUIStore } from '@/lib/store';

export function Providers({ children }: { children: React.ReactNode }) {
  const isDarkMode = useUIStore((state) => state.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('bg-[#0a0a0a]', 'text-gray-200');
      document.body.classList.remove('bg-[#f0f2f5]', 'text-slate-800');
    } else {
      document.body.classList.add('bg-[#f0f2f5]', 'text-slate-800');
      document.body.classList.remove('bg-[#0a0a0a]', 'text-gray-200');
    }
  }, [isDarkMode]);

  return <>{children}</>;
}
