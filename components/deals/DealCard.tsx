'use client';
import { useUIStore } from '@/lib/store';
import { ChevronUp, ChevronDown, MessageCircle, Eye, Share2, Bookmark, ExternalLink, Truck, AlertTriangle, Flame, CheckCircle2, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getDealImages, getRemainingTime, formatPrice, getCurrencyFlag, getFlagUrl } from '@/lib/utils';

interface Deal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  old_price: number;
  store: string;
  image_url: string;
  temp: number;
  views_count: number;
  comments_count: number;
  shipping_type: string;
  link: string;
  created_at: string;
  expires_at: string | null;
  currency?: string;
  deal_type?: 'offer' | 'coupon';
  coupon_code?: string | null;
  profiles: { username: string; avatar_url: string };
}

export function DealCard({ deal, viewMode }: { deal: Deal; viewMode: 'grid' | 'list' }) {
  const { isDarkMode, setSelectedDeal, setDrawerMode, setProfileModalOpen, setProfileUserId, setReportModalOpen, setReportTargetId, setReportTargetType } = useUIStore();
  const [copied, setCopied] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const dealImages = getDealImages(deal.image_url);

  const themeClasses = {
    card: isDarkMode ? 'bg-[#141414] border-[#1f1f1f]' : 'bg-white border-slate-100',
    textMuted: isDarkMode ? 'text-gray-500' : 'text-slate-500',
    textDesc: isDarkMode ? 'text-gray-400' : 'text-slate-600',
    textStrong: isDarkMode ? 'text-white' : 'text-slate-900',
    imgContainer: isDarkMode ? 'bg-[#0f0f0f]' : 'bg-slate-50/50',
    btnBase: isDarkMode
      ? 'bg-[#141414] border-[#262626] text-gray-500'
      : 'bg-white border-slate-100 text-slate-400',
    btnCommentsHover: isDarkMode
      ? 'hover:bg-sky-400/10 hover:text-sky-400 hover:border-sky-400/30'
      : 'hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200',
    btnViewsHover: isDarkMode
      ? 'hover:bg-indigo-400/10 hover:text-indigo-400 hover:border-indigo-400/30'
      : 'hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200',
    btnReportHover: isDarkMode
      ? 'hover:bg-rose-400/10 hover:text-rose-400 hover:border-rose-400/30'
      : 'hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200',
    btnShareHover: isDarkMode
      ? 'hover:bg-emerald-400/10 hover:text-emerald-400 hover:border-emerald-400/30'
      : 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200',
    btnSaveHover: isDarkMode
      ? 'hover:bg-orange-400/10 hover:text-orange-400 hover:border-orange-400/30'
      : 'hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200',
    btnSaveActive: isDarkMode
      ? 'bg-orange-400/20 text-orange-400 border-orange-400/30'
      : 'bg-orange-50 text-orange-600 border-orange-200 shadow-inner',
    voteBg: isDarkMode ? 'bg-[#1a1a1a] border-[#1f1f1f]' : 'bg-white border-slate-100',
    arrowBg: isDarkMode ? 'bg-[#111111] text-gray-500 hover:text-white' : 'bg-slate-50 text-slate-500 hover:text-slate-800',
  };

  const supabase = createClient();
  const { user, setAuthModalOpen, dealTemps, setDealTemp, dealVotes, setDealVote, savedDeals, setSavedDeal, dealViews, setDealView, dealComments, setDealComment } = useUIStore();

  const localTemp = dealTemps[deal.id] ?? deal.temp;
  const userVote = dealVotes[deal.id] ?? null;
  const isSaved = savedDeals[deal.id] ?? false;
  const localViews = dealViews[deal.id] ?? deal.views_count;
  const localComments = dealComments[deal.id] ?? deal.comments_count;

  useEffect(() => {
    // Inicializar temperatura y vistas en el store si no existe, solo una vez.
    if (dealTemps[deal.id] === undefined) setDealTemp(deal.id, deal.temp);
    if (dealViews[deal.id] === undefined) setDealView(deal.id, deal.views_count);
    if (dealComments[deal.id] === undefined) setDealComment(deal.id, deal.comments_count);

    // Fetch user vote and save state
    async function checkUserState() {
      if (!user) return;

      // Check vote
      if (dealVotes[deal.id] === undefined) {
        const { data: voteData } = await supabase.from('deal_votes').select('vote_type').eq('deal_id', deal.id).eq('user_id', user.id).maybeSingle();
        if (voteData) setDealVote(deal.id, voteData.vote_type);
        else setDealVote(deal.id, null);
      }

      // Check save
      if (savedDeals[deal.id] === undefined) {
        const { data: saveData } = await supabase.from('saved_deals').select('deal_id').eq('deal_id', deal.id).eq('user_id', user.id).maybeSingle();
        setSavedDeal(deal.id, !!saveData);
      }
    }
    checkUserState();
  }, [user, deal.id]);

  const handleVote = async (e: React.MouseEvent, type: 1 | -1) => {
    e.stopPropagation();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    // Optimistic UI update across ALL components via Zustand
    if (userVote === type) {
      // Removing vote
      setDealTemp(deal.id, localTemp - type);
      setDealVote(deal.id, null);
      const { error } = await supabase.from('deal_votes').delete().eq('deal_id', deal.id).eq('user_id', user.id);
      if (error) console.error("Error deleting deal_vote:", error);
    } else {
      // Changing or adding vote
      const tempDiff = (!userVote || userVote === 0) ? type : type * 2;
      setDealTemp(deal.id, localTemp + tempDiff);
      setDealVote(deal.id, type);

      const { error: delError } = await supabase.from('deal_votes').delete().eq('deal_id', deal.id).eq('user_id', user.id);
      if (delError) console.error("Error deleting before insert deal_vote:", delError);

      const { error: insError } = await supabase.from('deal_votes').insert({
        deal_id: deal.id,
        user_id: user.id,
        vote_type: type
      });
      if (insError) console.error("Error inserting deal_vote:", insError);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/deal/${deal.id}`; // O simplemente el ID, dependerá del router futuro
    if (navigator.share) {
      navigator.share({ title: deal.title, text: '¡Mira este chollo en CupOferta!', url });
    } else {
      navigator.clipboard.writeText(url);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { setAuthModalOpen(true); return; }

    // Toggle guardado optimista
    const newSavedState = !isSaved;
    setSavedDeal(deal.id, newSavedState);

    if (newSavedState) {
      await supabase.from('saved_deals').insert({ deal_id: deal.id, user_id: user.id });
    } else {
      await supabase.from('saved_deals').delete().eq('deal_id', deal.id).eq('user_id', user.id);
    }
  };

  const openDrawer = (mode: 'details' | 'chat' | 'metrics') => {
    setSelectedDeal(deal);
    setDrawerMode(mode);
  };

  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deal.coupon_code) {
      navigator.clipboard.writeText(deal.coupon_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Manejo de expiración y cuenta regresiva
  const [timeLeft, setTimeLeft] = useState<string | null>(getRemainingTime(deal.expires_at));

  useEffect(() => {
    if (!deal.expires_at) return;
    const interval = setInterval(() => {
      setTimeLeft(getRemainingTime(deal.expires_at));
    }, 1000);
    return () => clearInterval(interval);
  }, [deal.expires_at]);

  // Helper para formato de tiempo
  const getTimeAgo = (dateStr: string) => {
    if (timeLeft) return timeLeft; // Si hay cuenta regresiva, se muestra
    const date = new Date(dateStr);
    const diffInHours = Math.max(0, Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60)));
    if (diffInHours < 1) return 'hace poco';
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    return `hace ${Math.floor(diffInHours / 24)}d`;
  };

  // Cálculo de descuento basado en los datos de la BD
  const discount = Math.round((1 - deal.price / deal.old_price) * 100);

  return (
    <div
      className={`rounded-2xl border shadow-sm hover:shadow-[0_0_15px_rgba(0,158,168,0.15)] hover:border-[#009ea8]/50 hover:-translate-y-1 transition-all duration-300 flex overflow-hidden cursor-pointer group/card ${themeClasses.card} ${viewMode === 'list' ? 'flex-row' : 'flex-col'}`}
      onClick={() => openDrawer('details')}
    >
      {/* ── IMAGE / VOTES SIDEBAR ── */}
      <div className={`
        relative flex flex-col flex-shrink-0 transition-colors border-inherit
        ${themeClasses.imgContainer} 
        ${viewMode === 'list'
          ? 'w-[160px] sm:w-[220px] p-2 sm:p-4 border-r justify-center gap-3 items-center'
          : 'w-full p-4 border-b items-center gap-3'}
      `}>
        {/* Image Display */}
        <div className={`
          relative w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center border shadow-sm transition-colors group/gallery
          ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-white'}
        `}>
          <div className="w-full h-full sm:group-hover/card:scale-105 transition-transform duration-700 bg-white">
            <img src={getDealImages(deal.image_url)[activeImgIdx]} alt={deal.title} className="w-full h-full object-cover object-center mix-blend-multiply" />
          </div>

          {/* Gallery Arrows */}
          {dealImages.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between px-1 opacity-0 sm:group-hover/card:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); setActiveImgIdx(prev => prev === 0 ? dealImages.length - 1 : prev - 1); }} className="w-6 h-6 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow text-black hover:bg-white transition-colors">
                <ChevronLeft className="w-4 h-4 ml-[-2px]" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setActiveImgIdx(prev => prev === dealImages.length - 1 ? 0 : prev + 1); }} className="w-6 h-6 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow text-black hover:bg-white transition-colors">
                <ChevronRight className="w-4 h-4 mr-[-2px]" />
              </button>
            </div>
          )}
          {/* Gallery Dots */}
          {dealImages.length > 1 && (
            <div className="absolute bottom-1.5 left-0 right-0 flex items-center justify-center gap-1 opacity-0 sm:group-hover/card:opacity-100 transition-opacity">
              {dealImages.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === activeImgIdx ? 'bg-[#009ea8]' : 'bg-black/20'}`} />
              ))}
            </div>
          )}
          <div className="absolute top-1.5 left-1.5 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-lg text-[7px] sm:text-[9px] font-heading font-black uppercase tracking-wider text-[#111727] shadow-sm border border-slate-200/60">
            {deal.store}
          </div>
          <div className="absolute top-1.5 right-1.5 flex flex-col items-end gap-1">
            <div className={`bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-slate-200/60 flex items-center justify-center`}>
              <img src={getFlagUrl(deal.currency)} alt="" className="w-5 h-auto rounded-sm shadow-[0_0_2px_rgba(0,0,0,0.1)]" />
            </div>
            <div className={`bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md text-[8px] font-heading font-black text-white border border-white/10 shadow-lg`}>
              {deal.currency || 'MXN'}
            </div>
          </div>
        </div>

        {/* Votes Section */}
        <div className={`
          flex items-center justify-between w-full mt-2.5 px-1 sm:px-1.5 py-1.5 rounded-xl border shadow-sm transition-colors
          ${themeClasses.voteBg}
          ${viewMode === 'list' ? 'bg-opacity-50' : ''}
        `}>
          <button onClick={(e) => handleVote(e, 1)} className={`rounded-lg p-1 transition-colors ${userVote === 1 ? 'bg-orange-500/20 text-orange-500' : themeClasses.arrowBg} btn-effect`}>
            <ChevronUp className="w-4 h-4" />
          </button>
          <div className="flex items-center">
            <span className={`font-numbers font-extrabold text-[12px] sm:text-[14px] mx-0.5 sm:mx-1 ${userVote === 1 ? 'text-orange-500' : userVote === -1 ? 'text-blue-500' : (localTemp >= 100 ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500' : 'text-[#009ea8]')}`}>
              {localTemp}°
            </span>
            {localTemp >= 100 && <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500 animate-pulse ml-0.5" />}
          </div>
          <button onClick={(e) => handleVote(e, -1)} className={`rounded-lg p-1 transition-colors ${userVote === -1 ? 'bg-blue-500/20 text-blue-500' : themeClasses.arrowBg} btn-effect`}>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div className={`flex-1 flex flex-col min-w-0 ${viewMode === 'list' ? 'p-3 sm:px-10 sm:py-7' : 'p-4 sm:p-6'}`}>
        <div>
          {/* Metadata Row */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={e => { e.stopPropagation(); setProfileUserId(deal.user_id); setProfileModalOpen(true); }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity btn-effect min-w-0"
            >
              <img src={deal.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${deal.user_id}`} alt="" className={`w-5 h-5 flex-shrink-0 rounded-full border ${isDarkMode ? 'border-[#262626]' : 'border-slate-200'}`} />
              <span className={`text-[10px] sm:text-[11px] font-body font-bold truncate ${themeClasses.textMuted} hover:text-[#009ea8] transition-colors`}>
                @{deal.profiles?.username}
              </span>
            </button>
            <span className={`text-[9px] sm:text-[11px] font-heading font-black px-2 py-0.5 rounded-lg border shadow-sm transition-all duration-300 ${timeLeft ? 'bg-red-500/10 text-red-500 border-red-500/20' : (isDarkMode ? 'bg-white/5 border-white/5 text-gray-500' : 'bg-slate-50 border-slate-200 text-slate-500')}`}>
              {getTimeAgo(deal.created_at)}
            </span>
          </div>

          {/* Title & Description */}
          <div className={`${viewMode === 'list' ? 'max-w-[85%] mb-2' : 'w-full'}`}>
            <h3 className={`font-heading font-bold leading-tight transition-colors text-[15px] sm:text-lg line-clamp-3 sm:line-clamp-2 ${themeClasses.textStrong} group-hover/card:text-[#009ea8] ${viewMode === 'list' ? 'mb-1.5' : 'mb-1 sm:mb-2'}`}>
              {deal.title}
            </h3>
            {viewMode === 'list' && (
              <p className={`hidden sm:line-clamp-2 text-xs sm:text-sm font-body leading-relaxed opacity-60 ${themeClasses.textDesc}`}>
                {deal.description}
              </p>
            )}
          </div>

          {/* Info Badges Row */}
          <div className={`flex items-center gap-2 mb-3 mt-1.5 flex-wrap`}>
            <div className="flex items-center gap-1.5">
              <span className={`text-lg sm:text-2xl font-numbers font-black leading-none ${themeClasses.textStrong}`}>
                {formatPrice(deal.price, deal.currency)}
              </span>
            </div>
            {deal.old_price > deal.price && (
              <>
                <span className={`text-[10px] sm:text-sm font-numbers font-bold line-through decoration-red-500/50 decoration-2 opacity-60 ${themeClasses.textMuted}`}>
                  {formatPrice(deal.old_price, deal.currency)}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-numbers font-extrabold bg-[#facc15] text-[#0a0a0a] shadow-sm shadow-[#facc15]/10">
                  -{discount}%
                </span>
              </>
            )}
            {viewMode === 'grid' && deal.shipping_type !== 'No aplica' && (
              <div className={`flex items-center gap-1 sm:gap-1.5 border px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[8px] sm:text-[9px] font-heading font-black uppercase tracking-wider ml-auto ${
                deal.shipping_type === 'Gratis' 
                  ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' 
                  : 'text-rose-500 border-rose-500/20 bg-rose-500/5'
              }`}>
                <Truck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="ml-1">{deal.shipping_type}</span>
              </div>
            )}
          </div>

          {/* Shipping Badge Row (Only for List View) */}
          {viewMode === 'list' && deal.shipping_type !== 'No aplica' && (
            <div className="flex mb-3">
              <div className={`flex items-center gap-1 sm:gap-1.5 border px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[8px] sm:text-[9px] font-heading font-black uppercase tracking-wider ${
                deal.shipping_type === 'Gratis' 
                  ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' 
                  : 'text-rose-500 border-rose-500/20 bg-rose-500/5'
              }`}>
                <Truck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="ml-1">{deal.shipping_type}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── ACTIONS ROW ── */}
        <div className={`flex items-center gap-3 mt-auto pt-3 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'} ${viewMode === 'grid' ? 'flex-col items-stretch' : 'justify-between'}`}>
          <div className="flex items-center justify-between sm:justify-start gap-1 overflow-x-auto hide-scrollbar py-0.5 w-full">
            <button onClick={(e) => { e.stopPropagation(); openDrawer('chat'); }} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border transition-all btn-effect ${themeClasses.btnBase} ${themeClasses.btnCommentsHover}`}>
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-[12px] font-numbers font-bold">{localComments}</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); openDrawer('metrics'); }} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border transition-all btn-effect ${themeClasses.btnBase} ${themeClasses.btnViewsHover}`}>
              <Eye className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-[12px] font-numbers font-bold">{localViews}</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); setReportTargetId(deal.id); setReportTargetType('deal'); setReportModalOpen(true); }} className={`px-2 py-1.5 rounded-xl border transition-all flex btn-effect ${themeClasses.btnBase} ${themeClasses.btnReportHover}`} aria-label="Reportar">
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleShare} className={`px-2 py-1.5 rounded-xl border transition-all flex btn-effect ${themeClasses.btnBase} ${themeClasses.btnShareHover}`} aria-label="Compartir">
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleSave} className={`px-2 py-1.5 rounded-xl border transition-all flex btn-effect ${isSaved ? themeClasses.btnSaveActive : `${themeClasses.btnBase} ${themeClasses.btnSaveHover}`}`} aria-label="Guardar">
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} strokeWidth={2.5} />
            </button>
          </div>

          <div className={`flex items-center gap-2 ${viewMode === 'grid' ? 'w-full' : 'ml-auto'}`}>
            {deal.deal_type === 'coupon' && deal.coupon_code && (
              <div
                onClick={handleCopyCoupon}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-xl border-2 border-dashed transition-all cursor-copy group/coupon
                  ${isDarkMode
                    ? 'bg-white/5 border-white/10 hover:border-[#009ea8]/50 text-white'
                    : 'bg-slate-50 border-slate-200 hover:border-[#009ea8]/50 text-slate-900'}
                  ${viewMode === 'grid' ? 'flex-1' : 'min-w-[120px]'}
                `}
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] font-heading font-black uppercase tracking-tighter opacity-40">Copiar</span>
                  <span className="text-[11px] font-heading font-black tracking-widest truncate">{deal.coupon_code}</span>
                </div>
                <div className={`p-1 rounded-lg shrink-0 transition-all ${copied ? 'bg-green-500 text-white scale-110' : (isDarkMode ? 'bg-white/5' : 'bg-white shadow-sm opacity-50 group-hover/coupon:opacity-100')}`}>
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Tag className="w-3.5 h-3.5" />}
                </div>
              </div>
            )}

            <a
              href={deal.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`
                text-white rounded-xl font-heading font-black text-[10px] sm:text-[12px] flex items-center justify-center gap-2 
                shadow-lg shadow-[#009ea8]/20 hover:-translate-y-0.5 active:scale-95 transition-all bg-[#009ea8] shrink-0
                ${viewMode === 'list' ? 'w-10 h-10 sm:w-auto sm:h-auto sm:px-5 sm:py-2.5' : 'px-3 sm:px-5 py-2.5'}
                ${viewMode === 'grid' ? (deal.deal_type === 'coupon' ? 'flex-1' : 'w-full') : 'ml-2'}
              `}
            >
              <span className={viewMode === 'list' ? 'hidden sm:inline' : ''}>VER OFERTA</span>
              <ExternalLink className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
