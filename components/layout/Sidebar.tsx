'use client';
import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { X, Flame, Plus, Home, Tag, ShoppingBag, Bookmark, BellPlus, User, Settings, LogOut, Gift, ChevronDown, ShieldCheck, MessageCircle, Clock } from 'lucide-react';

const colors = {
  accent: '#009ea8',
};
const btnEffect = "transition-all duration-200 active:scale-95";

export function Sidebar() {
  const { isSidebarOpen, setSidebarOpen, isDarkMode, activeFilter, setActiveFilter, categoryFilter, setCategoryFilter, setNewDealModalOpen, user, setAuthModalOpen, setProfileModalOpen, setProfileUserId, setProfileTab, setAdminModalOpen, setSettingsModalOpen, setSettingsTab } = useUIStore();
  const [isAdmin, setIsAdmin] = useState(false);

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
              isActive={activeFilter === 'home' && !categoryFilter}
              themeClasses={themeClasses}
              onClick={() => { setActiveFilter('home'); setCategoryFilter(null); setSidebarOpen(false); }}
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
                onClick={() => { setCategoryFilter(cat.name); setActiveFilter('category'); setSidebarOpen(false); }}
              />
            ))}
          </div>

          {/* Popular Stores */}
          <div className="space-y-1">
            <p className={`px-3 mb-2 text-[10px] font-black uppercase tracking-widest ${themeClasses.textMuted} opacity-50`}>Tiendas Destacadas</p>
            <SidebarItem icon={<Tag className="w-4 h-4 text-orange-500" />} label="Amazon" themeClasses={themeClasses} onClick={() => {}} />
            <SidebarItem icon={<Tag className="w-4 h-4 text-red-500" />} label="AliExpress" themeClasses={themeClasses} onClick={() => {}} />
            <SidebarItem icon={<Tag className="w-4 h-4 text-blue-500" />} label="Mercado Libre" themeClasses={themeClasses} onClick={() => {}} />
            <SidebarItem icon={<Tag className="w-4 h-4 text-yellow-500" />} label="Walmart" themeClasses={themeClasses} onClick={() => {}} />
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
