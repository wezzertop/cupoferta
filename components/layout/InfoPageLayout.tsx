'use client';
import { useUIStore } from '@/lib/store';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { MobileNavbar } from '@/components/layout/MobileNavbar';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface InfoPageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  category?: string;
}

export function InfoPageLayout({ title, subtitle, children, category }: InfoPageLayoutProps) {
  const { isDarkMode } = useUIStore();

  const tc = {
    page: isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-slate-900',
    header: isDarkMode ? 'bg-gradient-to-b from-[#111] to-transparent' : 'bg-gradient-to-b from-slate-50 to-transparent',
    muted: isDarkMode ? 'text-gray-500' : 'text-slate-500',
    card: isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100 shadow-sm',
  };

  return (
    <div className={`relative min-h-screen ${tc.page}`}>
      <Header />
      <Sidebar />

      <main className="w-full max-w-4xl mx-auto px-6 pt-[120px] md:pt-[160px] pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Back Link */}
        <Link href="/" className={`inline-flex items-center gap-2 mb-8 text-xs font-heading font-black uppercase tracking-widest transition-colors hover:text-[#009ea8] ${tc.muted}`}>
           <ChevronLeft className="w-4 h-4" /> Volver al Inicio
        </Link>

        {/* Hero Section */}
        <header className="mb-16">
           {category && <span className="text-[10px] font-heading font-black uppercase tracking-[0.3em] text-[#009ea8] mb-4 block">{category}</span>}
           <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-6 leading-tight">{title}</h1>
           {subtitle && <p className={`text-lg md:text-xl font-body opacity-60 leading-relaxed ${tc.muted}`}>{subtitle}</p>}
        </header>

        {/* Content Area */}
        <div className={`p-8 md:p-12 rounded-[2.5rem] border ${tc.card} font-body leading-relaxed prose prose-lg ${isDarkMode ? 'prose-invert' : ''} max-w-none`}>
           {children}
        </div>
      </main>

      <Footer />
      <MobileNavbar />

      <style jsx global>{`
        .prose h2 { 
           font-family: var(--font-heading); 
           font-weight: 900; 
           letter-spacing: -0.02em; 
           margin-top: 3rem;
           margin-bottom: 1.5rem;
           font-size: 1.5rem;
        }
        .prose p { margin-bottom: 1.5rem; color: inherit; opacity: 0.8; }
        .prose ul { margin-bottom: 2rem; list-style-type: disc; padding-left: 1.5rem; }
        .prose li { margin-bottom: 0.5rem; }
        .prose strong { color: #009ea8; font-weight: 800; }
      `}</style>
    </div>
  );
}
