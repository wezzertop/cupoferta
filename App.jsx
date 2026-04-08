import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Flame, Clock, TrendingUp, Plus, MessageCircle, ExternalLink, 
  User, Bell, Menu, ChevronUp, ChevronDown, Filter, Tag, Share2, 
  LayoutGrid, List as ListIcon, Bookmark, ArrowRight, Eye, Truck, 
  Sun, Moon, X, Zap, Ticket, Star, Settings, HelpCircle, LogOut, 
  Target, Trophy, Users, SlidersHorizontal, ChevronLeft, ImageIcon, 
  Calendar, Store, BellPlus, Send, BarChart3, ChevronRight, Home,
  ShoppingBag, Receipt, PieChart, Wallet, BookOpen, Gift, ShieldCheck, 
  Lock, Mail, UserPlus, CheckCircle
} from 'lucide-react';

// --- CONSTANTES COMPARTIDAS ---
const colors = {
  accent: '#009ea8',
  accentLight: '#e0f2f1',
  accentDark: '#007b83',
};
const btnEffect = "transition-all duration-200 active:scale-95";

// ==========================================
// 1. LANDING PAGE
// ==========================================
const LandingView = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 relative overflow-hidden flex flex-col">
      {/* Efectos de fondo premium */}
      <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-[#009ea8] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse pointer-events-none"></div>
      
      {/* Navbar Landing */}
      <header className="w-full border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer">
             <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md shadow-[#009ea8]/20" style={{ backgroundColor: colors.accent }}>
                <Flame className="w-5 h-5 fill-current" />
             </div>
             <span className="font-heading font-extrabold tracking-tight text-xl text-white">CUPOFERTA</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('app')} className="hidden sm:block text-sm font-heading font-semibold text-gray-400 hover:text-white transition-colors">
              Explorar sin cuenta
            </button>
            <button onClick={() => onNavigate('auth')} className={`px-5 py-2.5 rounded-xl font-heading font-bold text-sm bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all ${btnEffect}`}>
              Iniciar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32 z-10 relative">
        <span className="px-3 py-1 rounded-full border border-[#009ea8]/30 bg-[#009ea8]/10 text-[#009ea8] text-xs font-heading font-bold uppercase tracking-wider mb-8 inline-flex items-center gap-2">
          <Star className="w-3.5 h-3.5" /> La comunidad #1 de ahorradores
        </span>
        <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-white tracking-tight leading-tight max-w-4xl mb-6">
          Nunca más pagues <br className="hidden md:block"/> el <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#009ea8] to-[#00f0ff]">precio completo</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 font-body max-w-2xl mb-10 leading-relaxed">
          Únete a miles de cazadores de chollos profesionales. Descubre errores de precio, cupones exclusivos y las mejores ofertas en tiempo real.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button onClick={() => onNavigate('auth')} className={`px-8 py-4 rounded-xl font-heading font-bold text-base text-white shadow-lg shadow-[#009ea8]/25 hover:-translate-y-1 transition-all flex items-center gap-2`} style={{ backgroundColor: colors.accent }}>
            Crear cuenta gratis <ArrowRight className="w-5 h-5" />
          </button>
          <button onClick={() => onNavigate('app')} className={`px-8 py-4 rounded-xl font-heading font-bold text-base bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2`}>
            Ver ofertas en vivo <Flame className="w-5 h-5 text-orange-500" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-24 pt-12 border-t border-white/5 w-full max-w-4xl">
           <div className="flex flex-col items-center">
              <span className="text-4xl font-numbers font-black text-white mb-1">+50k</span>
              <span className="text-xs font-heading font-bold uppercase tracking-widest text-gray-500">Usuarios Activos</span>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-4xl font-numbers font-black text-white mb-1">$2M</span>
              <span className="text-xs font-heading font-bold uppercase tracking-widest text-gray-500">Ahorro Generado</span>
           </div>
           <div className="flex flex-col items-center col-span-2 md:col-span-1">
              <span className="text-4xl font-numbers font-black text-[#009ea8] mb-1">24/7</span>
              <span className="text-xs font-heading font-bold uppercase tracking-widest text-gray-500">Monitoreo de Precios</span>
           </div>
        </div>
      </main>
    </div>
  );
};

// ==========================================
// 2. AUTH PAGE (Login, Register, Recovery, Terms)
// ==========================================
const AuthView = ({ onNavigate }) => {
  const [authMode, setAuthMode] = useState('login'); // login, register, recovery, terms

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background flare */}
      <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-[#009ea8] rounded-full mix-blend-screen filter blur-[120px] opacity-10 pointer-events-none"></div>

      <button onClick={() => onNavigate('landing')} className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white font-heading font-bold text-sm transition-colors">
        <ChevronLeft className="w-5 h-5" /> Volver al inicio
      </button>

      <div className="w-full max-w-[420px] bg-[#141414] border border-white/5 rounded-2xl shadow-2xl p-8 z-10 relative">
        <div className="flex justify-center mb-8">
           <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#009ea8]/20" style={{ backgroundColor: colors.accent }}>
              <Flame className="w-6 h-6 fill-current" />
           </div>
        </div>

        {/* --- LOGIN VIEW --- */}
        {authMode === 'login' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-heading font-black text-white text-center mb-2">Bienvenido de nuevo</h2>
            <p className="text-sm font-body text-gray-500 text-center mb-8">Inicia sesión para continuar ahorrando</p>
            
            <form onSubmit={(e) => { e.preventDefault(); onNavigate('app'); }} className="space-y-4">
              <div>
                <label className="block text-xs font-heading font-bold text-gray-400 uppercase tracking-wider mb-2">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="email" required className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white font-body text-sm focus:border-[#009ea8] focus:ring-1 focus:ring-[#009ea8] outline-none transition-all" placeholder="tu@email.com" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-heading font-bold text-gray-400 uppercase tracking-wider">Contraseña</label>
                  <button type="button" onClick={() => setAuthMode('recovery')} className="text-xs font-heading font-bold text-[#009ea8] hover:underline">¿Olvidaste tu clave?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="password" required className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white font-body text-sm focus:border-[#009ea8] focus:ring-1 focus:ring-[#009ea8] outline-none transition-all" placeholder="••••••••" />
                </div>
              </div>
              
              <button type="submit" className={`w-full py-3.5 rounded-xl font-heading font-bold text-sm text-white shadow-lg shadow-[#009ea8]/20 hover:-translate-y-0.5 mt-6 flex items-center justify-center gap-2 transition-all`} style={{ backgroundColor: colors.accent }}>
                Ingresar a CupOferta <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-center text-sm font-body text-gray-500 mt-8">
              ¿No tienes una cuenta? <button onClick={() => setAuthMode('register')} className="font-heading font-bold text-white hover:text-[#009ea8] transition-colors ml-1">Regístrate</button>
            </p>
          </div>
        )}

        {/* --- REGISTER VIEW --- */}
        {authMode === 'register' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-heading font-black text-white text-center mb-2">Crea tu cuenta</h2>
            <p className="text-sm font-body text-gray-500 text-center mb-6">Únete a la comunidad de ahorradores</p>
            
            <form onSubmit={(e) => { e.preventDefault(); onNavigate('app'); }} className="space-y-4">
              <div>
                <label className="block text-xs font-heading font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre de Usuario</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" required className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white font-body text-sm focus:border-[#009ea8] outline-none transition-all" placeholder="Ej: CazaOfertasPro" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-heading font-bold text-gray-400 uppercase tracking-wider mb-2">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="email" required className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white font-body text-sm focus:border-[#009ea8] outline-none transition-all" placeholder="tu@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-heading font-bold text-gray-400 uppercase tracking-wider mb-2">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="password" required className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white font-body text-sm focus:border-[#009ea8] outline-none transition-all" placeholder="Crea una contraseña segura" />
                </div>
              </div>
              
              <div className="flex items-start gap-3 mt-4">
                <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-white/10 bg-[#0a0a0a] text-[#009ea8] focus:ring-[#009ea8]" />
                <span className="text-[12px] font-body text-gray-500">
                  Al registrarme, acepto los <button type="button" onClick={() => setAuthMode('terms')} className="text-[#009ea8] hover:underline font-bold">Términos y Condiciones</button> y la Política de Privacidad de CupOferta.
                </span>
              </div>

              <button type="submit" className={`w-full py-3.5 rounded-xl font-heading font-bold text-sm text-white shadow-lg shadow-[#009ea8]/20 hover:-translate-y-0.5 mt-6 transition-all`} style={{ backgroundColor: colors.accent }}>
                Crear Cuenta
              </button>
            </form>

            <p className="text-center text-sm font-body text-gray-500 mt-6">
              ¿Ya tienes cuenta? <button onClick={() => setAuthMode('login')} className="font-heading font-bold text-white hover:text-[#009ea8] transition-colors ml-1">Ingresa aquí</button>
            </p>
          </div>
        )}

        {/* --- RECOVERY VIEW --- */}
        {authMode === 'recovery' && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <h2 className="text-2xl font-heading font-black text-white text-center mb-2">Recuperar acceso</h2>
            <p className="text-sm font-body text-gray-500 text-center mb-6">Te enviaremos un enlace para restaurar tu contraseña.</p>
            
            <form onSubmit={(e) => { e.preventDefault(); setAuthMode('login'); }} className="space-y-4">
              <div>
                <label className="block text-xs font-heading font-bold text-gray-400 uppercase tracking-wider mb-2">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="email" required className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white font-body text-sm focus:border-[#009ea8] outline-none transition-all" placeholder="tu@email.com" />
                </div>
              </div>
              <button type="submit" className={`w-full py-3.5 rounded-xl font-heading font-bold text-sm text-white shadow-lg shadow-[#009ea8]/20 hover:-translate-y-0.5 mt-4 transition-all`} style={{ backgroundColor: colors.accent }}>
                Enviar enlace de recuperación
              </button>
            </form>
            <button onClick={() => setAuthMode('login')} className="w-full mt-6 text-center text-sm font-heading font-bold text-gray-500 hover:text-white transition-colors">
              Cancelar y volver
            </button>
          </div>
        )}

        {/* --- TERMS & CONDITIONS VIEW --- */}
        {authMode === 'terms' && (
          <div className="animate-in zoom-in-95 duration-300">
            <h2 className="text-xl font-heading font-black text-white mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#009ea8]"/> Términos y Condiciones</h2>
            
            <div className="w-full h-48 overflow-y-auto pr-2 bg-[#0a0a0a] rounded-xl border border-white/5 p-4 text-xs font-body text-gray-400 space-y-3 shadow-inner custom-scrollbar">
               <p><strong className="text-white">1. Aceptación:</strong> Al crear una cuenta en CupOferta, aceptas regirte por estas reglas de comunidad.</p>
               <p><strong className="text-white">2. Uso de la plataforma:</strong> CupOferta es una plataforma comunitaria. Está prohibido el spam, la promoción fraudulenta de tiendas propias sin declararlo, o el uso de bots para inflar la temperatura de las ofertas.</p>
               <p><strong className="text-white">3. Publicación de ofertas:</strong> Toda oferta debe ser verificable y tener stock al momento de publicación. La comunidad tiene el derecho de votar en contra (Hielo) si la oferta es falsa o el precio está inflado.</p>
               <p><strong className="text-white">4. Privacidad:</strong> Tus datos de correo no serán compartidos con terceros con fines comerciales sin tu consentimiento explícito.</p>
               <p><strong className="text-white">5. Suspensión:</strong> Nos reservamos el derecho de suspender cuentas que violen reiteradamente estas normativas para mantener la calidad de la plataforma.</p>
            </div>
            
            <button onClick={() => setAuthMode('register')} className={`w-full py-3.5 rounded-xl font-heading font-bold text-sm text-[#009ea8] bg-[#009ea8]/10 hover:bg-[#009ea8]/20 mt-6 transition-all`}>
              Entendido, volver al registro
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


// ==========================================
// 3. MAIN APP (PLATAFORMA INTERNA)
// ==========================================
const MainApp = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('hot');
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Mantenemos el Dark Mode Premium
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [drawerMode, setDrawerMode] = useState('details'); 
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('new');
  const [minDiscount, setMinDiscount] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(5);
  const [visibleVotesCount, setVisibleVotesCount] = useState(6);
  const [activeGalleryImage, setActiveGalleryImage] = useState(0);
  const observerTarget = useRef(null);

  const themeClasses = {
    body: isDarkMode ? 'bg-[#0a0a0a] text-gray-200' : 'bg-[#f8fafc] text-slate-800',
    card: isDarkMode ? 'bg-[#141414] border-white/5' : 'bg-white border-slate-100',
    header: isDarkMode 
      ? (isScrolled ? 'bg-[#0a0a0a]/90 border-b border-white/5 backdrop-blur-md' : 'bg-transparent') 
      : (isScrolled ? 'bg-white/90 border-b border-slate-100 backdrop-blur-md' : 'bg-transparent'),
    sidebar: isDarkMode ? 'bg-[#111111] border-r border-white/5' : 'bg-white border-r border-slate-100',
    sidebarHover: isDarkMode ? 'hover:bg-[#1f1f1f]' : 'hover:bg-slate-50',
    textMuted: isDarkMode ? 'text-gray-500' : 'text-slate-500',
    textDesc: isDarkMode ? 'text-gray-400' : 'text-slate-600',
    textStrong: isDarkMode ? 'text-white' : 'text-slate-900',
    actionBtn: isDarkMode 
      ? 'bg-[#141414] border border-white/5 text-gray-400 hover:bg-[#009ea8]/10 hover:text-[#009ea8] hover:border-[#009ea8]/30' 
      : 'bg-white border border-slate-100 text-slate-600 hover:bg-[#e0f2f1] hover:text-[#009ea8] hover:border-[#009ea8]/30',
    voteBg: isDarkMode ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-slate-100',
    arrowBg: isDarkMode ? 'bg-[#111111] text-gray-500 hover:text-white' : 'bg-slate-50 text-slate-500 hover:text-slate-800',
    imgContainer: isDarkMode ? 'bg-[#0f0f0f]' : 'bg-slate-50/50',
    banner: isDarkMode ? 'bg-[#141414]/50 border-white/5' : 'bg-slate-50 border-slate-200'
  };

  const mockDeals = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    title: i % 2 === 0 ? "Sony PlayStation 5 Slim 1TB + Juego Exclusivo de Regalo" : "Apple MacBook Air M2 13\" 256GB - Oferta Prime Limitada",
    description: "Excelente oportunidad para adquirir lo último en tecnología a un precio imbatible. Existencias limitadas, aprovecha antes de que se agote. Este producto incluye garantía completa por 12 meses directamente con el fabricante. Compra ahora y asegúrate de llevarte el mejor precio histórico.",
    price: i % 2 === 0 ? 8499 : 17500,
    oldPrice: i % 2 === 0 ? 11999 : 21999,
    store: i % 2 === 0 ? "Amazon" : "Mercado Libre",
    category: "Gaming",
    temp: 450 + (i * 100),
    comments: 24 + i,
    views: 5200 + (i * 800),
    shipping: { type: 'free', label: 'Envío gratis' },
    author: { name: `CazaOfertas_${i}`, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}` },
    image: `https://images.unsplash.com/photo-${1600000000000 + i * 10000}?w=400&h=400&fit=crop&q=80`,
    link: "https://www.google.com/search?q=oferta",
    gallery: [
      `https://images.unsplash.com/photo-${1600000000000 + i * 10000}?w=400&h=400&fit=crop&q=80`,
      `https://images.unsplash.com/photo-${1600000000000 + i * 10000 + 100}?w=400&h=400&fit=crop&q=80`,
      `https://images.unsplash.com/photo-${1600000000000 + i * 10000 + 200}?w=400&h=400&fit=crop&q=80`,
    ],
    time: `hace ${i + 1}h`,
    timestamp: Date.now() - (i * 3600000),
    upvotes: Array.from({ length: Math.floor(Math.random() * 20) + 12 }).map((_, j) => ({
      name: `ProShopper_${j}`, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Up${i}${j}`
    })),
    downvotes: Array.from({ length: Math.floor(Math.random() * 8) + 4 }).map((_, j) => ({
      name: `Usuario_${j}`, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Down${i}${j}`
    })),
    commentsList: Array.from({ length: Math.floor(Math.random() * 25) + 8 }).map((_, j) => ({
      id: j + 1, 
      user: `Ahorrador_${j}`, 
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Caz${i}${j}`, 
      text: j % 2 === 0 ? '¡Excelente precio! Llevaba meses monitoreando este producto y por fin bajó.' : '¿Alguien sabe si aplica meses sin intereses con alguna tarjeta?', 
      time: `hace ${Math.floor(Math.random() * 50) + 1}m`
    }))
  }));

  const filteredAndSortedDeals = useMemo(() => {
    let result = [...mockDeals];
    if (searchQuery) {
      result = result.filter(deal => 
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        deal.store.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [searchQuery, mockDeals]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setTimeout(() => {
            if (drawerMode === 'votes') setVisibleVotesCount(prev => prev + 6);
            if (drawerMode === 'chat') setVisibleCommentsCount(prev => prev + 5);
          }, 300);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [drawerMode, selectedDeal]);

  const openDrawer = (deal, mode = 'details') => {
    setDrawerMode(mode);
    setSelectedDeal(deal);
    setIsSidebarOpen(false);
    setIsDescExpanded(false); 
    setVisibleCommentsCount(5); 
    setVisibleVotesCount(6);
    setActiveGalleryImage(0); 
  };

  return (
    <div className={`min-h-screen antialiased transition-colors duration-300 overflow-x-hidden ${themeClasses.body}`}>

      {/* Overlays */}
      {(isSidebarOpen || selectedDeal) && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[60] transition-opacity" onClick={() => { setIsSidebarOpen(false); setSelectedDeal(null); }} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 h-full w-[280px] z-[70] transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${themeClasses.sidebar} shadow-2xl flex flex-col`}>
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md" style={{ backgroundColor: colors.accent }}>
                <Flame className="w-5 h-5 fill-current" />
             </div>
             <span className={`font-heading font-extrabold tracking-tight text-xl ${themeClasses.textStrong}`}>CUPOFERTA</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className={`p-1.5 rounded-lg ${themeClasses.sidebarHover} ${themeClasses.textMuted}`}><X className="w-5 h-5" /></button>
        </div>

        <div className="px-4 pb-4 border-b border-inherit">
           <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-heading font-bold text-sm transition-all ${isDarkMode ? 'bg-[#262626] text-white hover:bg-[#333333]' : 'bg-slate-800 text-white hover:bg-slate-900'}`}>
              <Plus className="w-4 h-4" /> Nueva Oferta
           </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
           <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 cursor-pointer transition-colors ${isDarkMode ? 'bg-[#1a1a1a] text-[#009ea8]' : 'bg-[#e0f2f1] text-[#009ea8]'}`}>
              <Home className="w-5 h-5" />
              <span className="font-heading font-semibold text-sm">Inicio</span>
           </div>
           <SidebarItem icon={<Tag className="w-5 h-5" />} label="Categorías" hasDropdown themeClasses={themeClasses} />
           <SidebarItem icon={<ShoppingBag className="w-5 h-5" />} label="Mis Compras" hasDropdown themeClasses={themeClasses} />
           <SidebarItem icon={<Bookmark className="w-5 h-5" />} label="Guardados" themeClasses={themeClasses} />
           <SidebarItem icon={<BellPlus className="w-5 h-5" />} label="Alertas" themeClasses={themeClasses} />
           
           <div className="my-4 border-t border-inherit"></div>
           
           <SidebarItem icon={<User className="w-5 h-5" />} label="Mi Perfil" themeClasses={themeClasses} />
           <SidebarItem icon={<Settings className="w-5 h-5" />} label="Configuración" themeClasses={themeClasses} />
           
           {/* BOTÓN PARA CERRAR SESIÓN Y VOLVER AL LANDING */}
           <button onClick={() => onNavigate('landing')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-heading font-semibold transition-all group text-red-400 hover:bg-red-400/10 mt-2`}>
              <LogOut className="w-5 h-5" /> Cerrar Sesión
           </button>
        </div>

        <div className="p-4 border-t border-inherit">
           <button className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-heading font-bold text-sm text-white shadow-lg ${btnEffect}`} style={{ backgroundColor: colors.accent }}>
              <Gift className="w-4 h-4" /> Refiere y Gana $1.500
           </button>
        </div>
      </aside>

      {/* DRAWER DERECHO */}
      <aside className={`fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-[45%] z-[70] transition-transform duration-500 transform ease-in-out ${selectedDeal ? 'translate-x-0' : 'translate-x-full'} ${themeClasses.sidebar} shadow-2xl flex flex-col`}>
        {selectedDeal && (
          <>
            <div className="p-4 border-b border-inherit flex items-center justify-between sticky top-0 bg-inherit z-10">
              <div className="flex items-center gap-3 overflow-hidden">
                 <button onClick={() => setSelectedDeal(null)} className={`p-2 rounded-xl flex-shrink-0 ${themeClasses.sidebarHover} ${themeClasses.textMuted}`}><ChevronRight className="w-5 h-5" /></button>
                 <div className={`flex p-1 rounded-xl border overflow-x-auto hide-scrollbar ${isDarkMode ? 'bg-[#141414] border-[#262626]' : 'bg-slate-100 border-slate-200'}`}>
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
                          <div className={`w-full aspect-square rounded-xl overflow-hidden border flex items-center justify-center p-6 transition-all ${isDarkMode ? 'bg-[#141414] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                             <img src={selectedDeal.gallery[activeGalleryImage]} className="w-full h-full object-contain animate-in fade-in duration-300" alt={selectedDeal.title} />
                          </div>
                          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1">
                             {selectedDeal.gallery.map((img, idx) => (
                                <button key={idx} onClick={() => setActiveGalleryImage(idx)} className={`w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${activeGalleryImage === idx ? 'border-[#009ea8] opacity-100' : `${isDarkMode ? 'border-transparent' : 'border-slate-100'} opacity-50 hover:opacity-100`}`}>
                                   <img src={img} className="w-full h-full object-cover" alt={`Miniatura ${idx}`} />
                                </button>
                             ))}
                          </div>
                       </div>
                       <div className="flex-1 space-y-4">
                          <span className="bg-[#009ea8]/10 text-[#009ea8] text-[11px] font-heading font-bold px-2.5 py-1 rounded-lg tracking-wide inline-block">{selectedDeal.store}</span>
                          <h2 className={`text-2xl md:text-[28px] font-heading font-bold leading-tight ${themeClasses.textStrong}`}>{selectedDeal.title}</h2>
                          <div className={`flex flex-wrap items-center justify-between gap-3 py-3 border-y ${isDarkMode ? 'border-[#262626]' : 'border-slate-200'}`}>
                             <div className="flex items-center gap-3">
                                <img src={selectedDeal.author.avatar} alt="Autor" className={`w-9 h-9 rounded-full border ${isDarkMode ? 'border-[#333333]' : 'border-slate-200'}`} />
                                <div className="flex flex-col">
                                   <span className={`text-[13px] font-heading font-bold ${themeClasses.textStrong}`}>{selectedDeal.author.name}</span>
                                   <span className={`text-[11px] font-body font-medium ${themeClasses.textMuted}`}>{selectedDeal.time}</span>
                                </div>
                             </div>
                             <div className={`flex items-center gap-1.5 border px-2.5 py-1.5 rounded-lg text-[10px] font-heading font-bold text-[#009ea8] uppercase tracking-wider ${isDarkMode ? 'border-[#262626] bg-[#141414]' : 'border-slate-200 bg-slate-50'}`}>
                                <Truck className="w-3.5 h-3.5" /> {selectedDeal.shipping.label}
                             </div>
                          </div>
                          <div className="pt-1 flex items-center gap-3 flex-wrap">
                             <span className={`text-4xl md:text-5xl font-numbers font-black ${themeClasses.textStrong}`}>${selectedDeal.price.toLocaleString()}</span>
                             <span className={`text-lg font-numbers font-bold line-through decoration-red-400/80 decoration-2 opacity-60 ${themeClasses.textMuted}`}>${selectedDeal.oldPrice.toLocaleString()}</span>
                             <span className="px-2.5 py-1 rounded-md text-xs font-numbers font-extrabold bg-[#e0f2f1] text-[#009ea8] dark:bg-[#009ea8]/20 dark:text-[#009ea8]">- {Math.round((1 - selectedDeal.price/selectedDeal.oldPrice) * 100)}%</span>
                          </div>
                          <div className="flex items-center gap-4 py-2">
                             <div className={`flex items-center justify-between px-2 py-1.5 rounded-xl border shadow-sm transition-colors w-[130px] ${themeClasses.voteBg}`}>
                               <button className={`rounded-lg p-1.5 transition-colors ${themeClasses.arrowBg} active:scale-95`}><ChevronDown className="w-4 h-4" /></button>
                               <span className="font-numbers font-bold text-[16px]" style={{ color: colors.accent }}>{selectedDeal.temp}°</span>
                               <button className={`rounded-lg p-1.5 transition-colors ${themeClasses.arrowBg} active:scale-95`}><ChevronUp className="w-4 h-4" /></button>
                             </div>
                             <span className={`text-[12px] font-heading font-bold uppercase tracking-wider ${themeClasses.textMuted}`}>¡Vota esta oferta!</span>
                          </div>
                          <div className="pt-2">
                             <a 
                               href={selectedDeal.link || '#'} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="w-full bg-[#009ea8] text-white h-12 md:h-14 rounded-xl font-heading font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#009ea8]/20 hover:-translate-y-0.5 transition-all"
                             >
                                Ver Oferta <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                             </a>
                          </div>
                       </div>
                    </div>
                    <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-[#111111]' : 'bg-slate-50'}`}>
                      <h3 className={`font-heading font-bold text-lg mb-3 ${themeClasses.textStrong}`}>Acerca de esta oferta</h3>
                      <div className={`text-[14px] font-body leading-relaxed ${themeClasses.textDesc}`}>
                        <p className={!isDescExpanded ? "line-clamp-3" : ""}>{selectedDeal.description}</p>
                        {selectedDeal.description.length > 100 && (
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
                          <div className={`p-5 rounded-2xl border transition-colors ${isDarkMode ? 'bg-[#141414] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'}`}>
                             <div className="flex items-center gap-2 mb-3">
                                <Eye className="w-5 h-5 text-blue-500" />
                                <span className={`text-[11px] font-heading font-bold uppercase tracking-wider ${themeClasses.textMuted}`}>Vistas únicas</span>
                             </div>
                             <div className={`text-3xl font-numbers font-black tracking-tight ${themeClasses.textStrong}`}>{selectedDeal.views.toLocaleString()}</div>
                          </div>
                          <div className={`p-5 rounded-2xl border transition-colors ${isDarkMode ? 'bg-[#141414] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'}`}>
                             <div className="flex items-center gap-2 mb-3">
                                <Flame className="w-5 h-5 text-orange-500" />
                                <span className={`text-[11px] font-heading font-bold uppercase tracking-wider ${themeClasses.textMuted}`}>Temperatura</span>
                             </div>
                             <div className={`text-3xl font-numbers font-black tracking-tight ${themeClasses.textStrong}`}>{selectedDeal.temp}°</div>
                          </div>
                       </div>
                       <div className={`mt-4 p-8 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center ${isDarkMode ? 'bg-[#141414]/50 border-[#333333]' : 'bg-slate-50 border-slate-200'}`}>
                          <BarChart3 className={`w-8 h-8 mb-3 opacity-20 ${themeClasses.textMuted}`} />
                          <span className={`text-[12px] font-heading font-bold uppercase tracking-wider ${themeClasses.textMuted}`}>Gráficos de rendimiento próximamente</span>
                       </div>
                    </div>
                 </div>
               )}

               {drawerMode === 'votes' && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div>
                       <div className="flex items-center justify-between mb-4">
                          <h3 className={`text-lg font-heading font-bold ${themeClasses.textStrong}`}>Registro de Votaciones</h3>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#141414] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'}`}>
                             <div className="flex items-center justify-between mb-4 pb-2 border-b border-inherit">
                                <span className="font-heading font-bold text-emerald-500 flex items-center gap-1.5"><ChevronUp className="w-4 h-4"/> A favor</span>
                                <span className={`text-[11px] font-numbers font-bold px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-[#262626] text-white' : 'bg-slate-100 text-slate-700'}`}>{selectedDeal.upvotes.length}</span>
                             </div>
                             <div className="space-y-3">
                                {selectedDeal.upvotes.slice(0, visibleVotesCount).map((user, idx) => (
                                   <div key={idx} className="flex items-center gap-2.5 animate-in fade-in duration-300">
                                      <img src={user.avatar} alt={user.name} className={`w-6 h-6 rounded-full border ${isDarkMode ? 'border-[#333333]' : 'border-slate-200'}`} />
                                      <span className={`text-[12px] font-body font-medium truncate ${themeClasses.textStrong}`}>{user.name}</span>
                                   </div>
                                ))}
                             </div>
                          </div>
                          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#141414] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'}`}>
                             <div className="flex items-center justify-between mb-4 pb-2 border-b border-inherit">
                                <span className="font-heading font-bold text-red-400 flex items-center gap-1.5"><ChevronDown className="w-4 h-4"/> En contra</span>
                                <span className={`text-[11px] font-numbers font-bold px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-[#262626] text-white' : 'bg-slate-100 text-slate-700'}`}>{selectedDeal.downvotes.length}</span>
                             </div>
                             <div className="space-y-3">
                                {selectedDeal.downvotes.slice(0, visibleVotesCount).map((user, idx) => (
                                   <div key={idx} className="flex items-center gap-2.5 animate-in fade-in duration-300">
                                      <img src={user.avatar} alt={user.name} className={`w-6 h-6 rounded-full border ${isDarkMode ? 'border-[#333333]' : 'border-slate-200'}`} />
                                      <span className={`text-[12px] font-body font-medium truncate ${themeClasses.textStrong}`}>{user.name}</span>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                       {(visibleVotesCount < selectedDeal.upvotes.length || visibleVotesCount < selectedDeal.downvotes.length) && (
                          <div ref={observerTarget} className="flex items-center justify-center pt-8 pb-4">
                             <div className="w-6 h-6 border-2 border-[#009ea8] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                       )}
                    </div>
                 </div>
               )}

               {drawerMode === 'chat' && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div>
                       <div className="flex items-center justify-between mb-4">
                          <h3 className={`text-lg font-heading font-bold ${themeClasses.textStrong}`}>Chat de la comunidad</h3>
                          <span className={`text-[11px] font-numbers font-bold px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-[#262626] text-white' : 'bg-slate-100 text-slate-700'}`}>{selectedDeal.commentsList.length} Mensajes</span>
                       </div>
                       <div className="space-y-4">
                          {selectedDeal.commentsList.slice(0, visibleCommentsCount).map(c => (
                            <div key={c.id} className={`p-4 rounded-2xl border ${themeClasses.card} shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                               <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <img src={c.avatar} className={`w-7 h-7 rounded-full border ${isDarkMode ? 'border-[#333333]' : 'border-slate-200'}`} alt="avatar"/>
                                    <span className={`text-[13px] font-heading font-bold ${themeClasses.textStrong}`}>{c.user}</span>
                                  </div>
                                  <span className={`text-[11px] font-body font-medium ${themeClasses.textMuted}`}>{c.time}</span>
                               </div>
                               <p className={`text-[13px] font-body leading-relaxed mt-1 ${themeClasses.textDesc}`}>{c.text}</p>
                            </div>
                          ))}
                       </div>
                       {visibleCommentsCount < selectedDeal.commentsList.length && (
                          <div ref={observerTarget} className="flex items-center justify-center pt-8 pb-4">
                             <div className="w-6 h-6 border-2 border-[#009ea8] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                       )}
                    </div>
                 </div>
               )}
            </div>
          </>
        )}
      </aside>

      {/* HEADER PRINCIPAL */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${themeClasses.header}`}>
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between max-w-7xl h-16 md:h-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className={`p-2.5 rounded-xl border ${themeClasses.actionBtn} ${btnEffect}`}><Menu className="w-5 h-5" /></button>
            <h1 className={`text-xl font-heading font-extrabold tracking-tight flex items-center gap-2.5 cursor-pointer ${themeClasses.textStrong}`}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md shadow-[#009ea8]/20" style={{ backgroundColor: colors.accent }}>
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <span className="hidden sm:inline">CUPOFERTA</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-xl border transition-all duration-300 ${isDarkMode ? 'border-[#262626] text-yellow-400 hover:bg-[#1f1f1f]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className={`p-2 rounded-xl border relative ${themeClasses.actionBtn} ${btnEffect}`}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#0a0a0a]"></span>
            </button>
            <button className={`hidden sm:flex items-center gap-2 px-4 h-10 rounded-xl text-[13px] font-heading font-bold text-white shadow-md shadow-[#009ea8]/20 ${btnEffect}`} style={{ backgroundColor: colors.accent }}>
              <Plus className="w-4 h-4" /> PUBLICAR
            </button>
            <div className={`w-10 h-10 bg-slate-200 rounded-xl overflow-hidden border cursor-pointer ml-1 ${isDarkMode ? 'border-[#262626]' : 'border-slate-200'}`}>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
            </div>
          </div>
        </div>
        <div className={`w-full border-t ${isDarkMode ? 'border-[#262626] bg-[#0a0a0a]/95' : 'border-slate-200 bg-white/95'} backdrop-blur-md hidden md:block`}>
          <div className="container mx-auto px-6 max-w-7xl flex items-center gap-6">
             <TabItem active={activeTab === 'hot'} onClick={() => setActiveTab('hot')} icon={<Flame className="w-4 h-4" />} label="Hot" isDarkMode={isDarkMode} />
             <TabItem active={activeTab === 'new'} onClick={() => setActiveTab('new')} icon={<Clock className="w-4 h-4" />} label="Nuevas" isDarkMode={isDarkMode} />
             <TabItem active={activeTab === 'commented'} onClick={() => setActiveTab('commented')} icon={<MessageCircle className="w-4 h-4" />} label="Más Comentadas" isDarkMode={isDarkMode} />
             <TabItem active={activeTab === 'coupons'} onClick={() => setActiveTab('coupons')} icon={<Ticket className="w-4 h-4" />} label="Cupones" isDarkMode={isDarkMode} />
          </div>
        </div>
      </header>

      {/* FEED PRINCIPAL */}
      <main className="container mx-auto px-4 md:px-6 pt-32 md:pt-40 pb-20 max-w-[1200px]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <h2 className={`text-2xl md:text-3xl font-heading font-bold tracking-tight whitespace-nowrap ${themeClasses.textStrong}`}>
             {activeTab === 'hot' ? 'Ofertas Destacadas' : activeTab === 'new' ? 'Recién Añadidas' : 'Explorar Ofertas'}
          </h2>
          <div className={`hidden md:flex flex-1 max-w-xl h-[52px] mx-4 items-center justify-center rounded-xl border border-dashed transition-all ${themeClasses.banner} opacity-50 hover:opacity-100 cursor-pointer group`}>
               <div className="flex items-center gap-3">
                 <ImageIcon className={`w-4 h-4 ${themeClasses.textMuted} group-hover:text-[#009ea8] transition-colors`} />
                 <span className={`text-[10px] font-heading font-bold uppercase tracking-[0.2em] ${themeClasses.textMuted} group-hover:text-[#009ea8] transition-colors`}>Banner Publicitario</span>
               </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto flex-shrink-0">
            <button className={`p-2.5 rounded-xl flex items-center gap-2 text-[12px] font-heading font-semibold border transition-all ${themeClasses.actionBtn}`}>
              <SlidersHorizontal className="w-4 h-4" /> Filtros
            </button>
            <div className={`flex p-1 rounded-xl shadow-sm border transition-colors ${isDarkMode ? 'bg-[#141414] border-[#262626]' : 'bg-white border-slate-200'}`}>
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? (isDarkMode ? 'bg-[#262626] text-white' : 'bg-slate-800 text-white') : themeClasses.textMuted}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? (isDarkMode ? 'bg-[#262626] text-white' : 'bg-slate-800 text-white') : themeClasses.textMuted}`}><ListIcon className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6"}>
          {filteredAndSortedDeals.map((deal) => (
            <div 
              key={deal.id}
              className={`rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 flex overflow-hidden cursor-pointer group/card ${themeClasses.card} ${viewMode === 'list' ? 'flex-row' : 'flex-col'}`}
              onClick={() => openDrawer(deal, 'details')}
            >
              <div className={`relative flex flex-col flex-shrink-0 transition-colors ${themeClasses.imgContainer} ${viewMode === 'list' ? 'w-[140px] sm:w-[170px] p-3 border-r border-inherit justify-between' : 'w-full p-4 border-b border-inherit items-center'}`}>
                <div className={`relative w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center border shadow-sm transition-colors ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-white'}`}>
                    <div className="w-full h-full p-2">
                       <img src={deal.image} alt="" className="w-full h-full object-contain transition-transform duration-700 group-hover/card:scale-110" />
                    </div>
                    <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md text-[9px] font-heading font-extrabold uppercase tracking-wider text-[#111727] shadow-sm border border-slate-200/60">
                      {deal.store}
                    </div>
                </div>
                <div className={`flex items-center justify-between w-full mt-3 px-1.5 py-1.5 rounded-lg border shadow-sm transition-colors ${themeClasses.voteBg}`}>
                  <button onClick={(e) => { e.stopPropagation(); }} className={`rounded-md p-1 transition-colors ${themeClasses.arrowBg} ${btnEffect}`}><ChevronUp className="w-4 h-4" /></button>
                  <span className="font-numbers font-extrabold text-[14px] mx-1" style={{ color: colors.accent }}>{deal.temp}°</span>
                  <button onClick={(e) => { e.stopPropagation(); }} className={`rounded-md p-1 transition-colors ${themeClasses.arrowBg} ${btnEffect}`}><ChevronDown className="w-4 h-4" /></button>
                </div>
              </div>

              <div className={`flex-1 flex flex-col justify-between ${viewMode === 'list' ? 'p-3.5 sm:p-4' : 'p-4 sm:p-5'}`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img src={deal.author.avatar} alt="" className={`w-5 h-5 rounded-full border ${isDarkMode ? 'border-[#262626]' : 'border-slate-200'}`} />
                      <span className={`text-[11px] font-body font-medium ${themeClasses.textMuted}`}>{deal.author.name}</span>
                    </div>
                    <span className={`text-[11px] font-body font-medium ${themeClasses.textMuted}`}>{deal.time}</span>
                  </div>
                  <h3 className={`font-heading font-bold mb-1.5 leading-snug transition-colors text-lg line-clamp-2 ${themeClasses.textStrong} group-hover/card:text-[#009ea8]`}>{deal.title}</h3>
                  <p className={`text-[13px] mb-3 line-clamp-2 font-body leading-relaxed ${themeClasses.textDesc}`}>{deal.description}</p>
                  <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                    <span className={`text-2xl font-numbers font-black ${themeClasses.textStrong}`}>${deal.price.toLocaleString()}</span>
                    <span className={`text-sm font-numbers font-bold line-through decoration-red-400 decoration-2 opacity-60 ${themeClasses.textMuted}`}>${deal.oldPrice.toLocaleString()}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-numbers font-extrabold bg-[#e0f2f1] text-[#009ea8] dark:bg-[#009ea8]/20 dark:text-[#009ea8]">- {Math.round((1 - deal.price/deal.oldPrice) * 100)}%</span>
                    <div className={`flex items-center gap-1.5 border px-2 py-1 rounded-md text-[9px] font-heading font-bold text-[#009ea8] uppercase tracking-wider ml-auto ${isDarkMode ? 'border-[#262626] bg-[#141414]' : 'border-slate-200 bg-slate-50'}`}><Truck className="w-3 h-3" /> {deal.shipping.label}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-inherit">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <button onClick={(e) => { e.stopPropagation(); openDrawer(deal, 'chat'); }} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${themeClasses.actionBtn}`}>
                      <MessageCircle className="w-4 h-4" /> <span className="text-[12px] font-numbers font-bold">{deal.comments}</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); openDrawer(deal, 'metrics'); }} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${themeClasses.actionBtn}`}>
                      <Eye className="w-4 h-4" /> <span className="text-[12px] font-numbers font-bold">{deal.views >= 1000 ? `${(deal.views/1000).toFixed(1)}k` : deal.views}</span>
                    </button>
                    <button onClick={(e) => e.stopPropagation()} className={`px-2.5 py-1.5 rounded-lg transition-all hidden sm:flex ${themeClasses.actionBtn}`}><Share2 className="w-4 h-4" /></button>
                    <button onClick={(e) => e.stopPropagation()} className={`px-2.5 py-1.5 rounded-lg transition-all hidden sm:flex ${themeClasses.actionBtn}`}><Bookmark className="w-4 h-4" /></button>
                  </div>
                  <a 
                    href={deal.link || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`text-white px-4 md:px-5 py-2 rounded-lg font-heading font-bold text-[11px] md:text-[12px] flex items-center justify-center gap-2 shadow-md shadow-[#009ea8]/20 hover:-translate-y-0.5 transition-transform ml-2`} 
                    style={{ backgroundColor: colors.accent }}
                  >
                    Ver Oferta <ExternalLink className="w-3.5 h-3.5 hidden sm:inline" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

// Componentes Auxiliares
const TabItem = ({ icon, label, active, onClick, isDarkMode }) => (
  <button onClick={onClick} className={`flex items-center gap-2 py-4 border-b-2 text-[13px] font-heading font-bold transition-all ${active ? 'border-[#009ea8] text-[#009ea8]' : `border-transparent ${isDarkMode ? 'text-gray-500 hover:text-gray-200' : 'text-slate-500 hover:text-slate-800'}`}`}>
    {icon} {label}
  </button>
);

const SidebarItem = ({ icon, label, hasDropdown, themeClasses, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-heading font-semibold transition-all group ${themeClasses?.textMuted || 'text-gray-500'} ${themeClasses?.sidebarHover || 'hover:bg-[#1f1f1f]'}`}>
    <div className="flex items-center gap-3">
      <span className="group-hover:text-[#009ea8] transition-colors">{icon}</span>
      <span className="group-hover:text-inherit">{label}</span>
    </div>
    {hasDropdown && <ChevronDown className="w-4 h-4 opacity-50" />}
  </button>
);


// ==========================================
// CONTROLADOR PRINCIPAL (ROUTER)
// ==========================================
export default function App() {
  const [currentRoute, setCurrentRoute] = useState('landing'); // 'landing', 'auth', 'app'

  return (
    <div className="font-body">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap');
        .font-heading { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-numbers { font-family: 'Plus Jakarta Sans', sans-serif; font-variant-numeric: tabular-nums; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>
      
      {currentRoute === 'landing' && <LandingView onNavigate={setCurrentRoute} />}
      {currentRoute === 'auth' && <AuthView onNavigate={setCurrentRoute} />}
      {currentRoute === 'app' && <MainApp onNavigate={setCurrentRoute} />}
    </div>
  );
}