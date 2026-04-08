'use client';
import { useState } from 'react';
import { useUIStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, User, ArrowRight, Flame, ShieldCheck, X, ChevronLeft, Loader2, Check } from 'lucide-react';
import { PRESET_AVATARS } from '@/lib/avatars';

const colors = { accent: '#009ea8' };

export function AuthModal() {
  const { isDarkMode, authModalOpen, setAuthModalOpen, setUser } = useUIStore();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recovery' | 'terms'>('login');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const supabase = createClient();

  if (!authModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrorMsg(error.message);
    else {
      setUser(data.user);
      setAuthModalOpen(false);
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, avatar_url: selectedAvatar } }
    });
    if (error) setErrorMsg(error.message);
    else {
      setUser(data.user);
      setAuthModalOpen(false);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      {/* Background flare */}
      <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-[#009ea8] rounded-full mix-blend-screen filter blur-[120px] opacity-10 pointer-events-none"></div>

      <div className="w-full max-w-[420px] bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-8 z-10 relative">
        <button onClick={() => setAuthModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-8">
           <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#009ea8]/20" style={{ backgroundColor: colors.accent }}>
              <Flame className="w-6 h-6 fill-current" />
           </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] font-body text-center">
            {errorMsg}
          </div>
        )}

        {/* --- LOGIN VIEW --- */}
        {authMode === 'login' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-heading font-black text-white text-center mb-2">Bienvenido de nuevo</h2>
            <p className="text-sm font-body text-gray-500 text-center mb-8">Inicia sesión para continuar ahorrando</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-heading font-bold text-gray-400 uppercase tracking-wider mb-2">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white font-body text-sm focus:border-[#009ea8] focus:ring-1 focus:ring-[#009ea8] outline-none transition-all" placeholder="tu@email.com" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-heading font-bold text-gray-400 uppercase tracking-wider">Contraseña</label>
                  <button type="button" onClick={() => setAuthMode('recovery')} className="text-xs font-heading font-bold text-[#009ea8] hover:underline">¿Olvidaste tu clave?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white font-body text-sm focus:border-[#009ea8] focus:ring-1 focus:ring-[#009ea8] outline-none transition-all" placeholder="••••••••" />
                </div>
              </div>
              
              <button disabled={loading} type="submit" className={`w-full py-3.5 rounded-xl font-heading font-bold text-sm text-white shadow-lg shadow-[#009ea8]/20 hover:-translate-y-0.5 mt-6 flex items-center justify-center gap-2 transition-all disabled:opacity-50`} style={{ backgroundColor: colors.accent }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Ingresar a CupOferta <ArrowRight className="w-4 h-4" /></>}
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
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-heading font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre de Usuario</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white font-body text-sm focus:border-[#009ea8] outline-none transition-all" placeholder="Ej: CazaOfertasPro" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-heading font-bold text-gray-400 uppercase tracking-wider mb-2">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white font-body text-sm focus:border-[#009ea8] outline-none transition-all" placeholder="tu@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-heading font-bold text-gray-400 uppercase tracking-wider mb-2">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white font-body text-sm focus:border-[#009ea8] outline-none transition-all" placeholder="Crea una contraseña segura" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4 text-center">Elige tu Avatar</label>
                <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar px-1">
                  {PRESET_AVATARS.map((avatar, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`relative w-14 h-14 rounded-2xl shrink-0 cursor-pointer overflow-hidden border-2 transition-all hover:scale-105 ${selectedAvatar === avatar ? 'border-[#009ea8] shadow-lg shadow-[#009ea8]/20 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={avatar} alt="Avatar option" className="w-full h-full object-cover" />
                      {selectedAvatar === avatar && (
                        <div className="absolute inset-0 bg-[#009ea8]/20 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-start gap-3 mt-4">
                <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-white/10 bg-[#0a0a0a] text-[#009ea8] focus:ring-[#009ea8]" />
                <span className="text-[12px] font-body text-gray-500">
                  Al registrarme, acepto los <button type="button" onClick={() => setAuthMode('terms')} className="text-[#009ea8] hover:underline font-bold">Términos y Condiciones</button> y la Política de Privacidad de CupOferta.
                </span>
              </div>

              <button disabled={loading} type="submit" className={`w-full py-3.5 rounded-xl font-heading font-bold text-sm text-white shadow-lg shadow-[#009ea8]/20 hover:-translate-y-0.5 mt-6 flex items-center justify-center gap-2 transition-all disabled:opacity-50`} style={{ backgroundColor: colors.accent }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Cuenta'}
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
            
            <form onSubmit={e => { e.preventDefault(); setAuthMode('login'); }} className="space-y-4">
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
               <p><strong className="text-white">2. Uso:</strong> CupOferta es una plataforma comunitaria. Está prohibido el spam o uso de bots.</p>
            </div>
            
            <button onClick={() => setAuthMode('register')} className={`w-full py-3.5 rounded-xl font-heading font-bold text-sm text-[#009ea8] bg-[#009ea8]/10 hover:bg-[#009ea8]/20 mt-6 transition-all`}>
              Entendido, volver al registro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
