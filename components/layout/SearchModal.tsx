'use client';
import { useUIStore } from '@/lib/store';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Search, Flame, Tag, ArrowUpRight, Loader2, Clock, TrendingUp, Sparkles, ChevronLeft } from 'lucide-react';
import { getDealImages } from '@/lib/utils';


const SUGGESTED_TAGS = ['Gaming', 'Electrónica', 'Amazon', 'Ropa', 'Hogar', 'Software', 'PC', 'Móviles'];

export function SearchModal() {
  const { searchModalOpen, setSearchModalOpen, isDarkMode, setSelectedDeal, setDrawerMode } = useUIStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Load recent searches from localStorage
  useEffect(() => {
    if (searchModalOpen) {
      try {
        const stored = JSON.parse(localStorage.getItem('cupoferta_recent_searches') || '[]');
        setRecentSearches(stored.slice(0, 5));
      } catch {}
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }
  }, [searchModalOpen]);

  const saveRecentSearch = (term: string) => {
    try {
      const existing = JSON.parse(localStorage.getItem('cupoferta_recent_searches') || '[]');
      const updated = [term, ...existing.filter((x: string) => x !== term)].slice(0, 5);
      localStorage.setItem('cupoferta_recent_searches', JSON.stringify(updated));
      setRecentSearches(updated);
    } catch {}
  };

  const doSearch = async (term: string) => {
    if (!term.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    saveRecentSearch(term.trim());

    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*, profiles!deals_user_id_fkey(username, avatar_url)')
        .or(`title.ilike.%${term}%,description.ilike.%${term}%,store.ilike.%${term}%,category.ilike.%${term}%`)
        .order('temp', { ascending: false })
        .limit(12);

      if (!error && data) setResults(data);
      else setResults([]);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); setHasSearched(false); return; }
    const t = setTimeout(() => doSearch(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const openDeal = (deal: any) => {
    setSelectedDeal(deal);
    setDrawerMode('details');
    setSearchModalOpen(false);
  };

  if (!searchModalOpen) return null;

  const tc = {
    overlay: 'bg-black/70 backdrop-blur-md',
    modal: isDarkMode ? 'bg-black/80 backdrop-blur-md border border-white/10 text-white' : 'bg-white/90 backdrop-blur-md border border-slate-200 text-slate-900',
    input: isDarkMode ? 'bg-[#141414] text-white placeholder:text-gray-500' : 'bg-slate-50 text-slate-900 placeholder:text-slate-400',
    result: isDarkMode ? 'hover:bg-[#1a1a1a] border-[#1f1f1f]' : 'hover:bg-slate-50 border-slate-100',
    tag: isDarkMode ? 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:border-[#009ea8] hover:text-[#009ea8]' : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-[#009ea8] hover:text-[#009ea8]',
    muted: isDarkMode ? 'text-gray-500' : 'text-slate-400',
  };

  const formatPrice = (p: number) => `$${p.toLocaleString()}`;
  const getImageSrc = (url: string) => getDealImages(url)[0];

  return (
    <div className={`fixed inset-0 z-[110] flex items-start justify-center pt-[4vh] sm:pt-[8vh] px-4 ${tc.overlay}`} onClick={() => setSearchModalOpen(false)}>
      <div className={`relative w-full max-w-2xl rounded-2xl h-auto max-h-[85vh] shadow-2xl overflow-hidden animate-in slide-in-from-top-4 fade-in duration-200 ${tc.modal}`} onClick={e => e.stopPropagation()}>



        {/* Input principal */}
        <div className={`flex items-center gap-3 px-5 py-4 border-b transition-all ${isDarkMode ? 'border-[#1f1f1f]' : 'border-slate-100'}`}>
          <button 
            onClick={() => setSearchModalOpen(false)}
            className="sm:hidden -ml-1 p-2 rounded-xl hover:bg-white/5 active:scale-90 transition-all text-[#009ea8]"
            aria-label="Cerrar búsqueda"
          >
            <ChevronLeft className="w-6 h-6" /> 
          </button>
          
          <Search className={`w-5 h-5 shrink-0 ${isLoading ? 'text-[#009ea8] animate-pulse' : tc.muted}`} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar ofertas, tiendas, categorías..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && setSearchModalOpen(false)}
            className={`flex-1 bg-transparent border-none outline-none font-body text-[17px] ${tc.input}`}
          />

          {query && <button onClick={() => { setQuery(''); setResults([]); setHasSearched(false); }} className={`${tc.muted} hover:text-red-400 transition-colors`}><X className="w-4 h-4" /></button>}
          <kbd className={`hidden sm:flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border ${isDarkMode ? 'border-[#2a2a2a] text-gray-600' : 'border-slate-200 text-slate-400'}`}>ESC</kbd>
        </div>

        {/* Contenido dinámico */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Estado vacío: Tags sugeridas + recientes */}
          {!query && (
            <div className="p-5 space-y-5">
              {recentSearches.length > 0 && (
                <div>
                  <div className={`flex items-center gap-2 mb-3 text-[11px] font-heading font-bold uppercase tracking-wider ${tc.muted}`}>
                    <Clock className="w-3.5 h-3.5" /> Búsquedas recientes
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map(s => (
                      <button key={s} onClick={() => setQuery(s)} className={`px-3 py-1.5 rounded-lg border text-sm font-body transition-all ${tc.tag}`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className={`flex items-center gap-2 mb-3 text-[11px] font-heading font-bold uppercase tracking-wider ${tc.muted}`}>
                  <TrendingUp className="w-3.5 h-3.5" /> Categorías populares
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TAGS.map(tag => (
                    <button key={tag} onClick={() => setQuery(tag)} className={`px-3 py-1.5 rounded-lg border text-sm font-body transition-all ${tc.tag}`}>
                      <span className="mr-1.5">🏷️</span>{tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`text-center py-6 ${tc.muted}`}>
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm font-body">Escribe para encontrar los mejores chollos</p>
              </div>
            </div>
          )}

          {/* Cargando */}
          {isLoading && (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-[#009ea8]" />
              <span className={`font-body text-sm ${tc.muted}`}>Buscando chollos...</span>
            </div>
          )}

          {/* Sin resultados */}
          {hasSearched && !isLoading && results.length === 0 && (
            <div className="py-12 text-center">
              <p className={`font-heading font-bold text-lg mb-1`}>Sin resultados para "{query}"</p>
              <p className={`text-sm font-body ${tc.muted}`}>Intenta con otra tienda, categoría o producto.</p>
            </div>
          )}

          {/* Resultados */}
          {results.length > 0 && !isLoading && (
            <div className="p-2">
              <div className={`px-3 py-2 text-[11px] font-heading font-bold uppercase tracking-wider ${tc.muted}`}>
                {results.length} resultados para "{query}"
              </div>
              {results.map(deal => {
                const discount = deal.old_price ? Math.round((1 - deal.price / deal.old_price) * 100) : null;
                return (
                  <button key={deal.id} onClick={() => openDeal(deal)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border mb-1 transition-all text-left group ${tc.result}`}>
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-white border border-slate-100 flex items-center justify-center p-1">
                      <img src={getImageSrc(deal.image_url)} alt={deal.title} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-heading font-bold uppercase text-[#009ea8] bg-[#009ea8]/10 px-1.5 py-0.5 rounded">{deal.store}</span>
                        <span className={`text-[10px] font-body ${tc.muted}`}>{deal.category}</span>
                      </div>
                      <p className="font-heading font-bold text-[14px] leading-snug line-clamp-1">{deal.title}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-numbers font-black text-[15px]">{formatPrice(deal.price)}</div>
                      {discount && discount > 0 && (
                        <div className="text-[11px] font-bold text-green-500">-{discount}%</div>
                      )}
                      <div className={`text-[10px] flex items-center gap-1 ${tc.muted}`}>
                        <Flame className="w-3 h-3 text-orange-400" /> {deal.temp}°
                      </div>
                    </div>
                    <ArrowUpRight className={`w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${tc.muted}`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer con shortcut tip */}
        <div className={`px-5 py-3 border-t flex items-center justify-between ${isDarkMode ? 'border-[#1f1f1f]' : 'border-slate-100'}`}>
          <div className={`flex items-center gap-3 text-[11px] font-body ${tc.muted}`}>
            <span>↵ para abrir</span>
            <span>↑↓ navegar</span>
            <span>ESC cerrar</span>
          </div>
          <div className={`text-[11px] font-heading font-bold text-[#009ea8]`}>CupOferta Search</div>
        </div>
      </div>
    </div>
  );
}
