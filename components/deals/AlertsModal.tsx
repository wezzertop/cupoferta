'use client';
import { useUIStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Search, BellRing, DollarSign, Trash2, Plus, Loader2 } from 'lucide-react';

export function AlertsModal() {
  const { isDarkMode, user, setAuthModalOpen } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [keyword, setKeyword] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const supabase = createClient();

  useEffect(() => {
    // Escuchamos un evento personalizado para abrir el modal desde cualquier lugar
    const handleOpen = () => {
       if (!user) return setAuthModalOpen(true);
       setIsOpen(true);
       fetchAlerts();
    };
    window.addEventListener('openAlertsModal', handleOpen);
    return () => window.removeEventListener('openAlertsModal', handleOpen);
  }, [user]);

  const fetchAlerts = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('keyword_alerts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setAlerts(data);
    setLoading(false);
  };

  const handleAddAlert = async () => {
    if (!keyword.trim() || !user) return;
    setIsSubmitting(true);
    const price = maxPrice ? parseFloat(maxPrice) : null;
    
    const { data, error } = await supabase.from('keyword_alerts').insert({
      user_id: user.id,
      keyword: keyword.trim(),
      max_price: price
    }).select().single();

    if (data) {
      setAlerts([data, ...alerts]);
      setKeyword('');
      setMaxPrice('');
    }
    setIsSubmitting(false);
  };

  const handleDeleteAlert = async (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
    await supabase.from('keyword_alerts').delete().eq('id', id);
  };

  const handleToggleState = async (id: string, currentState: boolean) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, is_active: !currentState } : a));
    await supabase.from('keyword_alerts').update({ is_active: !currentState }).eq('id', id);
  };

  if (!isOpen) return null;

  const themeClasses = {
    overlay: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4',
    modal: isDarkMode ? 'bg-[#141414] border-[#333]' : 'bg-white border-slate-200',
    textStrong: isDarkMode ? 'text-white' : 'text-slate-900',
    textMuted: isDarkMode ? 'text-gray-400' : 'text-slate-500',
    inputBg: isDarkMode ? 'bg-[#1a1a1a] border-[#333]' : 'bg-slate-50 border-slate-200',
    card: isDarkMode ? 'bg-[#1a1a1a] border-[#333]' : 'bg-white border-slate-200',
  };

  return (
    <div className={themeClasses.overlay} onClick={() => setIsOpen(false)}>
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${themeClasses.modal}`} onClick={e => e.stopPropagation()}>
        
        <div className="flex items-center justify-between p-5 border-b border-inherit">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#009ea8]/10 flex items-center justify-center">
               <BellRing className="w-4 h-4 text-[#009ea8]" />
             </div>
             <h2 className={`font-heading font-black text-lg ${themeClasses.textStrong}`}>Alertas de Chollos</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-6">
           <div className={`p-4 rounded-xl border ${themeClasses.inputBg}`}>
             <h3 className={`font-heading font-bold text-sm mb-3 ${themeClasses.textStrong}`}>Crear Nueva Alerta</h3>
             <div className="flex flex-col gap-3">
                <div className="flex items-center bg-transparent border border-inherit rounded-lg px-3 py-2 bg-inherit">
                  <Search className="w-4 h-4 opacity-50 mr-2" />
                  <input type="text" placeholder="Ej: PlayStation 5, iPhone..." value={keyword} onChange={e => setKeyword(e.target.value)} className="bg-transparent outline-none flex-1 font-body text-sm" />
                </div>
                <div className="flex gap-2">
                   <div className="flex-1 flex items-center bg-transparent border border-inherit rounded-lg px-3 py-2 bg-inherit">
                     <DollarSign className="w-4 h-4 opacity-50 mr-2" />
                     <input type="number" placeholder="Precio máx (Opcional)" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="bg-transparent outline-none flex-1 font-numbers text-sm" />
                   </div>
                   <button onClick={handleAddAlert} disabled={!keyword.trim() || isSubmitting} className="bg-[#009ea8] text-white px-4 rounded-lg font-heading font-bold text-sm flex items-center gap-2 disabled:opacity-50">
                     {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4" />} Añadir
                   </button>
                </div>
                <p className={`text-[11px] font-body ${themeClasses.textMuted}`}>Te notificaremos cuando se publique una oferta que coincida.</p>
             </div>
           </div>

           <div>
              <h3 className={`font-heading font-bold text-sm mb-3 ${themeClasses.textStrong}`}>Tus Alertas Activas ({alerts.length})</h3>
              {loading ? (
                 <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-[#009ea8]"/></div>
              ) : alerts.length === 0 ? (
                 <div className={`text-center py-6 border border-dashed rounded-xl ${themeClasses.card} ${themeClasses.textMuted}`}>
                    <span className="text-[13px] font-body">No tienes alertas configuradas.</span>
                 </div>
              ) : (
                 <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar">
                    {alerts.map(alert => (
                       <div key={alert.id} className={`flex items-center justify-between p-3 rounded-xl border ${themeClasses.card} ${!alert.is_active ? 'opacity-60' : ''}`}>
                          <div>
                            <p className={`font-heading font-bold text-[14px] ${themeClasses.textStrong}`}>"{alert.keyword}"</p>
                            {alert.max_price && <p className={`font-numbers text-[12px] ${themeClasses.textMuted}`}>Máximo: ${alert.max_price}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleToggleState(alert.id, alert.is_active)} className={`text-[11px] font-heading font-bold px-2 py-1 rounded transition-colors ${alert.is_active ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                               {alert.is_active ? 'Activa' : 'Pausada'}
                            </button>
                            <button onClick={() => handleDeleteAlert(alert.id)} className={`p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors`}>
                               <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
}
