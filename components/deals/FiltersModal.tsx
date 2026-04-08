'use client';
import { useUIStore } from '@/lib/store';
import { X, SlidersHorizontal, Sparkles, Tag, ShoppingBag, Flame, DollarSign, RotateCcw, Search, Zap, Star } from 'lucide-react';
import { useState } from 'react';

export function FiltersModal() {
  const { filtersModalOpen, setFiltersModalOpen, isDarkMode, setActiveFilter, setCategoryFilter } = useUIStore();
  const [tempMin, setTempMin] = useState(0);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);

  if (!filtersModalOpen) return null;

  const tc = {
    overlay: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity animate-in fade-in duration-300',
    panel: `fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-[600px] max-h-[90vh] rounded-3xl border shadow-2xl overflow-hidden flex flex-col z-[101] animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-black/80 backdrop-blur-md border-white/10' : 'bg-white/90 backdrop-blur-md border-slate-200'}`,
    section: `px-6 py-5 border-b last:border-b-0 ${isDarkMode ? 'border-[#1a1a1a]' : 'border-slate-100'}`,
    label: `text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`,
    chip: (active: boolean) => `px-4 py-2 rounded-xl text-[13px] font-heading font-bold transition-all border ${active ? 'bg-[#009ea8] border-[#009ea8] text-white shadow-lg shadow-[#009ea8]/20' : isDarkMode ? 'bg-[#1a1a1a] border-[#262626] text-gray-400 hover:border-[#009ea8]/40 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#009ea8]/40 hover:text-slate-900'}`,
    input: `w-full bg-transparent px-4 py-2.5 rounded-xl border text-[14px] font-body transition-all outline-none ${isDarkMode ? 'border-[#262626] focus:border-[#009ea8] text-white' : 'border-slate-200 focus:border-[#009ea8] text-slate-900'}`,
  };

  const categories = ['Electrónica', 'Videojuegos', 'Moda', 'Hogar', 'Supermercado', 'Viajes', 'Restaurantes'];
  const stores = ['Amazon', 'AliExpress', 'Mercado Libre', 'Walmart', 'Nike', 'Steam', 'Samsung'];

  const handleApply = () => {
    if (selectedCategory) {
      setCategoryFilter(selectedCategory);
      setActiveFilter('category');
    } else {
      setActiveFilter('home');
      setCategoryFilter(null);
    }
    setFiltersModalOpen(false);
  };

  const toggleStore = (store: string) => {
    setSelectedStores(prev => prev.includes(store) ? prev.filter(s => s !== store) : [...prev, store]);
  };

  return (
    <>
      <div className={tc.overlay} onClick={() => setFiltersModalOpen(false)} />
      
      <div className={tc.panel}>
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${isDarkMode ? 'border-[#1a1a1a]' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-[#009ea8]/10 flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5 text-[#009ea8]" />
             </div>
             <div>
                <h2 className={`font-heading font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Filtro Inteligente</h2>
                <p className={`text-[11px] font-body ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>Personaliza tu feed a tu medida</p>
             </div>
          </div>
          <button 
            onClick={() => setFiltersModalOpen(false)}
            className={`p-2 rounded-xl transition-all active:scale-95 ${isDarkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-slate-100 text-slate-400'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
          
          {/* Smart Prompt */}
          <div className={tc.section}>
            <p className={tc.label}><Sparkles className="w-3 h-3" /> Búsqueda Asistida</p>
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Ej: 'Ofertas de PS5 menos de $400 con envío gratis'..."
                className={`${tc.input} pl-11 h-12 pr-4 bg-[#009ea8]/5 border-[#009ea8]/20 focus:border-[#009ea8] focus:bg-[#009ea8]/10`}
              />
              <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#009ea8] animate-pulse" />
            </div>
          </div>

          {/* Categories */}
          <div className={tc.section}>
            <p className={tc.label}><Tag className="w-3 h-3" /> Categorías</p>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setSelectedCategory(null)}
                className={tc.chip(!selectedCategory)}
              >
                Todas
              </button>
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)}
                  className={tc.chip(selectedCategory === cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className={tc.section}>
            <p className={tc.label}><DollarSign className="w-3 h-3" /> Rango de Precio</p>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase ml-2">Mínimo</span>
                <input 
                  type="number" 
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="0"
                  className={tc.input} 
                />
              </div>
              <div className="w-3 h-px bg-slate-300 dark:bg-gray-700 mt-6" />
              <div className="flex-1 space-y-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase ml-2">Máximo</span>
                <input 
                  type="number" 
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="Sin límite"
                  className={tc.input} 
                />
              </div>
            </div>
          </div>

          {/* Stores */}
          <div className={tc.section}>
            <p className={tc.label}><ShoppingBag className="w-3 h-3" /> Tiendas populares</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {stores.map(store => (
                <button 
                  key={store}
                  onClick={() => toggleStore(store)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-left group ${selectedStores.includes(store) ? 'bg-[#009ea8]/10 border-[#009ea8] text-[#009ea8]' : isDarkMode ? 'bg-[#111] border-[#262626] text-gray-400 hover:border-gray-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}`}
                >
                  <div className={`w-2 h-2 rounded-full border transition-all ${selectedStores.includes(store) ? 'bg-[#009ea8] border-[#009ea8]' : 'bg-transparent border-gray-500'}`} />
                  <span className="text-[13px] font-heading font-bold">{store}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Temperature */}
          <div className={tc.section}>
             <div className="flex items-center justify-between mb-4">
                <p className={tc.label}><Flame className="w-3 h-3" /> Temperatura Mínima</p>
                <span className="px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-500 font-numbers font-black text-sm">{tempMin}°+</span>
             </div>
             <input 
               type="range" 
               min="0" 
               max="1000" 
               step="50"
               value={tempMin}
               onChange={(e) => setTempMin(Number(e.target.value))}
               className="w-full accent-[#009ea8] h-1.5 bg-gray-200 dark:bg-[#262626] rounded-full appearance-none cursor-pointer"
             />
             <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
               <span>Frío</span>
               <span>Caliente</span>
               <span>¡En Llamas! 🔥</span>
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className={`px-6 py-5 flex items-center gap-3 border-t shadow-[0_-10px_30px_rgba(0,0,0,0.05)] ${isDarkMode ? 'border-[#1a1a1a] bg-[#141414]' : 'border-slate-100 bg-slate-50'}`}>
          <button 
            onClick={() => {
              setTempMin(0);
              setPriceMin('');
              setPriceMax('');
              setSelectedCategory(null);
              setSelectedStores([]);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-heading font-bold text-[13px] transition-all active:scale-95 ${isDarkMode ? 'bg-[#222] text-gray-400 hover:bg-[#333]' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
          >
            <RotateCcw className="w-4 h-4" /> Limpiar
          </button>
          <button 
            onClick={handleApply}
            className="flex-[2] flex items-center justify-center gap-2 py-3 bg-[#009ea8] text-white rounded-2xl font-heading font-black text-[13px] shadow-xl shadow-[#009ea8]/20 hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            Ver resultados <Zap className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </>
  );
}
