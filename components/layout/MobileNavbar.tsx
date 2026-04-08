'use client';
import { Home, Search, Plus, Bookmark, User, Bell, Flame } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

const colors = {
  accent: '#009ea8',
};

export function MobileNavbar() {
  const { 
    isDarkMode, 
    activeFilter, 
    setActiveFilter, 
    setCategoryFilter, 
    setSearchModalOpen, 
    setNewDealModalOpen, 
    user, 
    setAuthModalOpen,
    activeTab,
    setActiveTab,
    setSettingsModalOpen
  } = useUIStore();

  const tc = {
    nav: isDarkMode 
      ? 'bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-xl' 
      : 'bg-white/95 border-t border-slate-100 backdrop-blur-xl',
    icon: (active: boolean) => active 
      ? 'text-[#009ea8]' 
      : (isDarkMode ? 'text-gray-500' : 'text-slate-400'),
    label: (active: boolean) => active 
      ? 'text-[#009ea8] font-black' 
      : (isDarkMode ? 'text-gray-600 font-bold' : 'text-slate-400 font-bold'),
  };

  const handleHomeClick = () => {
    setActiveFilter('home');
    setCategoryFilter(null);
    setActiveTab('hot');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSavedClick = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setActiveFilter('saved');
    setCategoryFilter(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAccountClick = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setSettingsModalOpen(true);
  };

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-[55] sm:hidden flex items-center justify-between px-2 h-[72px] pb-safe transition-all duration-300 ${tc.nav}`}>
      <NavItem 
        icon={<Home className="w-5 h-5" />} 
        label="Inicio" 
        active={activeFilter === 'home' && !activeTab || activeTab === 'hot' && activeFilter === 'home'} 
        onClick={handleHomeClick} 
        tc={tc} 
      />
      
      <NavItem 
        icon={<Search className="w-5 h-5" />} 
        label="Buscar" 
        active={false} 
        onClick={() => setSearchModalOpen(true)} 
        tc={tc} 
      />

      <div className="relative -top-4 px-1">
        <button
          onClick={() => user ? setNewDealModalOpen(true) : setAuthModalOpen(true)}
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#009ea8]/40 transition-all active:scale-90 active:rotate-45"
          style={{ backgroundColor: colors.accent }}
        >
          <Plus className="w-7 h-7" strokeWidth={3} />
        </button>
      </div>

      <NavItem 
        icon={<Bookmark className="w-5 h-5" />} 
        label="Guardados" 
        active={activeFilter === 'saved'} 
        onClick={handleSavedClick} 
        tc={tc} 
      />

      <NavItem 
        icon={<User className="w-5 h-5" />} 
        label="Perfil" 
        active={false} 
        onClick={handleAccountClick} 
        tc={tc} 
      />
    </nav>
  );
}

function NavItem({ icon, label, active, onClick, tc }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center gap-1 h-full py-1 transition-all active:scale-90 relative ${active ? 'z-10' : ''}`}
    >
      <span className={`${tc.icon(active)} transition-all duration-300 ${active ? 'scale-110 -translate-y-0.5' : ''}`}>
        {icon}
      </span>
      <span className={`text-[9px] uppercase tracking-tighter ${tc.label(active)} transition-colors duration-200`}>
        {label}
      </span>
      {active && (
        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#009ea8] animate-in fade-in zoom-in duration-300" />
      )}
    </button>
  );
}
