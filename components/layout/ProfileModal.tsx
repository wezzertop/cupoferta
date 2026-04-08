'use client';
import { useUIStore } from '@/lib/store';
import { getAvatarUrl, getDealImages } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Flame, ThumbsUp, ThumbsDown, Bookmark, Share2, Calendar, Award, TrendingUp, Package, ChevronRight, Star, Upload, Check, Loader2 } from 'lucide-react';
import { PRESET_AVATARS } from '@/lib/avatars';

function timeAgo(ts: string) {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d`;
  return `${Math.floor(diff / 2592000)}mes`;
}

export function ProfileModal() {
  const { profileModalOpen, setProfileModalOpen, profileUserId, isDarkMode, setSelectedDeal, setDrawerMode, setSearchModalOpen, user, setUser, profileTab, setProfileTab, setSettingsModalOpen, setSettingsTab } = useUIStore();
  const [profile, setProfile] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [savedDeals, setSavedDeals] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalDeals: 0, totalSaved: 0, hotDeals: 0, avgTemp: 0, points: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!profileModalOpen || !profileUserId) return;
    setIsLoading(true);
    setProfile(null);
    setDeals([]);
    setSavedDeals([]);
    // The tab is now managed by the store, but we can default it if needed
    // setProfileTab('deals'); 

    const fetchAll = async () => {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileUserId)
        .single();

      setProfile(profileData);

      // Fetch aggregations and deals
      const [
        { count: countDeals },
        { count: countHot },
        { count: countSaved },
        { data: avgTempQuery },
        { data: dealsData },
        { data: savedData }
      ] = await Promise.all([
        supabase.from('deals').select('*', { count: 'exact', head: true }).eq('user_id', profileUserId),
        supabase.from('deals').select('*', { count: 'exact', head: true }).eq('user_id', profileUserId).gte('temp', 100),
        supabase.from('saved_deals').select('*', { count: 'exact', head: true }).eq('user_id', profileUserId),
        supabase.from('deals').select('temp').eq('user_id', profileUserId),
        supabase.from('deals').select('*').eq('user_id', profileUserId).order('created_at', { ascending: false }).limit(20),
        supabase.from('saved_deals').select('deal_id, deals(*)').eq('user_id', profileUserId).order('created_at', { ascending: false }).limit(20)
      ]);

      let avg = 0;
      if (avgTempQuery && avgTempQuery.length > 0) {
        avg = Math.round(avgTempQuery.reduce((s, d) => s + (d.temp || 0), 0) / avgTempQuery.length);
      }

      if (dealsData) setDeals(dealsData);
      if (savedData) setSavedDeals(savedData.map(s => s.deals).filter(Boolean));

      const computedPoints = (countDeals || 0) * 10 + (countHot || 0) * 5;
      setStats({
        totalDeals: countDeals || 0,
        hotDeals: countHot || 0,
        avgTemp: avg,
        totalSaved: countSaved || 0,
        points: computedPoints
      });

      setIsLoading(false);
    };
    fetchAll();
  }, [profileModalOpen, profileUserId]);

  // Redundant logic removed

  if (!profileModalOpen) return null;

  const close = () => setProfileModalOpen(false);
  const openDeal = (deal: any) => { setSelectedDeal(deal); setDrawerMode('details'); close(); };

  const tc = {
    panel: isDarkMode ? 'bg-black/80 backdrop-blur-md text-white border-l border-white/10' : 'bg-white/90 backdrop-blur-md text-slate-900 border-l border-slate-200',
    dimmed: isDarkMode ? 'text-gray-500' : 'text-slate-400',
    card: isDarkMode ? 'bg-[#141414] border-white/10' : 'bg-slate-50 border-slate-200',
    dealCard: isDarkMode ? 'bg-[#111] border-white/10 hover:bg-[#1a1a1a]' : 'bg-white border-slate-100 hover:bg-slate-50',
    stat: isDarkMode ? 'bg-[#181818] border-[#282828]' : 'bg-slate-50 border-slate-200',
    tab: isDarkMode ? 'bg-[#141414] border-[#252525]' : 'bg-slate-100 border-slate-200',
    tabActive: 'bg-[#009ea8] text-white',
    tabInactive: isDarkMode ? 'text-gray-500 hover:text-white' : 'text-slate-500 hover:text-slate-900',
  };

  const isOwn = user?.id === profileUserId;
  const getImg = (url: string) => getDealImages(url)[0];

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" onClick={close} />
      <aside className={`fixed top-0 right-0 h-full w-full md:w-[480px] lg:w-[520px] z-[95] shadow-2xl flex flex-col transition-transform duration-300 animate-in slide-in-from-right-4 ${tc.panel}`}>

        {/* Header con banner y avatar */}
        <div className="relative shrink-0">
          {/* Banner gradient */}
          <div className={`h-28 w-full relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-r from-slate-900 to-[#009ea8]/20' : 'bg-gradient-to-br from-[#009ea8] via-[#007a83] to-[#005a62]'}`}>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            <div className="absolute top-3 right-3 flex gap-2">
              <button onClick={close} className="p-1.5 rounded-lg bg-black/20 text-white hover:bg-black/40 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Avatar & info */}
          <div className="px-4 sm:px-6 pb-4">
            <div className="flex items-end justify-between -mt-10 mb-4 px-1 sm:px-0">
              <div className="relative">
                <img
                  src={getAvatarUrl(profile?.avatar_url, profileUserId || '', profile?.updated_at)}
                  alt="Avatar"
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-4 ${isDarkMode ? 'border-[#141414] ring-2 ring-white/5' : 'border-white ring-2 ring-slate-100'} object-cover shadow-xl`}
                />
                {stats.avgTemp >= 100 && (
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-orange-500 rounded-full flex items-center justify-center border-2 ${isDarkMode ? 'border-[#141414]' : 'border-white'}`}>
                    <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white fill-current" />
                  </div>
                )}
              </div>
              {isOwn && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setSettingsTab('profile'); setSettingsModalOpen(true); }} 
                    className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-heading font-black border transition-all active:scale-95 shadow-lg ${tc.card} ${isDarkMode ? 'shadow-black/20' : 'shadow-slate-200/50'}`}
                  >
                    Editar perfil
                  </button>
                </div>
              )}
            </div>

            {/* Redundant avatar selector removed */}

            {isLoading ? (
              <div className="space-y-2 px-1 sm:px-0">
                <div className="h-6 w-32 bg-current opacity-10 rounded animate-pulse"></div>
                <div className="h-4 w-56 bg-current opacity-10 rounded animate-pulse"></div>
              </div>
            ) : (
              <div className="px-1 sm:px-0">
                <h2 className="font-heading font-black text-xl sm:text-2xl leading-tight truncate">{profile?.username || 'Cazador Anónimo'}</h2>
                <p className={`text-[13px] sm:text-sm font-body mt-1.5 leading-relaxed ${tc.dimmed}`}>{profile?.bio || 'Buscando los mejores chollos para la comunidad.'}</p>
                <div className={`flex items-center gap-2 mt-3 text-[10px] sm:text-[11px] font-body font-bold uppercase tracking-wider ${tc.dimmed}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Miembro desde {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : '...'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Estadísticas */}
          <div className="px-4 sm:px-6 pb-6 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
            {[
              { label: 'Chollos', value: stats.totalDeals, icon: Package, color: 'text-[#009ea8]' },
              { label: 'En Caliente', value: stats.hotDeals, icon: Flame, color: 'text-orange-500' },
              { label: 'Temp. Media', value: `${stats.avgTemp}°`, icon: TrendingUp, color: 'text-green-500' },
              { label: 'Puntos', value: stats.points, icon: Star, color: 'text-yellow-500' },
            ].map(s => (
              <div key={s.label} className={`p-3 sm:p-3.5 rounded-2xl border text-center transition-transform hover:scale-[1.02] ${tc.stat}`}>
                <s.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-1.5 ${s.color}`} />
                <div className={`font-numbers font-black text-base sm:text-lg leading-none mb-1 ${s.color}`}>{s.value}</div>
                <div className={`text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-widest ${tc.dimmed}`}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className={`px-4 sm:px-6 pb-4 flex gap-2 shrink-0 border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
          {(['deals', 'saved'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setProfileTab(tab)}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[11px] sm:text-[12px] font-heading font-black uppercase tracking-wider transition-all active:scale-95 ${profileTab === tab ? tc.tabActive : tc.tabInactive + ' ' + tc.tab}`}
            >
              {tab === 'deals' ? `Sus Chollos (${stats.totalDeals})` : `Guardados (${stats.totalSaved})`}
            </button>
          ))}
        </div>

        {/* Deals list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className={`h-20 rounded-xl border animate-pulse ${tc.card}`}></div>)}
            </div>
          ) : profileTab === 'deals' ? (
            deals.length === 0 ? (
              <div className={`text-center py-16 border-dashed border-2 rounded-xl mx-4 my-8 flex flex-col items-center justify-center ${isDarkMode ? 'border-white/10' : 'border-slate-200'} ${tc.dimmed}`}>
                <Package size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-heading font-bold">Aún no ha publicado chollos</p>
                <p className="text-sm font-body mt-1">¡Sé el primero en compartir un gran descuento!</p>
                {isOwn && (
                  <button onClick={() => { setProfileModalOpen(false); /* open new deal modal from parent ideally */ }} className="mt-4 px-4 py-2 rounded-lg text-sm font-heading font-bold bg-[#009ea8]/10 text-[#009ea8] hover:bg-[#009ea8]/20 transition-colors">
                     Publicar Chollo
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3 pb-safe">
                {deals.map(deal => {
                  const discount = deal.old_price ? Math.round((1 - deal.price / deal.old_price) * 100) : null;
                  return (
                    <button key={deal.id} onClick={() => openDeal(deal)} className={`w-full flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl border transition-all text-left group ${tc.dealCard}`}>
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-white border border-slate-100 flex items-center justify-center p-1.5 shadow-sm">
                        <img src={getImg(deal.image_url)} alt={deal.title} className="w-full h-full object-contain transition-transform group-hover:scale-110" onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png'; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[8px] sm:text-[9px] font-heading font-black uppercase tracking-wider text-[#009ea8] bg-[#009ea8]/5 px-2 py-0.5 rounded-lg border border-[#009ea8]/10">{deal.store}</span>
                        <p className="font-heading font-bold text-[13px] sm:text-[14px] leading-tight line-clamp-2 mt-1 transition-colors group-hover:text-[#009ea8]">{deal.title}</p>
                        <div className={`flex items-center gap-2 mt-1.5 text-[10px] sm:text-[11px] font-medium ${tc.dimmed}`}>
                          <div className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            <span className="font-numbers font-bold">{deal.temp}°</span>
                          </div>
                          <span className="opacity-30">|</span>
                          <span>{timeAgo(deal.created_at)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-numbers font-black text-[15px] sm:text-[17px] text-[#009ea8] leading-none">${deal.price.toLocaleString()}</div>
                        {discount && discount > 0 && <div className="text-[10px] sm:text-[11px] font-black text-green-500 mt-1 uppercase">-{discount}%</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          ) : isOwn ? (
            savedDeals.length === 0 ? (
              <div className={`text-center py-16 border-dashed border-2 rounded-xl mx-4 my-8 flex flex-col items-center justify-center ${isDarkMode ? 'border-white/10' : 'border-slate-200'} ${tc.dimmed}`}>
                <Bookmark size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-heading font-bold">No tienes chollos guardados</p>
                <p className="text-sm font-body mt-1">Los chollos que guardes aparecerán aquí.</p>
                <button onClick={() => { setProfileModalOpen(false); }} className="mt-4 px-4 py-2 rounded-lg text-sm font-heading font-bold bg-[#009ea8]/10 text-[#009ea8] hover:bg-[#009ea8]/20 transition-colors">
                   Explorar ofertas
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedDeals.map(deal => {
                  const discount = deal.old_price ? Math.round((1 - deal.price / deal.old_price) * 100) : null;
                  return (
                    <button key={deal.id} onClick={() => openDeal(deal)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${tc.dealCard}`}>
                      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-white border border-slate-100 flex items-center justify-center p-1">
                        <img src={getImg(deal.image_url)} alt={deal.title} className="w-full h-full object-contain" onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png'; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-heading font-bold uppercase text-[#009ea8] bg-[#009ea8]/10 px-1.5 py-0.5 rounded">{deal.store}</span>
                        <p className="font-heading font-bold text-[13px] leading-snug line-clamp-2 mt-0.5">{deal.title}</p>
                        <div className={`flex items-center gap-2 mt-1 text-[11px] ${tc.dimmed}`}>
                          <Flame className="w-3 h-3 text-orange-400" />
                          <span className="font-numbers">{deal.temp}°</span>
                          <span>•</span>
                          <span>{timeAgo(deal.created_at)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-numbers font-black text-[15px] text-[#009ea8]">${deal.price.toLocaleString()}</div>
                        {discount && discount > 0 && <div className="text-[11px] font-bold text-green-500">-{discount}%</div>}
                        <ChevronRight className={`w-3.5 h-3.5 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${tc.dimmed}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            <div className={`text-center py-16 ${tc.dimmed}`}>
              <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-heading font-bold">Guardados privados</p>
              <p className="text-sm font-body mt-1">Solo visible para el dueño del perfil.</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
