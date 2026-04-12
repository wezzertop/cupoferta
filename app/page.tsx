'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { DealCard } from '@/components/deals/DealCard';
import { DealDrawer } from '@/components/deals/DealDrawer';
import { AuthModal } from '@/components/auth/AuthModal';
import { NewDealWizard } from '@/components/deals/NewDealWizard';
import { SearchModal } from '@/components/layout/SearchModal';
import { ProfileModal } from '@/components/layout/ProfileModal';
import { AdminModal } from '@/components/admin/AdminModal';
import { FiltersModal } from '@/components/deals/FiltersModal';
import { SettingsModal } from '@/components/layout/SettingsModal';
import { LayoutGrid, List, SlidersHorizontal, Megaphone, Loader2, Search, Plus, X, Store } from 'lucide-react';
import { MobileNavbar } from '@/components/layout/MobileNavbar';
import { ReportModal } from '@/components/modals/ReportModal';
import { Footer } from '@/components/layout/Footer';
import { TopDealsWidget } from '@/components/deals/TopDealsWidget';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUIStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { BannerAd } from '@/components/ads/BannerAd';
import { NativeAd } from '@/components/ads/NativeAd';
import { getCookie } from '@/lib/utils';

/* ============================================================
   COMPONENTE: Banner Publicitario
   ============================================================ */
function AdBanner({ isDarkMode, className = '' }: { isDarkMode: boolean; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center w-full relative ${className}`}>
      <div className="flex items-center gap-1.5 opacity-40 absolute -top-5">
        <Megaphone className={`w-2.5 h-2.5 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`} />
        <span className={`text-[8px] font-heading font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
          Publicidad
        </span>
      </div>
      <div className="w-full flex justify-center overflow-hidden rounded-xl">
        <BannerAd isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENTE: Skeleton de Chollo
   ============================================================ */
function DealSkeleton({ viewMode, isDarkMode }: { viewMode: 'grid' | 'list', isDarkMode: boolean }) {
  const bg = isDarkMode ? 'bg-[#111]' : 'bg-white';
  const skeletonColor = isDarkMode ? 'bg-white/5' : 'bg-slate-100';

  if (viewMode === 'list') {
    return (
      <div className={`w-full p-3 sm:p-4 rounded-2xl border ${isDarkMode ? 'border-white/5' : 'border-slate-100'} ${bg} flex gap-4 animate-pulse h-[160px] sm:h-[180px]`}>
        <div className={`w-28 h-full sm:w-40 rounded-xl ${skeletonColor}`} />
        <div className="flex-1 space-y-3 py-2">
          <div className={`h-3 w-20 rounded ${skeletonColor}`} />
          <div className={`h-5 w-full rounded ${skeletonColor}`} />
          <div className={`h-5 w-2/3 rounded ${skeletonColor}`} />
          <div className="flex gap-2 pt-2">
            <div className={`h-4 w-16 rounded ${skeletonColor}`} />
            <div className={`h-4 w-16 rounded ${skeletonColor}`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'border-white/5' : 'border-slate-100'} ${bg} space-y-4 animate-pulse`}>
      <div className={`w-full aspect-[4/3] rounded-xl ${skeletonColor}`} />
      <div className="space-y-2">
        <div className={`h-4 w-full rounded ${skeletonColor}`} />
        <div className={`h-4 w-2/3 rounded ${skeletonColor}`} />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className={`h-6 w-20 rounded ${skeletonColor}`} />
        <div className={`h-10 w-10 rounded-xl ${skeletonColor}`} />
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENTE: Tarjeta de Tienda
   ============================================================ */
function StoreDisplayCard({ store, isDarkMode, onSelect }: { store: any, isDarkMode: boolean, onSelect: () => void }) {
  const bg = isDarkMode ? 'bg-[#141414] border-white/5' : 'bg-white border-slate-100 shadow-sm';
  
  return (
    <button 
      onClick={onSelect}
      className={`group relative flex flex-col items-center text-center p-6 rounded-[2.5rem] border transition-all hover:-translate-y-2 hover:shadow-2xl active:scale-95 overflow-hidden ${bg}`}
      style={{ borderColor: store.color_primary + '30' }}
    >
      {/* Background Decor */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 blur-3xl transition-opacity group-hover:opacity-20"
        style={{ backgroundColor: store.color_primary }}
      />
      
      {/* Logo */}
      <div 
        className="w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-xl mb-4 transition-transform group-hover:scale-110 z-10"
        style={{ 
          borderColor: store.color_primary,
          backgroundColor: store.logo_url ? 'white' : store.color_primary,
          boxShadow: `0 12px 24px ${store.color_primary}30`
        }}
      >
        {store.logo_url ? (
          <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover rounded-full" />
        ) : (
          <span className="text-3xl font-heading font-black" style={{ color: store.color_text }}>{store.name.charAt(0)}</span>
        )}
      </div>

      <h3 className={`text-xl font-heading font-black mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900 group-hover:text-[#009ea8]'}`}>{store.name}</h3>
      <p className={`text-xs font-body mb-4 ${isDarkMode ? 'text-gray-500' : 'text-slate-500'} line-clamp-2`}>{store.description || 'Tienda oficial con las mejores ofertas verificadas.'}</p>
      
      <div className="flex items-center gap-2 mt-auto">
        <span 
          className="px-3 py-1 rounded-full text-[10px] font-heading font-black uppercase tracking-wider border"
          style={{ 
            backgroundColor: store.color_primary + '15',
            borderColor: store.color_primary + '30',
            color: store.color_primary
          }}
        >
          {store.deal_count || 0} Ofertas
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white/5 text-gray-400 group-hover:bg-[#009ea8] group-hover:text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-[#009ea8] group-hover:text-white'}`}>
           <Plus className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
}

/* ============================================================
   PÁGINA PRINCIPAL
   ============================================================ */
export default function Home() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const PAGE_SIZE = 12;

  const { isDarkMode, setAuthModalOpen, user, setUser, activeFilter, setActiveFilter, categoryFilter, setCategoryFilter, storeFilter, setStoreFilter, activeTab, setActiveTab, setSearchModalOpen, setNewDealModalOpen, setFiltersModalOpen, setSelectedDeal, setDrawerMode, officialStores, setOfficialStores } = useUIStore();
  const supabase = createClient();
  const searchParams = useSearchParams();

  // ── Handle URL Deal Parameter ──────────────────────────────
  useEffect(() => {
    const dealId = searchParams.get('deal');
    if (dealId) {
      const fetchAndOpenDeal = async () => {
        const { data, error } = await supabase
          .from('deals')
          .select('*, profiles!deals_user_id_fkey(username, avatar_url)')
          .eq('id', dealId)
          .single();
        
        if (data && !error) {
          setSelectedDeal(data);
          setDrawerMode('details');
        }
      };
      fetchAndOpenDeal();
    }
  }, [searchParams]);

  // ── Auth listener ──────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user || null));
    return () => subscription.unsubscribe();
  }, []);

  // ── Load Official Stores Cache ──────────────────────────────
  useEffect(() => {
    if (officialStores.length === 0) {
      fetch('/api/admin/stores')
        .then(r => r.json())
        .then(data => {
          if (data.success && data.stores) setOfficialStores(data.stores);
        })
        .catch(() => {});
    }
  }, []);

  const tc = {
    textStrong: isDarkMode ? 'text-white' : 'text-slate-900',
    textMuted: isDarkMode ? 'text-gray-500' : 'text-slate-500',
    actionBtn: isDarkMode
      ? 'bg-[#141414] border border-[#262626] text-gray-400 hover:bg-[#009ea8]/10 hover:text-[#009ea8]'
      : 'bg-white border border-slate-100 text-slate-600 hover:bg-[#e0f2f1] hover:text-[#009ea8]',
    card: isDarkMode ? 'bg-[#141414] border-[#262626]' : 'bg-slate-100 border-slate-200',
    toggleBtn: isDarkMode ? 'bg-[#141414] border-[#262626]' : 'bg-white border-slate-200',
    toggleActive: isDarkMode ? 'bg-[#262626] text-white' : 'bg-slate-800 text-white',
    page: isDarkMode ? 'bg-[#0a0a0a]' : 'bg-[#ebf0f5]',
    searchBar: isDarkMode
      ? 'bg-[#111] border-[#222] text-gray-500 hover:border-[#009ea8]/50 hover:text-[#009ea8]'
      : 'bg-white border-slate-200 text-slate-400 hover:border-[#009ea8]/50 hover:text-[#009ea8]',
    emptyBorder: isDarkMode ? 'border-[#1f1f1f]' : 'border-slate-200',
    footer: isDarkMode ? 'bg-[#0a0a0a] border-white/5 text-white' : 'bg-[#ebf0f5] border-slate-200 text-slate-900',
    kbd: isDarkMode ? 'border-[#333] text-gray-600 bg-[#0a0a0a]' : 'border-slate-200 text-slate-400 bg-slate-50',
  };

  // Detect screen size for layout and ad targeting
  useEffect(() => {
    const checkSize = () => {
      // 1024px is a more standard threshold for mobile/tablet behavior in this layout
      setIsMobile(window.innerWidth < 1024);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(0);
    setDeals([]);
    setHasMore(true);
    fetchDeals(0, true);
  }, [activeFilter, categoryFilter, storeFilter, activeTab]);

  // Handle user logout/login reload
  useEffect(() => {
    if (activeFilter === 'saved' || activeFilter === 'profile') {
      setPage(0);
      setDeals([]);
      setHasMore(true);
      fetchDeals(0, true);
    }
  }, [user?.id]);
  
  // Auto-switch to recommended if consent and prefs exist
  useEffect(() => {
    if (activeFilter === 'home' && activeTab === 'hot' && getCookie('cookie_consent') === 'true') {
      const prefsStr = getCookie('user_preferences');
      if (prefsStr) {
        try {
          const prefs = JSON.parse(prefsStr);
          if (prefs.length > 0) setActiveTab('recommended');
        } catch (e) {}
      }
    }
  }, [activeFilter]);

  async function fetchDeals(pageNumber: number, isInitial: boolean = false) {
    if (activeTab === 'stores') {
      setLoading(false);
      setLoadingMore(false);
      return;
    }
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      let query;

      if (activeFilter === 'saved') {
        if (!user) {
          setDeals([]);
          setHasMore(false);
          setLoading(false);
          return;
        }
        query = supabase
          .from('saved_deals')
          .select('deals(*, profiles!deals_user_id_fkey(username, avatar_url))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
      } else {
        query = supabase.from('deals').select('*, profiles!deals_user_id_fkey(username, avatar_url)');

        // Base filters for public views
        if (activeFilter !== 'profile') {
          query = query.eq('status', 'approved');
          query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
          
          if (categoryFilter) {
            query = query.eq('category', categoryFilter);
          }
          
          if (storeFilter) {
            query = query.ilike('store', `%${storeFilter}%`);
          }
        } else if (activeFilter === 'profile' && user) {
          query = query.eq('user_id', user.id);
        }

        // Apply sorting at DB level for efficiency with secondary sort for Cursor Pagination
        if (activeTab === 'hot') {
          query = query.order('hot_score', { ascending: false }).order('id', { ascending: false });
        } else if (activeTab === 'new') {
          query = query.order('created_at', { ascending: false }).order('id', { ascending: false });
        } else if (activeTab === 'commented') {
          query = query.order('comments_count', { ascending: false }).order('id', { ascending: false });
        } else if (activeTab === 'coupons') {
          query = query.ilike('title', '%cupon%').order('created_at', { ascending: false }).order('id', { ascending: false });
        } else if (activeTab === 'recommended') {
          const prefsStr = getCookie('user_preferences');
          let prefs: string[] = [];
          if (prefsStr) {
            try { prefs = JSON.parse(prefsStr); } catch (e) { prefs = []; }
          }
          
          if (prefs.length > 0) {
            query = query.in('category', prefs).order('created_at', { ascending: false }).order('id', { ascending: false });
          } else {
            // Fallback to hot if no preferences
            query = query.order('hot_score', { ascending: false }).order('id', { ascending: false });
          }
        } else {
          query = query.order('created_at', { ascending: false }).order('id', { ascending: false });
        }
      }

      // Cursor-based Pagination instead of OFFSET/LIMIT
      if (!isInitial && deals.length > 0) {
        const lastDeal = deals[deals.length - 1];

        if (activeFilter === 'saved') {
          // Para saved_deals usamos el offset fallback o simplemente el date (podría haber repetidos si ordenamos por relation, pero mitigamos el problema mayor)
          const from = pageNumber * PAGE_SIZE;
          query = query.range(from, from + PAGE_SIZE - 1);
        } else {
          query = query.limit(PAGE_SIZE);
          if (activeTab === 'hot') {
            const hScore = lastDeal.hot_score || 0;
            query = query.or(`hot_score.lt.${hScore},and(hot_score.eq.${hScore},id.lt.${lastDeal.id})`);
          } else if (activeTab === 'new' || activeTab === 'coupons' || activeFilter === 'profile' || activeFilter === 'category' || activeFilter === 'home') {
            query = query.or(`created_at.lt.${lastDeal.created_at},and(created_at.eq.${lastDeal.created_at},id.lt.${lastDeal.id})`);
          } else if (activeTab === 'commented') {
            const cCount = lastDeal.comments_count || 0;
            query = query.or(`comments_count.lt.${cCount},and(comments_count.eq.${cCount},id.lt.${lastDeal.id})`);
          }
        }
      } else {
        if (activeFilter === 'saved') {
          query = query.range(0, PAGE_SIZE - 1);
        } else {
          query = query.limit(PAGE_SIZE);
        }
      }

      // Pagination range was replaced by Cursor Pagination above
      // const from = pageNumber * PAGE_SIZE;
      // const to = from + PAGE_SIZE - 1;
      // query = query.range(from, to);

      const { data, error } = await query;
      if (error) throw error;

      let newDeals = activeFilter === 'saved'
        ? (data || []).map((d: any) => d.deals).filter(Boolean)
        : (data || []);

      // Procesar deals
      newDeals = newDeals.map((deal: any) => {
        const isCoupon = deal.title?.toLowerCase().includes('cupon') || deal.title?.toLowerCase().includes('cupón') || deal.description?.toLowerCase().includes('código');
        // El hotScore ahora viene directamente desde la DB (pg_cron)
        return { ...deal, hotScore: deal.hot_score || deal.temp || 0, isCoupon };
      });

      if (isInitial) {
        setDeals(newDeals);
      } else {
        setDeals(prev => {
           const combined = [...prev, ...newDeals];
           // Deduplicar por ID para evitar problemas de paginación o duplicados en respuesta
           return Array.from(new Map(combined.map(item => [item['id'], item])).values());
        });
      }

      setHasMore(newDeals.length === PAGE_SIZE);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDeals(nextPage);
  };

  let pageTitle = 'Ofertas Destacadas';
  if (activeFilter === 'saved') pageTitle = 'Ofertas Guardadas';
  else if (activeFilter === 'profile') pageTitle = 'Mis Publicaciones';
  else if (activeTab === 'stores') pageTitle = 'Tiendas Oficiales';
  else if (storeFilter && categoryFilter) pageTitle = `${storeFilter}: ${categoryFilter}`;
  else if (storeFilter) pageTitle = `Tienda: ${storeFilter}`;
  else if (categoryFilter) pageTitle = `Categoría: ${categoryFilter}`;

  // Find the active official store data for the store header
  const activeStoreData = (activeFilter === 'store' || activeFilter === 'category' || activeFilter === 'home') && storeFilter 
    ? officialStores.find((s: any) => s.name.toLowerCase() === storeFilter.toLowerCase())
    : null;

  // Helper to clear all filters
  const clearStoreFilter = () => {
    setStoreFilter(null);
    if (categoryFilter) {
      setActiveFilter('category');
    } else {
      setActiveFilter('home');
    }
  };

  // ── Grid column classes responsive ─────────────────────────
  const gridCols = viewMode === 'grid'
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6'
    : 'grid grid-cols-1 gap-4 sm:gap-5';

  return (
    <div className={`relative min-h-dvh ${tc.page}`}>
      {/* ── Global Modals ── */}
      <Header />
      <Sidebar />
      <DealDrawer />
      <AuthModal />
      <SettingsModal />
      <NewDealWizard />
      <SearchModal />
      <ProfileModal />
      <AdminModal />
      <FiltersModal />
      <ReportModal />

      <MobileNavbar />

      {/* ── Main Content ── */}
      <main className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-[80px] md:pt-[136px] lg:pt-[144px]">


        {/* ── FEED HEADER ROW ── */}
        <div className="flex flex-wrap xl:flex-nowrap items-end justify-between gap-4 sm:gap-6 mb-6 mt-2 md:mt-4">
          {/* Title */}
          <h2 className={`text-xl sm:text-2xl md:text-3xl font-heading font-bold tracking-tight shrink-0 pb-1 ${tc.textStrong}`}>
            {pageTitle}
          </h2>

          {/* Ad Banner - Hidden on mobile, only on XL+ */}
          <div className="hidden xl:flex xl:flex-1 xl:w-auto order-last xl:order-none justify-center overflow-hidden">
            <AdBanner isDarkMode={isDarkMode} />
          </div>

          {/* Controls: Filters + View toggle */}
          <div className="flex items-center gap-2 shrink-0 ml-auto xl:ml-0 pb-0.5">
            <button
              onClick={() => setFiltersModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-heading font-semibold border transition-all btn-effect ${tc.actionBtn}`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filtros</span>
            </button>
            <div className={`flex p-1 rounded-xl border ${tc.toggleBtn}`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors btn-effect ${viewMode === 'grid' ? tc.toggleActive : tc.textMuted}`}
                aria-label="Vista cuadrícula"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors btn-effect ${viewMode === 'list' ? tc.toggleActive : tc.textMuted}`}
                aria-label="Vista lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>


        {/* ── STORE HEADER BANNER ── */}
        {activeStoreData && (
          <div 
            className="mb-6 rounded-3xl border overflow-hidden relative animate-in slide-in-from-bottom-2 duration-300"
            style={{ borderColor: activeStoreData.color_primary + '40' }}
          >
            {/* Background gradient */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{ 
                background: `linear-gradient(135deg, ${activeStoreData.color_primary}, ${activeStoreData.color_secondary || activeStoreData.color_primary}80, transparent)` 
              }}
            />
            <div className={`relative flex items-center gap-5 p-5 sm:p-6 ${isDarkMode ? 'bg-black/40' : 'bg-white/60'} backdrop-blur-sm`}>
              {/* Store Logo */}
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shrink-0 border-[3px] overflow-hidden shadow-xl"
                style={{ 
                  borderColor: activeStoreData.color_primary,
                  backgroundColor: activeStoreData.logo_url ? 'white' : activeStoreData.color_primary,
                  boxShadow: `0 8px 32px ${activeStoreData.color_primary}40`
                }}
              >
                {activeStoreData.logo_url ? (
                  <img src={activeStoreData.logo_url} alt={activeStoreData.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span 
                    className="text-2xl sm:text-3xl font-heading font-black"
                    style={{ color: activeStoreData.color_text }}
                  >
                    {activeStoreData.name.charAt(0)}
                  </span>
                )}
              </div>
              {/* Store Info */}
              <div className="flex-1 min-w-0">
                <h2 className={`text-xl sm:text-2xl font-heading font-black ${tc.textStrong}`}>
                  {activeStoreData.name}
                </h2>
                {activeStoreData.description && (
                  <p className={`text-xs sm:text-sm font-body mt-1 ${tc.textMuted}`}>
                    {activeStoreData.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-heading font-black uppercase tracking-wider border"
                    style={{ 
                      backgroundColor: activeStoreData.color_primary + '15',
                      borderColor: activeStoreData.color_primary + '30',
                      color: activeStoreData.color_primary
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeStoreData.color_primary }} />
                    Tienda Oficial
                  </span>
                  {activeStoreData.deal_count > 0 && (
                    <span className={`text-[10px] font-numbers font-bold ${tc.textMuted}`}>
                      {activeStoreData.deal_count} ofertas activas
                    </span>
                  )}
                </div>
              </div>
              {/* Brand color pill */}
              <div 
                className="hidden sm:flex w-3 h-16 rounded-full shrink-0"
                style={{ 
                  background: `linear-gradient(to bottom, ${activeStoreData.color_primary}, ${activeStoreData.color_secondary || activeStoreData.color_primary})` 
                }}
              />
              <button
                onClick={clearStoreFilter}
                className={`absolute top-3 right-3 p-2 rounded-xl transition-all active:scale-90 ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-slate-600'}`}
                title="Quitar filtro de tienda"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── MAIN LAYOUT: Feed + Sidebar Ad ── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-20 md:mb-12">

          {/* ── DEAL FEED (3/4 on lg+) ── */}
          <section className="w-full lg:w-3/4 flex-1 min-w-0 min-h-[600px]">
            {activeTab === 'stores' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {officialStores.filter(s => s.is_active).map(store => (
                  <StoreDisplayCard 
                    key={store.id} 
                    store={store} 
                    isDarkMode={isDarkMode} 
                    onSelect={() => { 
                      setStoreFilter(store.name); 
                      setActiveFilter('store'); 
                      setActiveTab('hot'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                  />
                ))}
              </div>
            ) : loading ? (
              <div className={gridCols}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <DealSkeleton key={i} viewMode={viewMode} isDarkMode={isDarkMode} />
                ))}
              </div>
            ) : deals.length === 0 ? (
              <div className={`rounded-2xl border border-dashed p-10 sm:p-16 text-center flex flex-col items-center gap-3 ${tc.emptyBorder}`}>
                <div className="w-16 h-16 rounded-2xl bg-[#009ea8]/10 flex items-center justify-center mb-2">
                  <Megaphone className="w-8 h-8 text-[#009ea8]/40" />
                </div>
                <h3 className={`font-heading font-bold text-lg ${tc.textStrong}`}>
                  {activeFilter === 'saved' ? 'No tienes chollos guardados' : 'No hay ofertas todavía'}
                </h3>
                <p className={`font-body text-sm max-w-xs ${tc.textMuted}`}>
                  {activeFilter === 'saved'
                    ? 'Guarda los chollos que más te gusten con el icono 🔖'
                    : 'Sé el primero en compartir un chollo increíble con la comunidad.'
                  }
                </p>
                <button
                  onClick={() => user ? setNewDealModalOpen(true) : setAuthModalOpen(true)}
                  className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-[#009ea8] text-white rounded-xl font-heading font-bold text-sm shadow-md shadow-[#009ea8]/20 hover:-translate-y-0.5 transition-all"
                >
                  <Plus className="w-4 h-4" /> Publicar Chollo
                </button>
              </div>
            ) : (
              <>
                <div className={gridCols}>
                  {deals.map((deal, index) => (
                    <div key={deal.id} className="contents">
                      <DealCard deal={deal} viewMode={viewMode} />
                      {isMobile && (index + 1) % 5 === 0 && (
                        <div className="w-full rounded-2xl border p-4 bg-white dark:bg-[#141414] border-slate-100 dark:border-white/5 overflow-hidden shadow-sm flex flex-col">
                           <div className="flex items-center gap-1.5 opacity-40 mb-3">
                              <Megaphone className="w-3 h-3 text-slate-500 dark:text-gray-400" />
                              <span className="text-[10px] font-heading font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-gray-400">
                                Anuncio
                              </span>
                           </div>
                           <NativeAd isDarkMode={isDarkMode} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* --- PAGINATION CONTROL --- */}
                {hasMore && (
                  <div className="mt-10 mb-10 flex justify-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className={`
                        flex items-center gap-2 px-8 py-3 rounded-2xl font-heading font-bold text-sm transition-all
                        ${isDarkMode
                          ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                          : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'}
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#009ea8]" />
                          Cargando más...
                        </>
                      ) : (
                        'Cargar más ofertas'
                      )}
                    </button>
                  </div>
                )}

                {!hasMore && deals.length > 0 && (
                  <div className="mt-10 mb-20 text-center">
                    <p className={`text-xs font-heading font-bold uppercase tracking-widest ${tc.textMuted} opacity-30`}>
                      Eso es todo por ahora
                    </p>
                  </div>
                )}
              </>
            )}
          </section>

          {/* ── SIDEBAR: TOP (1/4 on lg+) ── */}
          {deals.length > 0 && (
            <aside className="hidden lg:flex flex-col lg:w-1/4 min-w-[320px] gap-6 pb-12">

              <TopDealsWidget deals={deals} type="amount" />
              <TopDealsWidget deals={deals} type="percentage" />

              {/* Publicidad Nativa (Reemplaza al CTA anterior) */}
              <div className={`
                w-full rounded-3xl border flex flex-col items-center justify-center text-center overflow-hidden shadow-xl
                ${isDarkMode
                  ? 'border-white/5 bg-[#111111] shadow-black/40'
                  : 'border-slate-100 bg-white shadow-slate-200/50'}
              `}>
                 <div className="flex items-center gap-1.5 opacity-40 py-2 border-b border-inherit w-full justify-center bg-inherit/50">
                    <Megaphone className={`w-2.5 h-2.5 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`} />
                    <span className={`text-[8px] font-heading font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                      Anuncio
                    </span>
                 </div>
                 <NativeAd isDarkMode={isDarkMode} />
              </div>
            </aside>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
}
