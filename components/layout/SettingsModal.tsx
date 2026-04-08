'use client';
import { useUIStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, User, Bell, Palette, Shield, Trash2, Plus, Loader2, Search, DollarSign, Check, Settings, Moon, Sun, Globe, LogOut } from 'lucide-react';
import { getAvatarUrl } from '@/lib/utils';
import { PRESET_AVATARS } from '@/lib/avatars';

export function SettingsModal() {
  const { settingsModalOpen, setSettingsModalOpen, settingsTab, setSettingsTab, isDarkMode, toggleDarkMode, user, setAuthModalOpen } = useUIStore();
  
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (settingsModalOpen && user) {
      fetchAlerts();
      setUsername(user.user_metadata?.username || '');
      setBio(user.user_metadata?.bio || '');
      setEditAvatar(user.user_metadata?.avatar_url || '');
    }
  }, [settingsModalOpen, user]);

  const fetchAlerts = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('keyword_alerts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setAlerts(data);
    setLoading(false);
  };

  const handleAddAlert = async () => {
    if (!keyword.trim() || !user) return;
    setIsSubmitting(true);
    const price = maxPrice ? parseFloat(maxPrice) : null;
    const { data } = await supabase.from('keyword_alerts').insert({
      user_id: user.id,
      keyword: keyword.trim(),
      max_price: price
    }).select().maybeSingle();
    if (data) {
      setAlerts([data, ...alerts]);
      setKeyword('');
      setMaxPrice('');
    }
    setIsSubmitting(false);
  };

  const handleDeleteAlert = async (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
    await supabase.from('keyword_alerts').delete().eq('id', id);
  };

  const updateProfile = async () => {
    if (!user) return;
    setIsUpdatingProfile(true);
    
    // 1. Intentar actualizar tabla profiles
    // Nota: Si 'bio' no existe en la BD, PostgREST devolverá error 400.
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        username, 
        avatar_url: editAvatar,
        ...(bio ? { bio } : {}) // Solo intentar bio si hay valor
      } as any)
      .eq('id', user.id);

    if (profileError && profileError.message.includes('column "bio"')) {
      // Reintentar sin bio si falla por eso
      await supabase
        .from('profiles')
        .update({ username, avatar_url: editAvatar })
        .eq('id', user.id);
    }

    // 2. Actualizar Metadatos de Auth (Esto siempre funciona y es lo que usa la UI principalmente)
    const { data: { user: updatedUser }, error: authError } = await supabase.auth.updateUser({
      data: { username, bio, avatar_url: editAvatar }
    });

    if (!authError && updatedUser) {
      useUIStore.getState().setUser(updatedUser);
      alert("¡Perfil actualizado con éxito!");
    } else {
      console.error("Error al actualizar:", authError || profileError);
      alert("Hubo un problema al actualizar el perfil.");
    }

    setIsUpdatingProfile(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    setIsUpdatingProfile(true);
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    
    if (!uploadError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setEditAvatar(data.publicUrl);
    }
    setIsUpdatingProfile(false);
  };

  if (!settingsModalOpen) return null;

  const tc = {
    overlay: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300',
    modal: `w-full max-w-3xl h-full md:h-[min(700px,90vh)] rounded-3xl border shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-black/80 backdrop-blur-md border-[#222]' : 'bg-white/90 backdrop-blur-md border-slate-200'}`,
    sidebar: `w-full md:w-64 border-b md:border-b-0 md:border-r flex flex-row md:flex-col p-3 md:p-5 gap-1 overflow-x-auto md:overflow-x-visible hide-scrollbar sticky top-0 md:static z-20 ${isDarkMode ? 'bg-black/40 border-[#1a1a1a]' : 'bg-white/50 border-slate-100'}`,
    content: `flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-5 md:p-10 pb-32 md:pb-24 bg-transparent`,
    tabBtn: (active: boolean) => `flex items-center gap-3 px-5 md:px-4 py-2.5 rounded-2xl md:rounded-xl text-[12px] md:text-[13px] font-heading font-black transition-all whitespace-nowrap min-w-max md:min-w-0 flex-shrink-0 ${active ? (isDarkMode ? 'bg-[#009ea8] text-white shadow-lg shadow-[#009ea8]/20' : 'bg-[#009ea8] text-white shadow-lg shadow-[#009ea8]/20') : (isDarkMode ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}`,
    label: `text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`,
    input: `w-full bg-transparent px-4 py-3 rounded-2xl border text-[16px] md:text-[14px] font-body transition-all outline-none ${isDarkMode ? 'border-[#222] bg-[#141414] focus:border-[#009ea8] text-white' : 'border-slate-200 bg-white focus:border-[#009ea8] text-slate-900'}`,
    sectionTitle: `text-xl md:text-2xl font-heading font-black mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`,
  };

  return (
    <div className={tc.overlay} onClick={() => setSettingsModalOpen(false)}>
      <div className={tc.modal} onClick={e => e.stopPropagation()}>
        
        {/* Sidebar Nav */}
        <aside className={tc.sidebar}>
          <div className="hidden md:flex items-center gap-2 px-4 py-4 mb-2">
             <Settings className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`} />
             <span className={`text-sm font-heading font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Configuración</span>
          </div>
          <div className="flex flex-row md:flex-col gap-1 w-full">
            <button onClick={() => setSettingsTab('profile')} className={tc.tabBtn(settingsTab === 'profile')}><User className="w-4 h-4" /> <span className="hidden md:inline">Perfil</span></button>
            <button onClick={() => setSettingsTab('notifications')} className={tc.tabBtn(settingsTab === 'notifications')}><Bell className="w-4 h-4" /> <span className="hidden md:inline">Alertas</span></button>
            <button onClick={() => setSettingsTab('appearance')} className={tc.tabBtn(settingsTab === 'appearance')}><Palette className="w-4 h-4" /> <span className="hidden md:inline">Apariencia</span></button>
            <button onClick={() => setSettingsTab('account')} className={tc.tabBtn(settingsTab === 'account')}><Shield className="w-4 h-4" /> <span className="hidden md:inline">Cuenta</span></button>
          </div>
          
          <div className="hidden md:block mt-auto pt-4 border-t border-inherit">
             <button onClick={() => createClient().auth.signOut()} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-heading font-bold text-red-500 hover:bg-red-500/10 transition-all`}><LogOut className="w-4 h-4" /> Salir</button>
          </div>
        </aside>

        <main className={tc.content}>
           <div className="w-full max-w-2xl">
              {settingsTab === 'profile' && (
                 <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h2 className={tc.sectionTitle}>Mi Perfil</h2>
                    <div className="space-y-6 pb-10">
                       <div className={`p-6 md:p-8 rounded-3xl border border-inherit shadow-sm overflow-hidden ${isDarkMode ? 'bg-[#141414] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                          <p className={tc.label}>Imagen de perfil</p>
                          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                             <div className="relative group">
                                <img src={getAvatarUrl(editAvatar, user?.id || '', user?.updated_at)} alt="Avatar" className="w-24 h-24 rounded-3xl border-4 border-white dark:border-[#1a1a1a] shadow-2xl object-cover transition-transform group-hover:scale-105" />
                                {isUpdatingProfile && (
                                   <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center">
                                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                                   </div>
                                )}
                             </div>
                             <div className="flex-1 text-center sm:text-left">
                                <p className={`text-[13px] ${isDarkMode ? 'text-gray-400' : 'text-slate-500'} mb-4 leading-relaxed`}>
                                   Personaliza tu identidad. Sube tu propia foto o elige uno de estos avatares oficiales.
                                </p>
                                <label className={`inline-flex items-center gap-2 cursor-pointer px-5 py-2.5 bg-[#009ea8] text-white rounded-xl font-heading font-black text-[12px] hover:brightness-110 hover:-translate-y-0.5 transition-all shadow-lg shadow-[#009ea8]/20 ${isUpdatingProfile ? 'opacity-50 pointer-events-none' : ''}`}>
                                   <Plus className="w-4 h-4" />
                                   {isUpdatingProfile ? 'Subiendo...' : 'Subir nueva imagen'}
                                   <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                </label>
                             </div>
                          </div>
                          
                          <div className="relative">
                             <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar hide-scrollbar-on-mobile">
                                {PRESET_AVATARS.map((avatar, idx) => (
                                   <button 
                                      key={idx} 
                                      onClick={() => setEditAvatar(avatar)}
                                      className={`relative w-14 h-14 rounded-2xl shrink-0 overflow-hidden border-2 transition-all ${editAvatar === avatar ? 'border-[#009ea8] scale-110 shadow-lg z-10' : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'}`}
                                   >
                                      <img src={avatar} alt={`Avatar preset ${idx}`} className="w-full h-full object-cover" />
                                      {editAvatar === avatar && (
                                         <div className="absolute top-1 right-1 bg-[#009ea8] rounded-full p-0.5">
                                            <Check className="w-2 h-2 text-white" />
                                         </div>
                                      )}
                                   </button>
                                ))}
                             </div>
                          </div>
                       </div>
                          <div className="space-y-4 pt-4">
                             <div className="space-y-2">
                                <p className={tc.label}>Nombre de usuario</p>
                                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className={tc.input} placeholder="Cómo te verán otros..." />
                             </div>
                             <div className="space-y-2">
                                <p className={tc.label}>Biografía</p>
                                <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} className={`${tc.input} resize-none`} placeholder="Cuéntanos algo sobre ti..." />
                             </div>
                             <div className="pt-6">
                               <button onClick={updateProfile} disabled={isUpdatingProfile} className="w-full h-12 bg-[#009ea8] text-white rounded-2xl font-heading font-black text-sm shadow-xl shadow-[#009ea8]/20 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-95 transition-all">
                                  {isUpdatingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                  Guardar Cambios
                                </button>
                             </div>
                          </div>
                       </div>
                     </section>
                  )}

                  {settingsTab === 'notifications' && (
                     <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h2 className={tc.sectionTitle}>Notificaciones</h2>
                        
                        <div className="space-y-8">
                           {/* Alert Builder */}
                           <div className={`p-6 rounded-3xl border bg-[#009ea8]/5 ${isDarkMode ? 'border-[#009ea8]/20' : 'border-[#009ea8]/10'}`}>
                              <div className="flex items-center gap-3 mb-4">
                                 <div className="w-8 h-8 rounded-full bg-[#009ea8] flex items-center justify-center text-white"><Plus className="w-4 h-4" /></div>
                                 <h3 className={`font-heading font-black text-[15px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Programar Alerta Inteligente</h3>
                              </div>
                              <div className="flex flex-col gap-3">
                                 <div className="flex items-center bg-white dark:bg-[#111] border border-inherit rounded-2xl px-4 py-3">
                                   <Search className="w-4 h-4 opacity-50 mr-3" />
                                   <input type="text" placeholder="Ej: PlayStation 5, iPhone..." value={keyword} onChange={e => setKeyword(e.target.value)} className="bg-transparent outline-none flex-1 font-body text-sm text-inherit" />
                                 </div>
                                 <div className="flex gap-3">
                                    <div className="flex-1 flex items-center bg-white dark:bg-[#111] border border-inherit rounded-2xl px-4 py-3">
                                      <DollarSign className="w-4 h-4 opacity-50 mr-3 text-green-500" />
                                      <input type="number" placeholder="Precio máx..." value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="bg-transparent outline-none flex-1 font-numbers text-sm text-inherit" />
                                    </div>
                                    <button onClick={handleAddAlert} disabled={!keyword.trim() || isSubmitting} className="bg-[#009ea8] text-white px-6 rounded-2xl font-heading font-black text-sm flex items-center gap-2 hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-[#009ea8]/20">
                                       {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4" />} Añadir
                                    </button>
                                 </div>
                              </div>
                           </div>

                           {/* Alerts List */}
                           <div>
                              <h3 className={`font-heading font-bold text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Alertas Activas</h3>
                              {loading ? (
                                 <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-[#009ea8]"/></div>
                              ) : alerts.length === 0 ? (
                                 <div className={`text-center py-10 border border-dashed rounded-3xl ${isDarkMode ? 'border-[#333]' : 'border-slate-200'} text-gray-500`}>
                                    <p className="text-sm font-body">No tienes alertas programadas.</p>
                                 </div>
                              ) : (
                                 <div className="grid grid-cols-1 gap-3">
                                    {alerts.map(alert => (
                                       <div key={alert.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#141414] border-[#222] hover:border-gray-700' : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'}`}>
                                          <div className="flex items-center gap-4">
                                             <div className="w-10 h-10 rounded-xl bg-[#009ea8]/10 flex items-center justify-center text-[#009ea8]"><Bell className="w-5 h-5" /></div>
                                             <div>
                                               <p className={`font-heading font-black text-[15px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>"{alert.keyword}"</p>
                                               {alert.max_price && <p className="font-numbers text-xs text-green-500 font-bold">Máximo ${alert.max_price}</p>}
                                             </div>
                                          </div>
                                          <button onClick={() => handleDeleteAlert(alert.id)} className={`p-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-all`}><Trash2 className="w-5 h-5" /></button>
                                       </div>
                                    ))}
                                 </div>
                              )}
                           </div>
                        </div>
                     </section>
                  )}

                  {settingsTab === 'appearance' && (
                     <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h2 className={tc.sectionTitle}>Apariencia</h2>
                        <div className="space-y-6">
                           <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>Elige el estilo visual con el que te sientes más cómodo.</p>
                           <div className="grid grid-cols-2 gap-4">
                              <button onClick={() => isDarkMode && toggleDarkMode()} className={`p-6 rounded-3xl border flex flex-col items-center gap-4 transition-all ${!isDarkMode ? 'border-[#009ea8] bg-[#009ea8]/5 shadow-xl' : 'border-inherit hover:border-gray-500'}`}>
                                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${!isDarkMode ? 'bg-[#009ea8] text-white' : 'bg-slate-100 text-slate-500'}`}><Sun className="w-7 h-7" /></div>
                                 <span className={`font-heading font-black text-sm ${!isDarkMode ? 'text-[#009ea8]' : 'text-slate-500'}`}>Claro</span>
                              </button>
                              <button onClick={() => !isDarkMode && toggleDarkMode()} className={`p-6 rounded-3xl border flex flex-col items-center gap-4 transition-all ${isDarkMode ? 'border-[#009ea8] bg-[#009ea8]/5 shadow-xl' : 'border-inherit hover:border-gray-500'}`}>
                                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-[#009ea8] text-white' : 'bg-slate-800 text-slate-400'}`}><Moon className="w-7 h-7" /></div>
                                 <span className={`font-heading font-black text-sm ${isDarkMode ? 'text-[#009ea8]' : 'text-white'}`}>Oscuro</span>
                              </button>
                           </div>
                        </div>
                     </section>
                  )}

                  {settingsTab === 'account' && (
                     <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h2 className={tc.sectionTitle}>Cuenta</h2>
                        <div className="space-y-6">
                           <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#1a1a1a] border-[#222]' : 'bg-slate-50 border-slate-100'}`}>
                              <p className={tc.label}>Email de acceso</p>
                              <p className={`font-body font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.email}</p>
                              <p className="text-[11px] text-gray-500 mt-1">Este email se utiliza para el inicio de sesión y notificaciones.</p>
                           </div>
                           <div>
                              <h4 className="text-red-500 font-heading font-black text-sm mb-2">Zona de Peligro</h4>
                              <button className={`w-full p-4 rounded-2xl border border-red-500/30 text-red-500 font-heading font-bold text-[13px] hover:bg-red-500/5 transition-all text-left`}>Eliminar mi cuenta definitivamente</button>
                           </div>
                        </div>
                     </section>
                  )}
               </div>
            </main>

        {/* Close Button X Floating */}
        <button 
           onClick={() => setSettingsModalOpen(false)}
           className={`absolute top-4 right-4 p-2 rounded-2xl transition-all active:scale-95 z-[120] ${isDarkMode ? 'bg-[#141414] hover:bg-white/5 text-gray-500 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}
        >
           <X className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
}
