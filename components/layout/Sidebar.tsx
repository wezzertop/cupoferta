'use client';
import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { X, Flame, Plus, Home, Tag, ShoppingBag, Bookmark, BellPlus, User, Settings, LogOut, Gift, ChevronDown, ChevronUp, ShieldCheck, MessageCircle, Clock, Store } from 'lucide-react';
import { updatePreferences } from '@/lib/utils';

const colors = {
  accent: '#009ea8',
};
const btnEffect = "transition-all duration-200 active:scale-95";

export function Sidebar() {
  const { isSidebarOpen, setSidebarOpen, isDarkMode, activeFilter, setActiveFilter, categoryFilter, setCategoryFilter, storeFilter, setStoreFilter, activeTab, setActiveTab, setNewDealModalOpen, user, setAuthModalOpen, setProfileModalOpen, setProfileUserId, setProfileTab, setAdminModalOpen, setSettingsModalOpen, setSettingsTab, officialStores, setOfficialStores, setFiltersModalOpen } = useUIStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAllStores, setShowAllStores] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if user is admin in metadata or profiles table
      const checkAdmin = async () => {
        const { data } = await createClient()
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (data?.role === 'admin') setIsAdmin(true);
      };
      checkAdmin();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // Load official stores
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

  const handleProfileClick = (tab: 'deals' | 'saved') => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setProfileUserId(user.id);
    setProfileTab(tab);
    setProfileModalOpen(true);
    setSidebarOpen(false);
  };

  const themeClasses = {
    sidebar: isDarkMode ? 'bg-black/80 backdrop-blur-md border-r border-white/10' : 'bg-white/90 backdrop-blur-md border-r border-slate-100',
    sidebarHover: isDarkMode ? 'hover:bg-[#1f1f1f]' : 'hover:bg-slate-50',
    textMuted: isDarkMode ? 'text-gray-500' : 'text-slate-500',
    textStrong: isDarkMode ? 'text-white' : 'text-slate-900',
  };

  const categories = [
    { name: 'Electrónica', icon: <Tag className="w-4 h-4" /> },
    { name: 'Videojuegos', icon: <Tag className="w-4 h-4" /> },
    { name: 'Moda', icon: <Tag className="w-4 h-4" /> },
    { name: 'Hogar', icon: <Tag className="w-4 h-4" /> },
    { name: 'Supermercado', icon: <Tag className="w-4 h-4" /> },
  ];

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
      <aside
        className={`fixed top-0 left-0 h-full w-[85vw] max-w-[300px] z-[70] transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${themeClasses.sidebar} shadow-2xl flex flex-col drawer-panel`}
        style={{ paddingTop: 'var(--safe-top)', paddingBottom: 'var(--safe-bottom)' }}
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: colors.accent }}>
                <Flame className="w-5 h-5 fill-current" />
             </div>
             <span className={`font-heading font-black tracking-tight text-xl ${themeClasses.textStrong}`}>CUPOFERTA</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className={`p-2 rounded-xl ${themeClasses.sidebarHover} ${themeClasses.textMuted}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-6 custom-scrollbar py-2">
          
          {/* Main Navigation */}
          <div className="space-y-1">
            <p className={`px-3 mb-2 text-[10px] font-black uppercase tracking-widest ${themeClasses.textMuted} opacity-50`}>Descubrir</p>
            <SidebarItem
              icon={<Home className="w-5 h-5" />}
              label="Inicio"
              isActive={activeFilter === 'home' && !categoryFilter && !storeFilter}
              themeClasses={themeClasses}
              onClick={() => { setActiveFilter('home'); setCategoryFilter(null); setStoreFilter(null); setSidebarOpen(false); }}
            />
            <SidebarItem 
              icon={<Flame className="w-5 h-5" />}
              label="Más Calientes"
              themeClasses={themeClasses}
              onClick={() => { setActiveFilter('home'); setSidebarOpen(false); }}
            />
            <SidebarItem 
              icon={<Plus className="w-5 h-5" />}
              label="Nuevas Ofertas"
              themeClasses={themeClasses}
              onClick={() => { setActiveFilter('home'); setSidebarOpen(false); }}
            />
            <SidebarItem 
              icon={<Store className="w-5 h-5" />}
              label="Tiendas Oficiales"
              isActive={activeTab === 'stores'}
              themeClasses={themeClasses}
              onClick={() => { setActiveTab('stores'); setActiveFilter('home'); setSidebarOpen(false); }}
            />
          </div>

          {/* Categories */}
          <div className="space-y-1">
            <p className={`px-3 mb-2 text-[10px] font-black uppercase tracking-widest ${themeClasses.textMuted} opacity-50`}>Categorías</p>
            {categories.map((cat) => (
              <SidebarItem
                key={cat.name}
                icon={cat.icon}
                label={cat.name}
                isActive={categoryFilter === cat.name}
                themeClasses={themeClasses}
                onClick={() => { 
                  setCategoryFilter(cat.name); 
                  setActiveFilter('category'); 
                  setSidebarOpen(false); 
                  updatePreferences(cat.name);
                }}
              />
            ))}
          </div>

          {/* Official Stores */}
          <div className="space-y-1">
            <p className={`px-3 mb-2 text-[10px] font-black uppercase tracking-widest ${themeClasses.textMuted} opacity-50`}>Tiendas Oficiales</p>
            {(() => {
              const activeStores = officialStores.filter(s => s.is_active);
              const VISIBLE_COUNT = 6;
              const visibleStores = showAllStores ? activeStores : activeStores.slice(0, VISIBLE_COUNT);
              const hiddenCount = activeStores.length - VISIBLE_COUNT;
              
              return (
                <>
                  {visibleStores.map(store => (
                    <button
                      key={store.id}
                      onClick={() => { 
                        setStoreFilter(store.name);
                        setActiveFilter('store');
                        setSidebarOpen(false); 
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-heading font-semibold transition-all group active:scale-[0.98] ${
                        storeFilter === store.name
                          ? 'text-white'
                          : `${themeClasses.textMuted} ${themeClasses.sidebarHover}`
                      }`}
                      style={storeFilter === store.name ? { backgroundColor: store.color_primary + '30' } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-5 h-5 rounded-full overflow-hidden border flex items-center justify-center shrink-0"
                          style={{ borderColor: store.color_primary, backgroundColor: store.logo_url ? 'white' : store.color_primary }}
                        >
                          {store.logo_url ? (
                            <img src={store.logo_url} alt="" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span className="text-[7px] font-black" style={{ color: store.color_text }}>
                              {store.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="group-hover:text-inherit">{store.name}</span>
                      </div>
                      <div 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: store.color_primary }}
                      />
                    </button>
                  ))}
                  
                  {/* Toggle button: Ver todas / Ver menos */}
                  {activeStores.length > VISIBLE_COUNT && (
                    <button
                      onClick={() => setShowAllStores(!showAllStores)}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 mt-1 rounded-xl text-[11px] font-heading font-bold transition-all active:scale-[0.98] ${
                        isDarkMode 
                          ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5' 
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 border border-slate-100'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      {showAllStores ? (
                        <>Ver menos <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>Ver todas las tiendas ({activeStores.length}) <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  )}
                </>
              );
            })()}
          </div>

          {/* Help & Support */}
          <div className="space-y-1">
            <p className={`px-3 mb-2 text-[10px] font-black uppercase tracking-widest ${themeClasses.textMuted} opacity-50`}>Ayuda y Soporte</p>
            <SidebarItem icon={<MessageCircle className="w-5 h-5" />} label="Atención al Cliente" themeClasses={themeClasses} onClick={() => {}} />
            <SidebarItem icon={<Clock className="w-5 h-5" />} label="Preguntas Frecuentes" themeClasses={themeClasses} onClick={() => {}} />
            <SidebarItem icon={<Gift className="w-4 h-4 text-purple-500" />} label="CupOferta Pro" themeClasses={themeClasses} onClick={() => {}} />
          </div>

          {/* Legal (Strategic for Mobile) */}
          <div className="space-y-1">
            <p className={`px-3 mb-2 text-[10px] font-black uppercase tracking-widest ${themeClasses.textMuted} opacity-50`}>Políticas</p>
            <SidebarItem icon={<ShieldCheck className="w-4 h-4" />} label="Términos y Condiciones" themeClasses={themeClasses} onClick={() => {}} />
            <SidebarItem icon={<ShieldCheck className="w-4 h-4" />} label="Privacidad y Cookies" themeClasses={themeClasses} onClick={() => {}} />
          </div>

          {/* System */}
          <div className="space-y-1">
            <p className={`px-3 mb-2 text-[10px] font-black uppercase tracking-widest ${themeClasses.textMuted} opacity-50`}>Más</p>
            {isAdmin && (
              <SidebarItem 
                icon={<ShieldCheck className="w-5 h-5 text-red-500" />} 
                label="Panel Moderación" 
                themeClasses={themeClasses} 
                onClick={() => { setAdminModalOpen(true); setSidebarOpen(false); }} 
              />
            )}
            <SidebarItem icon={<Settings className="w-5 h-5" />} label="Configuración" themeClasses={themeClasses} onClick={() => {}} />
            {user && (
              <button
                onClick={async () => { await createClient().auth.signOut(); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-heading font-semibold text-red-400 hover:bg-red-400/5 transition-all mt-1 active:scale-95"
              >
                <LogOut className="w-5 h-5" /> Cerrar Sesión
              </button>
            )}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-4 border-t border-inherit">
           <button
             onClick={() => { setSidebarOpen(false); if (!user) setAuthModalOpen(true); else setNewDealModalOpen(true); }}
             className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-heading font-black text-sm text-white shadow-xl shadow-[#009ea8]/20 ${btnEffect}`}
             style={{ backgroundColor: colors.accent }}
           >
             <Plus className="w-5 h-5" /> Publicar Chollo
           </button>
        </div>
      </aside>
    </>
  );
}

const SidebarItem = ({ icon, label, hasDropdown, themeClasses, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-heading font-semibold transition-all group active:scale-[0.98] ${themeClasses?.textMuted || 'text-gray-500'} ${themeClasses?.sidebarHover || 'hover:bg-[#1f1f1f] text-white'}`}>
    <div className="flex items-center gap-3">
      <span className="group-hover:text-[#009ea8] transition-colors">{icon}</span>
      <span className="group-hover:text-inherit">{label}</span>
    </div>
    {hasDropdown && <ChevronDown className="w-4 h-4 opacity-50" />}
  </button>
);
