'use client';
import { useUIStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { ChevronRight, ChevronUp, ChevronDown, Eye, Flame, BarChart3, ExternalLink, Truck, Calendar, RefreshCcw, Save, Trash2, Clock, Pause, Edit } from 'lucide-react';
import { getDealImages, getRemainingTime, formatPrice, getCurrencyFlag, CURRENCIES, getFlagUrl } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { CommentSection } from './CommentSection';
import { VotesSection } from './VotesSection';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function DealDrawer() {
  const { selectedDeal, setSelectedDeal, drawerMode, setDrawerMode, isDarkMode, user, setAuthModalOpen, dealTemps, setDealTemp, dealVotes, setDealVote, dealViews, setDealView } = useUIStore();
  const supabase = createClient();
  
  const [activeGalleryImage, setActiveGalleryImage] = useState(0);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  
  // States for renewal
  const [isRenewing, setIsRenewing] = useState(false);
  const [newExpiration, setNewExpiration] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editCurrency, setEditCurrency] = useState('');

  const [timeLeft, setTimeLeft] = useState<string | null>(getRemainingTime(selectedDeal?.expires_at));

  useEffect(() => {
    if (!selectedDeal?.expires_at) {
      setTimeLeft(null);
      return;
    }
    setTimeLeft(getRemainingTime(selectedDeal.expires_at));
    const interval = setInterval(() => {
      setTimeLeft(getRemainingTime(selectedDeal.expires_at));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedDeal?.expires_at]);

  const getTimeAgo = (dateStr: string) => {
    if (timeLeft) return timeLeft; // Si hay cuenta regresiva, se muestra
    if (!dateStr) return 'hace poco';
    const date = new Date(dateStr);
    const diffInHours = Math.max(0, Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60)));
    if (diffInHours < 1) return 'hace poco';
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    return `hace ${Math.floor(diffInHours / 24)}d`;
  };

  useEffect(() => {
    // Reset state when new deal is opened
    if (selectedDeal) {
      setActiveGalleryImage(0);
      setIsDescExpanded(false);
      setIsEditing(false);
      setIsRenewing(false);

      // Add view
      const viewKey = `viewed_${selectedDeal.id}`;
      if (!sessionStorage.getItem(viewKey)) {
        sessionStorage.setItem(viewKey, 'true');
        supabase.rpc('increment_view_count', { deal_id: selectedDeal.id }).then(({ error }) => { if (error) console.error(error); });
        // Optimistically update the UI views globally via store
        const currentViews = dealViews[selectedDeal.id] ?? selectedDeal.views_count;
        setDealView(selectedDeal.id, currentViews + 1);
      }
    }
  }, [selectedDeal]);

  if (!selectedDeal) return null;

  const localTemp = dealTemps[selectedDeal.id] ?? selectedDeal.temp;
  const localViews = dealViews[selectedDeal.id] ?? selectedDeal.views_count;
  const userVote = dealVotes[selectedDeal.id] ?? null;

  const handleVote = async (type: 1 | -1) => {
    if (!user) { setAuthModalOpen(true); return; }

    if (userVote === type) {
      setDealTemp(selectedDeal.id, localTemp - type);
      setDealVote(selectedDeal.id, null);
      await supabase.from('deal_votes').delete().eq('deal_id', selectedDeal.id).eq('user_id', user.id);
    } else {
      const tempDiff = (!userVote || userVote === 0) ? type : type * 2;
      setDealTemp(selectedDeal.id, localTemp + tempDiff);
      setDealVote(selectedDeal.id, type);
      
      await supabase.from('deal_votes').delete().eq('deal_id', selectedDeal.id).eq('user_id', user.id);
      await supabase.from('deal_votes').insert({
        deal_id: selectedDeal.id,
        user_id: user.id,
        vote_type: type
      });
    }
  };
  const isOwner = user?.id === selectedDeal.user_id;
  const isExpired = timeLeft === 'Expirado';

  const handleRenew = async () => {
     if (!selectedDeal) return;
     setIsUpdating(true);
     const updateData = {
        expires_at: newExpiration ? new Date(newExpiration).toISOString() : null,
        status: 'approved' // Volver a activar
     };
     
     const { error } = await supabase.from('deals').update(updateData).eq('id', selectedDeal.id);
     if (error) {
       console.error("Error al renovar:", error);
       alert("Error al actualizar la oferta");
     } else {
       // Update UI local y global
       const updatedDeal = { ...selectedDeal, ...updateData };
       setSelectedDeal(updatedDeal);
       setIsRenewing(false);
       alert("¡Oferta renovada con éxito!");
     }
     setIsUpdating(false);
  };

  const handlePause = async () => {
     if (!selectedDeal) return;
     if (!confirm("¿Seguro que quieres detener/pausar esta oferta? Dejará de ser activa inmediatamente.")) return;
     setIsPausing(true);
     // Forzar expiración para pausar
     const updateData = {
        expires_at: new Date(Date.now() - 60000).toISOString() 
     };
     
     const { error } = await supabase.from('deals').update(updateData).eq('id', selectedDeal.id);
     if (error) {
       console.error("Error al pausar:", error);
       alert("Error al detener la oferta");
     } else {
       const updatedDeal = { ...selectedDeal, ...updateData };
       setSelectedDeal(updatedDeal);
       alert("Oferta detenida con éxito.");
     }
     setIsPausing(false);
  };

  const handleDelete = async () => {
     if (!selectedDeal) return;
     if (!confirm("¿Estás seguro de que quieres eliminar esta oferta permanentemente?")) return;
     setIsDeleting(true);
     
     const { error } = await supabase.from('deals').delete().eq('id', selectedDeal.id);
     if (error) {
       console.error("Error al eliminar:", error);
       alert("Error al eliminar la oferta. Revisa si tienes permisos.");
     } else {
       alert("Oferta eliminada con éxito.");
       setSelectedDeal(null);
       window.location.reload(); 
     }
     setIsDeleting(false);
  };

  const handleStartEdit = () => {
    if (!selectedDeal) return;
    setEditTitle(selectedDeal.title || '');
    setEditDesc(selectedDeal.description || '');
    setEditPrice(selectedDeal.price?.toString() || '');
    setEditLink(selectedDeal.link || '');
    setEditCurrency(selectedDeal.currency || 'MXN');
    setIsEditing(true);
    setIsRenewing(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedDeal) return;
    setIsUpdating(true);
    const updateData = {
      title: editTitle,
      description: editDesc,
      price: parseFloat(editPrice) || 0,
      link: editLink,
      currency: editCurrency
    };
    
    const { error } = await supabase.from('deals').update(updateData).eq('id', selectedDeal.id);
    if (error) {
      console.error("Error al editar:", error);
      alert("Error al guardar cambios");
    } else {
      const updatedDeal = { ...selectedDeal, ...updateData };
      setSelectedDeal(updatedDeal);
      setIsEditing(false);
    }
    setIsUpdating(false);
  };

  const themeClasses = {
    sidebarHover: isDarkMode ? 'hover:bg-[#1f1f1f]' : 'hover:bg-slate-50',
    sidebar: isDarkMode ? 'bg-black/80 backdrop-blur-md border-l border-white/10 text-gray-200' : 'bg-white border-l border-slate-200 text-slate-800',
    textMuted: isDarkMode ? 'text-gray-500' : 'text-slate-500',
    textDesc: isDarkMode ? 'text-gray-400' : 'text-slate-600',
    textStrong: isDarkMode ? 'text-white' : 'text-slate-900',
    voteBg: isDarkMode ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-slate-100',
    arrowBg: isDarkMode ? 'bg-[#111111] text-gray-500 hover:text-white' : 'bg-slate-50 text-slate-500 hover:text-slate-800',
    card: isDarkMode ? 'bg-[#141414] border-white/5' : 'bg-white border-slate-100',
    inputBg: isDarkMode ? 'bg-[#141414] border-[#333333] text-white focus:border-[#009ea8] outline-none' : 'bg-white border-slate-200 text-slate-900 focus:border-[#009ea8] outline-none transition-all',
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
        onClick={() => setSelectedDeal(null)}
        aria-hidden="true"
      />
      
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[90%] md:w-[70%] lg:w-[55%] xl:w-[50%] z-[70] transition-transform duration-300 ease-in-out translate-x-0 ${themeClasses.sidebar} shadow-2xl flex flex-col drawer-panel`}
        style={{ paddingBottom: 'var(--safe-bottom)' }}
      >
        <div className="md:hidden flex justify-center py-2 shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-800 rounded-full" />
        </div>
        <div className="p-4 border-b border-inherit flex items-center justify-between sticky top-0 bg-inherit z-10">
          <div className="flex items-center gap-3 overflow-hidden">
             <button onClick={() => setSelectedDeal(null)} className={`p-2 rounded-xl flex-shrink-0 ${themeClasses.sidebarHover} ${themeClasses.textMuted}`}><ChevronRight className="w-5 h-5" /></button>
             <div className={`flex p-1 rounded-xl border border-inherit overflow-x-auto hide-scrollbar ${isDarkMode ? 'bg-[#141414] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'}`}>
                <button onClick={() => setDrawerMode('details')} className={`px-4 py-1.5 rounded-lg text-[11px] font-heading font-bold transition-all whitespace-nowrap ${drawerMode === 'details' ? 'bg-[#009ea8] text-white' : themeClasses.textMuted}`}>Detalle</button>
                <button onClick={() => setDrawerMode('metrics')} className={`px-4 py-1.5 rounded-lg text-[11px] font-heading font-bold transition-all whitespace-nowrap ${drawerMode === 'metrics' ? 'bg-[#009ea8] text-white' : themeClasses.textMuted}`}>Métricas</button>
                <button onClick={() => setDrawerMode('votes')} className={`px-4 py-1.5 rounded-lg text-[11px] font-heading font-bold transition-all whitespace-nowrap ${drawerMode === 'votes' ? 'bg-[#009ea8] text-white' : themeClasses.textMuted}`}>Votos</button>
                <button onClick={() => setDrawerMode('chat')} className={`px-4 py-1.5 rounded-lg text-[11px] font-heading font-bold transition-all whitespace-nowrap ${drawerMode === 'chat' ? 'bg-[#009ea8] text-white' : themeClasses.textMuted}`}>Comunidad</button>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
           {drawerMode === 'details' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col lg:flex-row gap-6">
                   <div className="w-full lg:w-5/12 flex flex-col gap-3">
                      <div className={`relative w-full aspect-square rounded-xl overflow-hidden border flex items-center justify-center p-6 transition-all ${isDarkMode ? 'bg-[#141414] border-[#333333]' : 'bg-slate-100 border-slate-100'}`}>
                         <img src={getDealImages(selectedDeal.image_url)[activeGalleryImage] || getDealImages(selectedDeal.image_url)[0]} className="w-full h-full object-contain animate-in fade-in duration-300" alt={selectedDeal.title} />
                         
                         {/* Currency Overlay - Strategic Zone */}
                         <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 animate-in slide-in-from-right-2 duration-500">
                            <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-xl shadow-xl border border-white/20 flex items-center justify-center transform hover:scale-110 transition-transform">
                              <img src={getFlagUrl(selectedDeal.currency)} alt="" className="w-6 h-auto rounded-sm shadow-sm" />
                            </div>
                            <div className="bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-heading font-black text-white border border-white/10 shadow-2xl tracking-widest">
                              {selectedDeal.currency || 'MXN'}
                            </div>
                         </div>
                      </div>
                      {/* Mini Thumbnail Gallery si hay multi-images */}
                      {getDealImages(selectedDeal.image_url).length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1 mt-1 custom-scrollbar">
                           {getDealImages(selectedDeal.image_url).map((imgUrl: string, idx: number) => (
                             <button 
                               key={idx} 
                               onClick={() => setActiveGalleryImage(idx)} 
                               className={`w-14 h-14 shrink-0 rounded-lg overflow-hidden border flex items-center justify-center transition-all ${activeGalleryImage === idx ? 'ring-2 ring-[#009ea8] border-transparent opacity-100' : (isDarkMode ? 'border-[#333333] bg-[#0a0a0a] opacity-60 hover:opacity-100' : 'border-slate-200 bg-white opacity-60 hover:opacity-100')}`}
                             >
                               <img src={imgUrl.trim()} className="w-full h-full object-contain" />
                             </button>
                           ))}
                        </div>
                      )}
                   </div>
                   <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="bg-[#009ea8]/10 text-[#009ea8] text-[9px] font-heading font-black px-2 py-1 rounded-lg tracking-wider inline-block uppercase border border-[#009ea8]/20">{selectedDeal.store}</span>
                        <span className={`text-[10px] font-heading font-black px-2 py-1 rounded-lg border shadow-sm transition-all duration-300 ${timeLeft ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' : (isDarkMode ? 'bg-white/5 border-white/5 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-500')}`}>
                          {getTimeAgo(selectedDeal.created_at)}
                        </span>
                      </div>
                      <h2 className={`text-xl md:text-2xl font-heading font-black leading-tight line-clamp-3 ${themeClasses.textStrong}`} title={selectedDeal.title}>{selectedDeal.title}</h2>
                      <div className={`flex flex-wrap items-center justify-between gap-3 py-2.5 border-y ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                         <div className="flex items-center gap-2.5">
                            <img src={selectedDeal.profiles?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Anon"} alt="Autor" className={`w-8 h-8 rounded-full border shadow-sm ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`} />
                            <div className="flex flex-col -space-y-0.5">
                               <span className={`text-[12px] font-heading font-black ${themeClasses.textStrong}`}>{selectedDeal.profiles?.username}</span>
                               <span className={`text-[10px] ${themeClasses.textMuted}`}>Publicó esta oferta</span>
                            </div>
                         </div>
                         <div className={`flex items-center gap-1.5 border px-2 py-1 rounded-lg text-[9px] font-heading font-black text-[#009ea8] uppercase tracking-widest ${isDarkMode ? 'border-white/5 bg-white/[0.03]' : 'border-slate-100 bg-white'}`}>
                            <Truck className="w-3.5 h-3.5" /> {selectedDeal.shipping_type}
                         </div>
                      </div>
                      <div className="pt-1 flex items-center gap-2.5 flex-wrap">
                          <span className={`text-2xl md:text-3xl font-numbers font-black ${themeClasses.textStrong}`}>{formatPrice(selectedDeal.price, selectedDeal.currency)}</span>
                          <span className={`text-sm font-numbers font-bold line-through decoration-red-400/80 decoration-2 opacity-60 ${themeClasses.textMuted}`}>{formatPrice(selectedDeal.old_price, selectedDeal.currency)}</span>
                         <span className="px-2 py-0.5 rounded-md text-[10px] font-numbers font-extrabold bg-[#facc15] text-black shadow-sm shadow-[#facc15]/10">- {Math.round((1 - selectedDeal.price/selectedDeal.old_price) * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-4 py-2">
                         <div className={`flex items-center justify-between px-2 py-1 rounded-xl border shadow-sm transition-colors w-[110px] ${themeClasses.voteBg}`}>
                           <button onClick={() => handleVote(1)} className={`rounded-lg p-1 transition-colors ${userVote === 1 ? 'bg-orange-500/20 text-orange-500' : themeClasses.arrowBg} active:scale-95`}><ChevronUp className="w-4 h-4" /></button>
                           <div className="flex items-center justify-center">
                             <span className={`font-numbers font-bold text-[14px] mx-1 ${userVote === 1 ? 'text-orange-500' : userVote === -1 ? 'text-blue-500' : (localTemp >= 100 ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500' : 'text-[#009ea8]')}`}>{localTemp}°</span>
                             {localTemp >= 100 && <Flame className="w-4 h-4 text-orange-500 animate-pulse ml-0.5" />}
                           </div>
                           <button onClick={() => handleVote(-1)} className={`rounded-lg p-1 transition-colors ${userVote === -1 ? 'bg-blue-500/20 text-blue-500' : themeClasses.arrowBg} active:scale-95`}><ChevronDown className="w-4 h-4" /></button>
                         </div>
                         <span className={`text-[10px] font-heading font-bold uppercase tracking-wider ${themeClasses.textMuted}`}>¡Vota esta oferta!</span>
                      </div>
                      <div className="pt-2">
                        <a 
                          href={selectedDeal.link || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full bg-[#009ea8] text-white h-11 md:h-12 rounded-xl font-heading font-bold text-[13px] flex items-center justify-center gap-2 shadow-lg shadow-[#009ea8]/20 hover:-translate-y-0.5 transition-all"
                        >
                           Ver Oferta <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                        </a>
                      </div>

                      {/* Sección de Gestión para el Dueño */}
                      {isOwner && (
                        <div className={`mt-6 p-4 rounded-xl border-2 border-dashed animate-in fade-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#009ea8]/5 border-[#009ea8]/20' : 'bg-[#e0f2f1]/30 border-teal-100'}`}>
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-full bg-[#009ea8] text-white flex items-center justify-center shadow-lg shadow-[#009ea8]/20">
                                 <Edit className="w-5 h-5" />
                              </div>
                              <div>
                                 <h4 className={`text-sm font-heading font-black ${themeClasses.textStrong}`}>Gestión de tu Oferta</h4>
                                 <p className="text-[11px] font-body opacity-60">Controlas la visibilidad, expiración y borrado</p>
                              </div>
                              {isExpired && (
                                <span className="ml-auto px-2 py-0.5 rounded bg-red-500 text-white text-[9px] font-heading font-black uppercase animate-pulse">EXPIRADA</span>
                              )}
                           </div>

                           {isEditing ? (
                             <div className="space-y-4 animate-in slide-in-from-top-2">
                                <label className="text-[11px] font-heading font-extrabold uppercase tracking-widest opacity-60 ml-1 mb-1 block">Editar Oferta</label>
                                
                                <div className="space-y-3">
                                  <div>
                                    <span className="text-[10px] opacity-60 ml-1">Título</span>
                                    <input value={editTitle} onChange={e=>setEditTitle(e.target.value)} className={`w-full px-3 py-2 rounded-xl border text-[13px] ${themeClasses.inputBg}`} />
                                  </div>
                                  <div>
                                    <span className="text-[10px] opacity-60 ml-1">Descripción</span>
                                    <textarea value={editDesc} onChange={e=>setEditDesc(e.target.value)} rows={4} className={`w-full px-3 py-2 rounded-xl border text-[13px] resize-none ${themeClasses.inputBg}`} />
                                  </div>
                                  <div className="flex gap-2">
                                    <div className="flex-1">
                                      <span className="text-[10px] opacity-60 ml-1">Precio</span>
                                      <div className={`flex items-center px-3 py-2 rounded-xl border ${themeClasses.inputBg}`}>
                                        <span className="text-gray-400 mr-2">$</span>
                                        <input type="number" value={editPrice} onChange={e=>setEditPrice(e.target.value)} className="w-full bg-transparent border-none outline-none text-[13px]" />
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                       <span className="text-[10px] opacity-60 ml-1">Moneda</span>
                                       <select 
                                          value={editCurrency} 
                                          onChange={e => setEditCurrency(e.target.value)} 
                                          className={`w-full px-3 py-2 rounded-xl border text-[13px] ${themeClasses.inputBg}`}
                                       >
                                          {CURRENCIES.map(curr => (
                                            <option key={curr.code} value={curr.code}>{curr.flag} {curr.code}</option>
                                          ))}
                                       </select>
                                     </div>
                                  </div>
                                  <div>
                                      <span className="text-[10px] opacity-60 ml-1">Enlace Oficial</span>
                                      <input value={editLink} onChange={e=>setEditLink(e.target.value)} className={`w-full px-3 py-2 rounded-xl border text-[13px] ${themeClasses.inputBg}`} />
                                  </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                   <button onClick={() => setIsEditing(false)} className={`flex-1 py-2.5 rounded-lg font-heading font-bold text-[11px] transition-colors ${isDarkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-black/5 text-slate-500'}`}>CANCELAR</button>
                                   <button onClick={handleSaveEdit} disabled={isUpdating} className="flex-1 bg-[#009ea8] text-white py-2.5 rounded-lg font-heading font-bold text-[11px] flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50">
                                     {isUpdating ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                     GUARDAR
                                   </button>
                                </div>
                             </div>
                           ) : isRenewing ? (
                             <div className="space-y-4 animate-in slide-in-from-top-2">
                                <div>
                                   <label className="text-[11px] font-heading font-extrabold uppercase tracking-widest opacity-60 ml-1 mb-1 block">Nueva fecha de expiración</label>
                                   <div className={`flex items-center px-4 py-2 rounded-xl border transition-colors ${isDarkMode ? 'bg-[#141414] border-[#333333]' : 'bg-white border-slate-200'}`}>
                                      <Calendar className="w-4 h-4 opacity-50 mr-3" />
                                      <input 
                                        type="datetime-local" 
                                        value={newExpiration} 
                                        onChange={e => setNewExpiration(e.target.value)} 
                                        min={new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16)}
                                        className="w-full bg-transparent border-none outline-none font-numbers text-[13px] md:text-sm cursor-pointer"
                                      />
                                   </div>
                                   <p className="text-[10px] font-body mt-2 px-1 opacity-50">Déjalo vacío si quieres que la oferta no expire.</p>
                                </div>
                                <div className="flex gap-2">
                                   <button 
                                     onClick={() => setIsRenewing(false)}
                                     className={`flex-1 py-2.5 rounded-lg font-heading font-bold text-[11px] transition-colors ${isDarkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-black/5 text-slate-500'}`}
                                   >CANCELAR</button>
                                   <button 
                                     onClick={handleRenew}
                                     disabled={isUpdating}
                                     className="flex-1 bg-[#009ea8] text-white py-2.5 rounded-lg font-heading font-bold text-[11px] flex items-center justify-center gap-2 shadow-lg shadow-[#009ea8]/20 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
                                   >
                                     {isUpdating ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                     CONFIRMAR
                                   </button>
                                </div>
                             </div>
                           ) : (
                             <div className="grid grid-cols-2 gap-2">
                               <button 
                                 onClick={handleStartEdit}
                                 className="col-span-2 bg-[#009ea8] text-white py-2.5 rounded-lg font-heading font-bold text-[11px] flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-lg shadow-[#009ea8]/20 mb-1"
                               >
                                 EDITAR OFERTA
                                 <Edit className="w-3.5 h-3.5" />
                               </button>

                               <button 
                                 onClick={() => setIsRenewing(true)}
                                 className="col-span-2 bg-[#111727] text-white py-2.5 rounded-lg font-heading font-bold text-[11px] flex items-center justify-center gap-2 hover:bg-[#1a2135] transition-all mb-1"
                               >
                                 {isExpired ? 'RENOVAR OFERTA' : 'MODIFICAR EXPIRACIÓN'}
                                 <Clock className="w-3.5 h-3.5" />
                               </button>
                               
                               <button 
                                 onClick={handlePause}
                                 disabled={isPausing || isExpired}
                                 className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 font-heading font-bold text-[11px] transition-all disabled:opacity-50"
                               >
                                 {isPausing ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Pause className="w-4 h-4" />}
                                 DETENER
                               </button>

                               <button 
                                 onClick={handleDelete}
                                 disabled={isDeleting}
                                 className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 font-heading font-bold text-[11px] transition-all disabled:opacity-50"
                               >
                                 {isDeleting ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                 ELIMINAR
                               </button>
                             </div>
                           )}
                        </div>
                      )}
                   </div>
                </div>
                 <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#111111] border-white/5' : 'bg-slate-100 border-slate-100'}`}>
                  <h3 className={`font-heading font-bold text-lg mb-3 ${themeClasses.textStrong}`}>Acerca de esta oferta</h3>
                  <div className={`text-[14px] font-body leading-relaxed md-content ${themeClasses.textDesc}`}>
                    <div className={!isDescExpanded ? "line-clamp-4" : ""}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {selectedDeal.description}
                      </ReactMarkdown>
                    </div>
                    {selectedDeal.description.length > 200 && (
                      <button onClick={() => setIsDescExpanded(!isDescExpanded)} className="mt-2 text-[#009ea8] font-heading font-bold text-[13px] hover:underline transition-all">
                        {isDescExpanded ? 'Ver menos' : 'Ver más'}
                      </button>
                    )}
                  </div>
                </div>
             </div>
           )}

           {drawerMode === 'metrics' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div>
                   <h3 className={`text-lg font-heading font-bold mb-4 ${themeClasses.textStrong}`}>Estadísticas de la Oferta</h3>
                   <div className="grid grid-cols-2 gap-4">
                      <div className={`p-5 rounded-2xl border transition-colors ${isDarkMode ? 'bg-[#141414] border-[#262626]' : 'bg-slate-100 border-slate-200'}`}>
                         <div className="flex items-center gap-2 mb-3">
                            <Eye className="w-5 h-5 text-blue-500" />
                            <span className={`text-[11px] font-heading font-bold uppercase tracking-wider ${themeClasses.textMuted}`}>Vistas únicas</span>
                         </div>
                         <div className={`text-3xl font-numbers font-black tracking-tight ${themeClasses.textStrong}`}>{localViews.toLocaleString()}</div>
                      </div>
                      <div className={`p-5 rounded-2xl border transition-colors ${isDarkMode ? 'bg-[#141414] border-[#262626]' : 'bg-slate-100 border-slate-200'}`}>
                         <div className="flex items-center gap-2 mb-3">
                            <Flame className="w-5 h-5 text-orange-500" />
                            <span className={`text-[11px] font-heading font-bold uppercase tracking-wider ${themeClasses.textMuted}`}>Temperatura</span>
                         </div>
                         <div className={`text-3xl font-numbers font-black tracking-tight ${themeClasses.textStrong}`}>{selectedDeal.temp}°</div>
                      </div>
                   </div>
                   <div className={`mt-4 p-8 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center ${isDarkMode ? 'bg-[#141414]/50 border-[#333333]' : 'bg-slate-100 border-slate-200'}`}>
                      <BarChart3 className={`w-8 h-8 mb-3 opacity-20 ${themeClasses.textMuted}`} />
                      <span className={`text-[12px] font-heading font-bold uppercase tracking-wider ${themeClasses.textMuted}`}>Gráficos próximamente</span>
                   </div>
                </div>
             </div>
           )}

           {drawerMode === 'votes' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 className={`text-lg font-heading font-bold mb-4 ${themeClasses.textStrong}`}>Comunidad de Votantes</h3>
                <VotesSection dealId={selectedDeal.id} />
             </div>
           )}

           {drawerMode === 'chat' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
               <CommentSection dealId={selectedDeal.id} />
             </div>
           )}
        </div>
      </aside>
    </>
  );
}
