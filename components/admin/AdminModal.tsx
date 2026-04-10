'use client';
import { useUIStore } from '@/lib/store';
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  X, ShieldAlert, Trash2, UserMinus, Search, Loader2, CheckCircle, 
  AlertTriangle, Check, Ban, Send, Settings, Eye, ExternalLink, 
  RefreshCw, History, Flag, LayoutGrid, ListFilter
} from 'lucide-react';
import { getDealImages, formatPrice, getCurrencyFlag } from '@/lib/utils';

// Icono de X (Twitter) — SVG inline
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.411-.169.562-.338.751-.5.768-.36.035-.632-.235-.981-.462-.546-.356-.856-.577-1.387-.925-.612-.403-.216-.625.134-.985.092-.094 1.688-1.548 1.718-1.678.004-.017.007-.08-.041-.123-.048-.043-.118-.028-.169-.017-.071.015-1.21.758-3.414 2.227-.323.222-.616.331-.878.324-.29-.007-.847-.164-1.261-.298-.508-.165-.911-.252-.876-.532.018-.146.22-.295.604-.447 2.365-1.021 3.941-1.696 4.729-2.025 2.251-.937 2.718-1.099 3.024-1.104.067-.001.218.016.315.095.082.066.105.156.113.226.012.102.008.204-.002.306z" />
  </svg>
);

// Genera tweet con Web Intent — sin API, abre X directamente
function shareOnX(deal: any) {
    const platformUrl = `https://cupoferta.com/deal/${deal.id}`;
    const flag = getCurrencyFlag(deal.currency);
    const price = deal.price ? `${flag} ${formatPrice(deal.price, deal.currency)}` : '';
    const oldPrice = deal.old_price ? ` (antes ${formatPrice(deal.old_price, deal.currency)})` : '';
    const discount = deal.old_price && deal.price
      ? ` -${Math.round((1 - deal.price / deal.old_price) * 100)}%`
      : '';
  
  const text = [
    `🔥 ${deal.title}`,
    ``,
    `💰 ${price}${oldPrice}${discount}`,
    `🏪 ${deal.store || 'Oferta'}`,
    ``,
    `👉 Ver en CupOferta:`,
  ].join('\n');

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(platformUrl)}&hashtags=chollos,ofertas,CupOferta`;
  window.open(tweetUrl, '_blank', 'width=600,height=550,scrollbars=yes');
}

type Tab = 'moderation' | 'deals' | 'users' | 'telegram' | 'history' | 'reports';

export function AdminModal() {
  const { adminModalOpen, setAdminModalOpen, isDarkMode, user } = useUIStore();
  const [deals, setDeals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [reportPreviews, setReportPreviews] = useState<Record<string, any>>({});
  const [stats, setStats] = useState<any>({ pending: 0, reports: 0, users: 0, deals: 0 });
  const [telegramConfig, setTelegramConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [warningTarget, setWarningTarget] = useState<{ id: string; username: string } | null>(null);
  const [warningMsg, setWarningMsg] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('moderation');
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [failedTelegrams, setFailedTelegrams] = useState<string[]>([]);
  const [debugError, setDebugError] = useState<any>(null);
  
  const [dealPage, setDealPage] = useState(0);
  const [userPage, setUserPage] = useState(0);
  const [hasMoreDeals, setHasMoreDeals] = useState(true);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const ADMIN_PAGE_SIZE = 20;
  
  const supabase = createClient();

  // ... (keeping tc)
  const tc = useMemo(() => ({
    overlay: 'bg-black/90 backdrop-blur-md',
    panel: isDarkMode 
      ? 'bg-black/80 backdrop-blur-md border-white/10 text-white shadow-2xl' 
      : 'bg-white/90 backdrop-blur-md border-slate-200 text-slate-900 shadow-2xl',
    header: isDarkMode ? 'bg-[#111]/80 border-white/5' : 'bg-slate-50 border-slate-200',
    item: isDarkMode ? 'bg-[#111] border-white/5 hover:border-[#009ea8]/30' : 'bg-white border-slate-100 hover:border-slate-300',
    tabActive: 'bg-[#009ea8] text-white shadow-lg shadow-[#009ea8]/20',
    tabInactive: isDarkMode ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100',
    input: isDarkMode ? 'bg-black/50 border-white/10 text-white' : 'bg-white border-slate-200',
    muted: isDarkMode ? 'text-gray-500' : 'text-slate-400',
  }), [isDarkMode]);

  useEffect(() => {
    if (!adminModalOpen) return;
    setDealPage(0);
    setUserPage(0);
    setHasMoreDeals(true);
    setHasMoreUsers(true);
    fetchData(true);
  }, [adminModalOpen, tab]);

  async function fetchData(isInitial: boolean = false) {
    if (isInitial) setIsLoading(true);
    setDebugError(null);
    try {
      // Siempre actualizar badges/stats para que reflejen el estado real
      const [pendingCount, totalDeals, totalUsers, pendingReports] = await Promise.all([
        supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('deals').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);
      setStats({ pending: pendingCount.count || 0, reports: pendingReports.count || 0, users: totalUsers.count || 0, deals: totalDeals.count || 0 });

      if (tab === 'moderation') {
        const { data, error } = await supabase.from('deals').select('*, profiles!deals_user_id_fkey(username)').eq('status', 'pending').order('created_at', { ascending: false });
        if (error) setDebugError(error);
        setDeals(data || []);
      } else if (tab === 'deals') {
        const page = isInitial ? 0 : dealPage + 1;
        const from = page * ADMIN_PAGE_SIZE;
        const to = from + ADMIN_PAGE_SIZE - 1;
        
        const { data, error } = await supabase.from('deals').select('*, profiles!deals_user_id_fkey(username)').neq('status', 'pending').order('created_at', { ascending: false }).range(from, to);
        if (error && isInitial) setDebugError(error);
        
        if (isInitial) setDeals(data || []);
        else setDeals(prev => [...prev, ...(data || [])]);
        
        setDealPage(page);
        setHasMoreDeals((data || []).length === ADMIN_PAGE_SIZE);
      } else if (tab === 'users') {
        const page = isInitial ? 0 : userPage + 1;
        const from = page * ADMIN_PAGE_SIZE;
        const to = from + ADMIN_PAGE_SIZE - 1;

        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).range(from, to);
        
        if (isInitial) setUsers(data || []);
        else setUsers(prev => [...prev, ...(data || [])]);
        
        setUserPage(page);
        setHasMoreUsers((data || []).length === ADMIN_PAGE_SIZE);
      } else if (tab === 'reports') {
        const { data: reportsData } = await supabase.from('reports').select('*, reporter:profiles!reporter_id(username)').eq('status', 'pending').order('created_at', { ascending: false });
        setReports(reportsData || []);
        if (reportsData) {
           const previewsData: Record<string, any> = { ...reportPreviews };
           for (const r of reportsData) {
              if (previewsData[r.target_id]) continue;
              if (r.target_type === 'deal') {
                 const { data: d } = await supabase.from('deals').select('title, price, image_url').eq('id', r.target_id).single();
                 if (d) previewsData[r.target_id] = { title: d.title, info: `$${d.price}`, img: getDealImages(d.image_url)[0] };
              } else if (r.target_type === 'comment') {
                 const { data: c } = await supabase.from('comments').select('content').eq('id', r.target_id).single();
                 if (c) previewsData[r.target_id] = { title: c.content, info: 'Comentario' };
              } else if (r.target_type === 'user') {
                 const { data: p } = await supabase.from('profiles').select('username, avatar_url').eq('id', r.target_id).single();
                 if (p) previewsData[r.target_id] = { title: `@${p.username}`, img: p.avatar_url };
              }
           }
           setReportPreviews(previewsData);
        }
      } else if (tab === 'telegram') {
        const { data } = await supabase.from('telegram_config').select('*').limit(1).maybeSingle();
        setTelegramConfig(data || { bot_token: '', channel_id: '', message_template: '', is_enabled: true });
      } else if (tab === 'history') {
        const { data: logsData } = await supabase.from('moderation_logs').select('*, admin:profiles!admin_id(username)').order('created_at', { ascending: false }).limit(100);
        setLogs(logsData || []);
      }
    } catch (error: any) { 
       console.error(error); 
       setDebugError({ message: error.message || 'Error try-catch' });
    }
    setIsLoading(false);
  }

  // Handlers simplified for readability
  const handleUserAction = async (id: string, action: string) => {
    setIsActionLoading(true);
    const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: id, action }) });
    if ((await res.json()).success) fetchData();
    setIsActionLoading(false);
  };

  const handleReportAction = async (reportId: string, action: string) => {
    setIsActionLoading(true);
    const res = await fetch('/api/admin/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reportId, action }) });
    if ((await res.json()).success) { setReports(prev => prev.filter(r => r.id !== reportId)); fetchData(); }
    setIsActionLoading(false);
  };

  const handleModerationAction = async (ids: string[], action: string) => {
    setIsActionLoading(true);
    
    // Procesar en bloques pequeños para evitar saturar el servidor y asegurar entrega en Telegram
    const CHUNK_SIZE = 5;
    for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
      const chunk = ids.slice(i, i + CHUNK_SIZE);
      try {
        const res = await fetch('/api/admin/moderation', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ dealIds: chunk, action }) 
        });
        const data = await res.json();
        if (data.success) {
          // Actualizar estado local progresivamente
          setDeals(prev => prev.filter(d => !chunk.includes(d.id)));
        } else {
          console.error('Error en lote:', data.error);
          setFailedTelegrams(prev => [...prev, ...chunk]);
          alert(`⚠️ Error en un lote: ${data.message || 'Se marcarán para reintento'}`);
        }
        
        // Pausa mayor entre lotes para respetar los límites de Telegram a largo plazo (800+ mensajes)
        if (ids.length > CHUNK_SIZE) {
          await new Promise(r => setTimeout(r, 2000));
        }
      } catch (err) {
        console.error('Error de red en moderación:', err);
        setFailedTelegrams(prev => [...prev, ...chunk]);
      }
    }

    setSelectedDeals([]);
    fetchData();
    setIsActionLoading(false);
  };

  const handlePushTelegram = async (dealId: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/admin/telegram/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Enviado a Telegram con éxito');
      } else {
        alert('❌ Error al enviar a Telegram: ' + (data.error || 'Error desconocido'));
      }
    } catch (e: any) {
      alert('❌ Error: ' + e.message);
    }
    setIsActionLoading(false);
  };

  const handleSendWarning = async () => {
    if (!warningTarget || !warningMsg) return;
    setIsActionLoading(true);
    const { error } = await supabase.from('notifications').insert({ user_id: warningTarget.id, actor_id: user?.id, type: 'moderation_warning', reference_id: warningTarget.id, content: `AVISO: ${warningMsg}` });
    if (!error) { setWarningTarget(null); setWarningMsg(''); }
    setIsActionLoading(false);
  };

  const saveTelegramConfig = async () => {
    setIsActionLoading(true);
    const { id, ...configData } = telegramConfig;
    // Forzar is_enabled a true para que el sistema siempre pueda leer la config
    const dataToSave = { ...configData, is_enabled: true };
    const { error } = id 
      ? await supabase.from('telegram_config').update(dataToSave).eq('id', id) 
      : await supabase.from('telegram_config').insert([dataToSave]);
    setIsActionLoading(false);
    if (!error) alert('✅ Configuración guardada correctamente.');
    else alert('❌ Error al guardar: ' + error.message);
  };

  const testTelegramConfig = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/admin/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bot_token: telegramConfig.bot_token, channel_id: telegramConfig.channel_id })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Conexión exitosa. Revisa tu canal de Telegram.');
      } else {
        alert('❌ Error de conexión: ' + data.message);
      }
    } catch (e: any) {
      alert('❌ Error: ' + e.message);
    }
    setIsActionLoading(false);
  };

  if (!adminModalOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-hidden`}>
      <div className={`absolute inset-0 ${tc.overlay}`} onClick={() => setAdminModalOpen(false)} />
      
      <div className={`relative w-full max-w-5xl h-[90vh] sm:h-[85vh] flex flex-col rounded-3xl border overflow-hidden animate-in zoom-in-95 duration-300 ${tc.panel}`}>
        
        {/* --- COMPACT HEADER --- */}
        <div className={`px-5 py-3 border-b flex items-center justify-between sticky top-0 z-20 ${tc.header}`}>
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-xl bg-[#009ea8]/10 flex items-center justify-center text-[#009ea8] border border-[#009ea8]/10">
                <ShieldAlert className="w-5 h-5" />
             </div>
             <div>
                <h1 className="text-sm sm:text-base font-heading font-black">Panel de Gestión</h1>
                <p className={`text-[9px] font-heading font-black uppercase tracking-widest leading-none ${tc.muted}`}>Nucleo de Seguridad CupOferta</p>
             </div>
          </div>
          <button onClick={() => setAdminModalOpen(false)} className={`p-2 rounded-xl hover:bg-white/5 transition-colors ${tc.muted}`}><X className="w-5 h-5" /></button>
        </div>

        {/* --- COMPACT NAV --- */}
        <div className="px-5 py-3 border-b border-inherit flex flex-col md:flex-row gap-3 items-center justify-between bg-inherit/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex gap-1.5 p-1 rounded-xl bg-black/20 border border-white/5 overflow-x-auto w-full md:w-auto hide-scrollbar">
            {[
              { id: 'moderation', label: 'Mod', icon: Eye, count: stats.pending },
              { id: 'reports', label: 'Reportes', icon: Flag, count: stats.reports },
              { id: 'deals', label: 'Contenido', icon: LayoutGrid },
              { id: 'users', label: 'Usuarios', icon: UserMinus },
              { id: 'history', label: 'Log', icon: History },
              { id: 'telegram', label: 'API', icon: Send },
            ].map((t) => (
              <button 
                key={t.id} 
                onClick={() => setTab(t.id as Tab)} 
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[10px] font-heading font-black transition-all relative shrink-0 ${tab === t.id ? tc.tabActive : tc.tabInactive}`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
                {t.count > 0 && <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black ${tab === t.id ? 'bg-white text-[#009ea8]' : 'bg-red-500 text-white'}`}>{t.count}</span>}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-48">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 ${tc.muted}`} />
            <input type="text" placeholder="Filtrar..." value={search} onChange={e => setSearch(e.target.value)} className={`w-full py-1.5 pl-8 pr-3 rounded-lg border-none outline-none text-[11px] ${tc.input}`} />
          </div>
        </div>

        {/* --- CONTENT --- */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {isLoading ? <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#009ea8]" /></div> : (
            <div className="animate-in slide-in-from-bottom-2 duration-300">
              
              {tab === 'moderation' && (
                <div className="space-y-3">
                  {deals.length > 0 && (
                    <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 mb-6 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/10">
                             <ShieldAlert className="w-5 h-5" />
                          </div>
                          <div>
                             <h3 className="text-sm font-heading font-black leading-none">Aprobación Masiva</h3>
                             <p className={`text-[9px] font-numbers font-bold mt-1 ${tc.muted}`}>Hay {deals.length} deals esperando revisión</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          {failedTelegrams.length > 0 && (
                             <button 
                                onClick={() => {
                                   const toRetry = [...failedTelegrams];
                                   setFailedTelegrams([]);
                                   handleModerationAction(toRetry, 'approve');
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500 text-white text-[11px] font-heading font-black uppercase hover:bg-yellow-600 transition-all shadow-lg shadow-yellow-500/20"
                             >
                                <RefreshCw className="w-4 h-4" />
                                Reintentar ({failedTelegrams.length})
                             </button>
                          )}
                          <button 
                            onClick={() => handleModerationAction(deals.map(d => d.id), 'approve')}
                            disabled={isActionLoading}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#009ea8] text-white text-[11px] font-heading font-black uppercase hover:bg-[#007b83] active:scale-95 transition-all shadow-lg shadow-[#009ea8]/20 disabled:opacity-50"
                          >
                             {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                             Aprobar Todo
                          </button>
                       </div>
                    </div>
                  )}

                  {deals.length === 0 && (
                     <div className="text-center py-10 opacity-30 text-[11px] font-black uppercase tracking-widest">Cola vacía</div>
                  )}
                  {deals.filter(d => d.title.toLowerCase().includes(search.toLowerCase())).map(deal => (
                     <div key={deal.id} className={`p-3 rounded-2xl border flex items-center gap-3 ${tc.item} transition-all`}>
                        {/* Imagen del deal */}
                        <div className="w-14 h-14 rounded-xl bg-white p-1 border shrink-0 overflow-hidden">
                           <img src={getDealImages(deal.image_url)[0]} className="w-full h-full object-contain" onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/56x56/f1f5f9/94a3b8?text=📦'; }} />
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                           <h3 className="text-xs font-heading font-bold truncate leading-tight mb-0.5">{deal.title}</h3>
                           <div className="flex items-center gap-2">
                             <span className={`text-[9px] font-numbers font-black text-green-500`}>{deal.price}€</span>
                             {deal.old_price && <span className={`text-[9px] font-numbers line-through ${tc.muted}`}>{deal.old_price}€</span>}
                             <span className={`text-[9px] ${tc.muted}`}>· @{deal.profiles?.username} · {deal.store}</span>
                           </div>
                        </div>
                        {/* Acciones */}
                        <div className="flex gap-1.5 shrink-0">
                           {/* Compartir en X — sin API, abre el Web Intent de Twitter */}
                           <button 
                             onClick={() => shareOnX(deal)} 
                             title="Compartir en X (Twitter)"
                             className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/15 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                           >
                             <XIcon className="w-3.5 h-3.5" />
                           </button>
                           <button 
                             onClick={() => handlePushTelegram(deal.id)} 
                             title="Enviar a Telegram"
                             className={`p-2 rounded-lg transition-colors bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc]`}
                           >
                             <TelegramIcon className="w-3.5 h-3.5" />
                           </button>
                           <button onClick={() => handleModerationAction([deal.id], 'approve')} title="Aprobar" className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"><Check className="w-3.5 h-3.5" /></button>
                           <button onClick={() => handleModerationAction([deal.id], 'reject')} title="Rechazar" className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"><Ban className="w-3.5 h-3.5" /></button>
                        </div>
                     </div>
                  ))}
                </div>
              )}

              {tab === 'deals' && (
                <div className="space-y-3">
                  {deals.length === 0 ? <p className="text-center py-10 opacity-30 text-[11px] font-black uppercase tracking-widest">Sin contenido</p> : deals.filter(d => d.title.toLowerCase().includes(search.toLowerCase())).map(deal => (
                     <div key={deal.id} className={`p-3 rounded-2xl border flex items-center gap-3 ${tc.item}`}>
                        <div className="w-14 h-14 rounded-xl bg-white p-1 border shrink-0 overflow-hidden">
                           <img src={getDealImages(deal.image_url)[0]} className="w-full h-full object-contain" onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/56x56/f1f5f9/94a3b8?text=📦'; }} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h3 className="text-xs font-heading font-bold truncate leading-tight mb-0.5">{deal.title}</h3>
                           <div className="flex items-center gap-2">
                             <span className={`text-[9px] font-numbers font-black text-green-500`}>{deal.price}€</span>
                             {deal.old_price && <span className={`text-[9px] font-numbers line-through ${tc.muted}`}>{deal.old_price}€</span>}
                             <span className={`text-[9px] ${tc.muted}`}>· {deal.store} · <span className="uppercase font-black">{deal.status}</span></span>
                           </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                           <button onClick={() => shareOnX(deal)} title="Compartir en X" className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/15 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                             <XIcon className="w-3.5 h-3.5" />
                           </button>
                           <button 
                             onClick={() => handlePushTelegram(deal.id)} 
                             title="Enviar a Telegram"
                             className={`p-2 rounded-lg transition-colors bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc]`}
                           >
                             <TelegramIcon className="w-3.5 h-3.5" />
                           </button>
                           <button onClick={() => handleModerationAction([deal.id], deal.status === 'approved' ? 'reject' : 'approve')} className={`p-2 rounded-lg ${deal.status === 'approved' ? 'text-red-500 bg-red-500/10' : 'text-green-500 bg-green-500/10'}`}>
                             {deal.status === 'approved' ? <Ban className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                           </button>
                        </div>
                     </div>
                  ))}
                  {hasMoreDeals && (
                    <button onClick={() => fetchData(false)} className={`w-full py-3 rounded-xl border border-dashed text-[10px] font-black uppercase tracking-widest mt-4 ${tc.muted} hover:bg-[#009ea8]/5 hover:text-[#009ea8] transition-all`}>
                      Cargar más ofertas
                    </button>
                  )}
                </div>
              )}

              {/* --- COMPACT REPORT CENTER --- */}
              {tab === 'reports' && (
                <div className="space-y-4">
                   <div className="p-5 rounded-3xl bg-red-500 text-white flex items-center gap-5 shadow-lg shadow-red-500/10 relative overflow-hidden min-h-[100px]">
                      <div className="absolute right-[-10%] opacity-5 rotate-12"><Flag className="w-24 h-24" /></div>
                      <div className="w-10 h-10 rounded-2xl bg-white text-red-500 flex items-center justify-center shrink-0"><Flag className="w-5 h-5" /></div>
                      <div className="flex-1">
                         <h2 className="text-xl font-heading font-black leading-none mb-1">Denuncias</h2>
                         <p className="text-red-100 text-[10px] opacity-80 uppercase tracking-widest">Acciones requeridas: {reports.length}</p>
                      </div>
                   </div>

                   <div className="space-y-3">
                      {reports.filter(r => r.reason.toLowerCase().includes(search.toLowerCase())).map(row => {
                           const preview = reportPreviews[row.target_id];
                           return (
                             <div key={row.id} className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 ${tc.item}`}>
                                <div className="flex-1 min-w-0">
                                   <div className="flex items-center gap-2 mb-2">
                                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${row.target_type === 'deal' ? 'bg-orange-500' : 'bg-[#009ea8]'} text-white`}>{row.target_type}</span>
                                      <span className={`text-[8px] ${tc.muted}`}>{new Date(row.created_at).toLocaleDateString()}</span>
                                   </div>
                                   <h3 className="font-heading font-bold text-sm mb-2">{row.reason}</h3>
                                   {preview && (
                                     <div className="p-2 rounded-xl bg-black/10 border border-white/5 flex items-center gap-3 mb-2">
                                        {preview.img && <img src={preview.img} className="w-6 h-6 rounded object-contain bg-white shrink-0" />}
                                        <p className="text-[10px] truncate max-w-[150px] font-bold">{preview.title}</p>
                                     </div>
                                   )}
                                   {row.details && <p className={`text-[10px] p-2 bg-red-500/5 border-l-2 border-red-500/20 italic ${tc.muted}`}>"{row.details}"</p>}
                                </div>
                                <div className="flex md:flex-col gap-2 shrink-0">
                                   <button onClick={() => handleReportAction(row.id, 'resolve')} className="flex-1 px-4 py-2 bg-orange-500 text-white text-[9px] font-black uppercase rounded-lg">Resolver</button>
                                   <button onClick={() => handleReportAction(row.id, 'dismiss')} className="flex-1 px-4 py-2 bg-gray-500/10 text-gray-400 text-[9px] font-black uppercase rounded-lg">Ignorar</button>
                                </div>
                             </div>
                           );
                      })}
                   </div>
                </div>
              )}

               {tab === 'users' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {users.filter(u => u.username.toLowerCase().includes(search.toLowerCase())).map(profile => (
                      <div key={profile.id} className={`p-3 rounded-2xl border flex items-center gap-3 ${tc.item}`}>
                        <img src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`} className={`w-10 h-10 rounded-xl border ${profile.is_banned ? 'border-red-500' : 'border-inherit'}`} />
                        <div className="flex-1 truncate">
                            <h4 className={`text-xs font-heading font-bold truncate ${profile.is_banned ? 'text-red-500' : ''}`}>{profile.username}</h4>
                            <span className="text-[8px] opacity-40 uppercase tracking-widest">{profile.role}</span>
                        </div>
                        <div className="flex gap-1.5">
                            <button onClick={() => setWarningTarget({ id: profile.id, username: profile.username })} className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-lg"><AlertTriangle className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleUserAction(profile.id, profile.is_banned ? 'unban' : 'ban')} className={`p-2 rounded-lg ${profile.is_banned ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>{profile.is_banned ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {hasMoreUsers && (
                    <button onClick={() => fetchData(false)} className={`w-full py-3 rounded-xl border border-dashed text-[10px] font-black uppercase tracking-widest mt-2 ${tc.muted} hover:bg-[#009ea8]/5 hover:text-[#009ea8] transition-all`}>
                      Cargar más usuarios
                    </button>
                  )}
                </div>
              )}

              {tab === 'history' && (
                <div className="space-y-1.5">
                   {logs.map(log => (
                     <div key={log.id} className={`p-2.5 rounded-xl border flex items-center justify-between text-[10px] ${tc.item}`}>
                        <div className="flex items-center gap-3">
                           <div className={`p-1.5 rounded-lg ${log.action.includes('ban') ? 'bg-red-500/10 text-red-500' : 'bg-[#009ea8]/10 text-[#009ea8]'}`}>{log.action.includes('ban') ? <Ban className="w-3" /> : <RefreshCw className="w-3" />}</div>
                           <p><b>@{log.admin?.username || 'System'}</b> <span className="mx-1 opacity-50">/</span> <span className="uppercase font-black">{log.action.replace('_', ' ')}</span></p>
                        </div>
                        <time className={`opacity-40 font-numbers`}>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                     </div>
                   ))}
                </div>
              )}

              {tab === 'telegram' && (
                <div className="max-w-md mx-auto space-y-4 py-5">
                   <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-[#0088cc] text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-[#0088cc]/20"><Send className="w-6 h-6" /></div>
                      <h2 className="text-lg font-heading font-black">Telegram Bot</h2>
                      <p className={`text-xs mt-2 ${tc.muted}`}>Configura tu bot de Telegram para publicar ofertas automáticamente al ser aprobadas.</p>
                   </div>
                   <div className="space-y-3">
                      <div>
                        <label className={`text-[10px] font-bold uppercase tracking-wider ml-1 mb-1 block ${tc.muted}`}>Token del Bot (BotFather)</label>
                        <input type="password" value={telegramConfig?.bot_token} onChange={e => setTelegramConfig({...telegramConfig, bot_token: e.target.value})} className={`w-full p-3 rounded-xl text-xs border-none shadow-inner ${tc.input}`} placeholder="Ej: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" />
                      </div>
                      
                      <div>
                        <label className={`text-[10px] font-bold uppercase tracking-wider ml-1 mb-1 block ${tc.muted}`}>Canal de destino</label>
                        <input type="text" value={telegramConfig?.channel_id} onChange={e => setTelegramConfig({...telegramConfig, channel_id: e.target.value})} className={`w-full p-3 rounded-xl text-xs border-none shadow-inner ${tc.input}`} placeholder="Ej: @cupoferta o -10012345678" />
                        <p className={`text-[9px] mt-1 ml-1 ${tc.muted}`}>* Recuerda añadir el bot como Administrador a tu canal.</p>
                      </div>

                      <div>
                        <label className={`text-[10px] font-bold uppercase tracking-wider ml-1 mb-1 block ${tc.muted}`}>Plantilla del mensaje (HTML permitido)</label>
                        <textarea value={telegramConfig?.message_template} onChange={e => setTelegramConfig({...telegramConfig, message_template: e.target.value})} rows={5} className={`w-full p-3 rounded-xl text-xs border-none shadow-inner resize-none ${tc.input}`} placeholder="🔥 <b>{title}</b>&#10;💰 {price}€" />
                        <div className={`text-[9px] mt-2 p-2 rounded-lg bg-black/5 border border-inherit leading-relaxed ${tc.muted}`}>
                          <b>Variables disponibles:</b><br/>
                          <code>{'{title}'}</code>, <code>{'{price}'}</code>, <code>{'{old_price}'}</code>, <code>{'{store}'}</code>, <code>{'{link}'}</code>, <code>{'{flag}'}</code>, <code>{'{currency_code}'}</code><br/>
                          <b>Ejemplo de uso:</b><br/>
                          🔥 &lt;b&gt;{'{title}'}&lt;/b&gt;<br/>
                          💰 Sólo: {'{flag}'} {'{price}'} (antes {'{old_price}'})
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-2">
                        <button onClick={testTelegramConfig} disabled={isActionLoading} className="flex-1 py-3 bg-white dark:bg-black/20 text-[#009ea8] border border-[#009ea8]/30 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#009ea8]/10 transition-all disabled:opacity-50">Probar Conexión</button>
                        <button onClick={saveTelegramConfig} disabled={isActionLoading} className="flex-1 py-3 bg-[#009ea8] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#009ea8]/20 hover:-translate-y-1 transition-all disabled:opacity-50">Guardar API</button>
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
