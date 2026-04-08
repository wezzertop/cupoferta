'use client';
import { useUIStore } from '@/lib/store';
import { Menu, Flame, Sun, Moon, Bell, Plus, MessageCircle, Clock, Ticket, LogOut, Search, Settings, CheckCircle2, ShieldCheck, User } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAvatarUrl } from '@/lib/utils';

const colors = { accent: '#009ea8' };
const btnEffect = 'transition-all duration-200 active:scale-95';

export function Header() {
  const { isDarkMode, toggleDarkMode, setSidebarOpen, user, setAuthModalOpen, setNewDealModalOpen, setSearchModalOpen, setProfileModalOpen, setProfileUserId, setProfileTab, activeTab, setActiveTab, setSettingsModalOpen, setSettingsTab, setActiveFilter } = useUIStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine if scrolled enough for background/border change
      setIsScrolled(currentScrollY > 20);

      // Header visibility logic:
      // Always show at the top of the page
      if (currentScrollY < 100) {
        setIsVisible(true);
      } else {
        // Hide if scrolling down more than a small threshold, show if scrolling up
        const diff = currentScrollY - lastScrollY.current;
        if (diff > 5) { // Downward scroll threshold (5px)
          setIsVisible(false);
        } else if (diff < -10) { // Upward scroll threshold (10px)
          setIsVisible(true);
        }
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchModalOpen(true); }
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setIsNotifMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await createClient()
      .from('notifications')
      .select('*, actor_id(username, avatar_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    await createClient().from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
     if (user) fetchNotifications();
  }, [user]);

  const tc = {
    header: isDarkMode
      ? `bg-[#0a0a0a]/95 border-b backdrop-blur-md transition-all duration-300 ${isScrolled ? 'border-[#1a1a1a] shadow-lg shadow-black/20' : 'border-transparent'}`
      : `bg-white border-b transition-all duration-300 ${isScrolled ? 'border-slate-100 shadow-sm' : 'border-transparent'}`,
    textStrong: isDarkMode ? 'text-white' : 'text-slate-900',
    actionBtn: isDarkMode
      ? 'bg-[#141414] border border-[#262626] text-gray-400 hover:bg-[#009ea8]/10 hover:text-[#009ea8] hover:border-[#009ea8]/30'
      : 'bg-white border border-slate-200 text-slate-600 hover:bg-[#e0f2f1] hover:text-[#009ea8] hover:border-[#009ea8]/30',
    tab: isDarkMode ? 'bg-[#0a0a0a]/95 border-t border-[#0f0f0f]' : 'bg-white border-t border-slate-100',
  };

  const handleSignOut = async () => {
    await createClient().auth.signOut();
  };

  const handleProfileClick = (tab: 'deals' | 'saved') => {
    if (!user) { setAuthModalOpen(true); return; }
    setProfileUserId(user.id);
    setProfileTab(tab);
    setProfileModalOpen(true);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${tc.header} ${isVisible ? 'translate-y-0' : '-translate-y-[64px] md:-translate-y-[72px]'}`}>
      {/* ── PRIMARY NAV ROW ── */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 h-[64px] md:h-[72px] max-w-[1400px] mx-auto w-full">

        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`p-2 sm:p-2.5 rounded-xl border ${tc.actionBtn} ${btnEffect}`}
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button 
            onClick={() => { setActiveFilter('home'); setActiveTab('hot'); }}
            className={`flex items-center gap-2 sm:gap-3 group transition-transform active:scale-95`}
          >
            <h1 className={`text-lg sm:text-xl font-heading font-extrabold tracking-tight flex items-center gap-2 ${tc.textStrong}`}>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white shadow-md transition-all group-hover:rotate-12 group-hover:scale-110" style={{ backgroundColor: colors.accent }}>
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </div>
              <span className="hidden sm:inline group-hover:text-[#009ea8] transition-colors">CUPOFERTA</span>
            </h1>
          </button>
        </div>

        {/* Center: Search bar */}
        <button
          onClick={() => setSearchModalOpen(true)}
          className={`hidden sm:flex flex-1 min-w-0 items-center gap-2 px-3 sm:px-4 h-9 sm:h-10 rounded-xl border transition-all group
            ${isDarkMode ? 'bg-[#141414] border-[#222] text-gray-500 hover:text-[#009ea8] hover:border-[#009ea8]/40' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-[#009ea8] hover:border-[#009ea8]/40'}`}
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="text-[13px] font-body flex-1 text-left truncate">Buscar chollos...</span>
          <kbd className={`hidden md:inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${isDarkMode ? 'border-[#333] text-gray-600' : 'border-slate-200 text-slate-400'}`}>⌘K</kbd>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto sm:ml-0">
          <button onClick={() => setSearchModalOpen(true)} className={`sm:hidden p-2 rounded-xl border ${tc.actionBtn} ${btnEffect}`} aria-label="Buscar">
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-xl border transition-all duration-300 ${btnEffect} ${isDarkMode ? 'border-[#262626] bg-[#1a1a1a] text-yellow-400 hover:text-white hover:border-yellow-400/50' : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            aria-label="Cambiar tema"
          >
            {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {user && (
            <div className="relative ml-0.5" ref={notifMenuRef}>
              <button 
                onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
                className={`p-2 rounded-xl border relative ${tc.actionBtn} ${btnEffect} hidden sm:flex ${isNotifMenuOpen ? 'border-[#009ea8] text-[#009ea8] bg-[#009ea8]/5' : ''}`} 
                aria-label="Notificaciones"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold flex items-center justify-center bg-red-500 text-white rounded-full">{unreadCount}</span>}
              </button>
              {isNotifMenuOpen && (
                 <div className="absolute right-0 top-full mt-2 w-80 animate-in fade-in zoom-in-95 duration-200 z-[60]">
                    <div className={`rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[480px] ${isDarkMode ? 'bg-[#141414] border-[#252525]' : 'bg-white border-slate-200'}`}>
                       <div className={`p-4 border-b flex items-center justify-between sticky top-0 bg-inherit z-10 ${isDarkMode ? 'border-[#252525]' : 'border-slate-100'}`}>
                          <h3 className={`font-heading font-black text-sm ${tc.textStrong}`}>Notificaciones</h3>
                          <div className="flex items-center gap-2">
                             <button onClick={() => { setSettingsTab('notifications'); setSettingsModalOpen(true); setIsNotifMenuOpen(false); }} className={`p-1.5 rounded-lg transition-colors ${btnEffect} ${isDarkMode ? 'text-gray-400 hover:text-[#009ea8] hover:bg-white/5' : 'text-slate-500 hover:text-[#009ea8] hover:bg-slate-50'}`} title="Configurar Alertas"><Settings className="w-4 h-4" /></button>
                             {unreadCount > 0 && <button onClick={markAllAsRead} className={`p-1.5 rounded-lg transition-colors ${btnEffect} ${isDarkMode ? 'text-gray-400 hover:text-green-500 hover:bg-green-500/10' : 'text-slate-500 hover:text-green-600 hover:bg-green-50'}`} title="Marcar leídas"><CheckCircle2 className="w-4 h-4" /></button>}
                          </div>
                       </div>
                       <div className="flex-1 overflow-y-auto custom-scrollbar">
                          {notifications.length === 0 ? (
                             <div className={`p-8 text-center text-[12px] font-body ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>No tienes notificaciones.</div>
                          ) : (
                             notifications.map((notif: any) => (
                               <div key={notif.id} className={`p-4 border-b border-inherit hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${!notif.is_read ? (isDarkMode ? 'bg-[#009ea8]/5' : 'bg-[#e0f2f1]/50') : ''}`}>
                                  <div className="flex items-start gap-3">
                                     {notif.type === 'keyword_alert' ? (
                                        <div className="w-9 h-9 rounded-full bg-[#009ea8]/20 flex items-center justify-center shrink-0"><Bell className="w-4 h-4 text-[#009ea8]" /></div>
                                     ) : (
                                        <img src={getAvatarUrl(notif.actor_id?.avatar_url, notif.actor_id?.id || notif.id, notif.actor_id?.updated_at)} alt="Avatar" className="w-9 h-9 rounded-full border border-inherit shrink-0 object-cover" />
                                     )}
                                     <div>
                                        <p className={`text-[12px] font-body leading-relaxed ${tc.textStrong}`}>{notif.content}</p>
                                        <span className={`text-[10px] mt-1 inline-block ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>Hace poco</span>
                                     </div>
                                  </div>
                               </div>
                             ))
                          )}
                       </div>
                    </div>
                 </div>
              )}
            </div>
          )}

          <button
            onClick={() => user ? setNewDealModalOpen(true) : setAuthModalOpen(true)}
            className={`hidden sm:flex items-center gap-2 px-3 sm:px-4 h-9 sm:h-10 rounded-xl text-[12px] sm:text-[13px] font-heading font-bold text-white shadow-md shadow-[#009ea8]/20 hover:brightness-110 active:scale-95 transition-all`}
            style={{ backgroundColor: colors.accent }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">PUBLICAR</span>
          </button>

          {user ? (
            <div className="relative ml-0.5" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl overflow-hidden border-2 shrink-0 ${btnEffect} ${isUserMenuOpen ? 'border-[#009ea8] scale-105 shadow-lg shadow-[#009ea8]/20' : (isDarkMode ? 'border-[#262626]' : 'border-slate-200')}`}
                aria-label="Menú de usuario"
              >
                <img
                  src={getAvatarUrl(user?.user_metadata?.avatar_url, user.id, user.updated_at)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 animate-in fade-in zoom-in-95 duration-200 z-[60]">
                  <div className={`p-2 rounded-2xl border shadow-2xl ${isDarkMode ? 'bg-[#141414] border-[#252525]' : 'bg-white border-slate-200'}`}>
                    <div className={`px-3 py-3 border-b mb-1.5 ${isDarkMode ? 'border-[#252525]' : 'border-slate-100'}`}>
                      <p className={`text-[14px] font-heading font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {user?.user_metadata?.username || user?.email?.split('@')[0] || 'Usuario'}
                      </p>
                      <p className="text-[11px] font-body text-gray-500 truncate mt-0.5">{user?.email}</p>
                    </div>
                    
                    <button
                      onClick={() => { handleProfileClick('deals'); setIsUserMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-heading font-bold transition-all ${btnEffect} ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                      <User className="w-4 h-4 text-[#009ea8]" /> Mi Perfil Público
                    </button>
                    
                    <button
                      onClick={() => { setSettingsTab('profile'); setSettingsModalOpen(true); setIsUserMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-heading font-bold transition-all ${btnEffect} ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                      <Settings className="w-4 h-4 text-gray-400" /> Configuración
                    </button>
                    
                    <div className={`h-px my-1.5 ${isDarkMode ? 'bg-[#252525]' : 'bg-slate-100'}`} />
                    
                    <button
                      onClick={() => { handleSignOut(); setIsUserMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-heading font-bold transition-all ${btnEffect} ${isDarkMode ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'}`}
                    >
                      <LogOut className="w-4 h-4" /> Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className={`px-3 sm:px-4 h-8 sm:h-10 rounded-xl text-[12px] sm:text-[13px] font-heading font-bold transition-all border ${btnEffect} ${isDarkMode ? 'bg-[#141414] border-[#262626] text-gray-300 hover:text-white hover:border-gray-500' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'}`}
            >
              Entrar
            </button>
          )}
        </div>
      </div>

      <div className={`hidden md:block ${tc.tab}`}>
        <div className="flex items-center gap-1 px-4 md:px-6 max-w-[1400px] mx-auto overflow-x-auto hide-scrollbar">
          <TabItem active={activeTab === 'hot'} onClick={() => setActiveTab('hot')} icon={<Flame className="w-3.5 h-3.5" />} label="Más Calientes" isDarkMode={isDarkMode} />
          <TabItem active={activeTab === 'new'} onClick={() => setActiveTab('new')} icon={<Clock className="w-3.5 h-3.5" />} label="Nuevas" isDarkMode={isDarkMode} />
          <TabItem active={activeTab === 'commented'} onClick={() => setActiveTab('commented')} icon={<MessageCircle className="w-3.5 h-3.5" />} label="Comentadas" isDarkMode={isDarkMode} />
          <TabItem active={activeTab === 'coupons'} onClick={() => setActiveTab('coupons')} icon={<Ticket className="w-3.5 h-3.5" />} label="Cupones" isDarkMode={isDarkMode} />
        </div>
      </div>
    </header>
  );
}

const TabItem = ({ icon, label, active, onClick, isDarkMode }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-[12px] sm:text-[13px] font-heading font-bold transition-all whitespace-nowrap active:scale-95 ${
      active
        ? 'border-[#009ea8] text-[#009ea8]'
        : `border-transparent ${isDarkMode ? 'text-gray-500 hover:text-gray-200' : 'text-slate-500 hover:text-slate-800'}`
    }`}
  >
    {icon} {label}
  </button>
);
