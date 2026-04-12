'use client';

import { useState, useEffect } from 'react';
import { X, ShieldCheck, Check, Info } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { getCookie, setCookie } from '@/lib/utils';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const { isDarkMode, setHasConsent } = useUIStore();

  useEffect(() => {
    const consent = getCookie('cookie_consent');
    if (consent === 'true') setHasConsent(true);
    
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setCookie('cookie_consent', 'true', 365);
    setHasConsent(true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    setCookie('cookie_consent', 'false', 30);
    setHasConsent(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[400px] z-[100] animate-in fade-in slide-in-from-bottom-10 duration-700 ease-out">
      <div className={`
        relative p-6 rounded-3xl border shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden
        ${isDarkMode 
          ? 'bg-black/80 backdrop-blur-xl border-white/10 text-white' 
          : 'bg-white/90 backdrop-blur-xl border-slate-200 text-slate-900'}
      `}>
        {/* Decorative Gradient Overlay */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#009ea8]/10 blur-[50px] pointer-events-none" />
        
        <div className="relative flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#009ea8]/10 flex items-center justify-center text-[#009ea8]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-black text-lg tracking-tight">Privacidad y Cookies</h3>
            </div>
            <button 
              onClick={() => setIsVisible(false)}
              className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className={`text-sm font-body leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
            En <span className="text-[#009ea8] font-bold">CupOferta</span> usamos cookies para mejorar tu experiencia, mostrarte las ofertas más relevantes según tus intereses y asegurar que no te pierdas ningún chollo reciente.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleAccept}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#009ea8] text-white font-heading font-black text-sm shadow-xl shadow-[#009ea8]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Check className="w-5 h-5" /> Aceptar Recomendaciones
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleDecline}
                className={`flex-1 py-3 rounded-2xl font-heading font-bold text-[13px] transition-all border ${
                  isDarkMode 
                    ? 'border-white/5 bg-white/5 text-gray-400 hover:bg-white/10' 
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                Solo Necesarias
              </button>
              <button
                className={`flex items-center justify-center px-4 rounded-2xl font-heading font-bold text-[13px] transition-all border ${
                  isDarkMode 
                    ? 'border-white/5 bg-white/5 text-gray-400 hover:bg-white/10' 
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
                title="Más Información"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

