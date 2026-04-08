'use client';
import { useState, useMemo } from 'react';
import { X, AlertTriangle, Loader2, MessageSquare, Tag, User, ShieldAlert, CheckCircle2, ChevronRight, Flag } from 'lucide-react';
import { useUIStore } from '@/lib/store';

export function ReportModal() {
  const { isDarkMode, reportModalOpen, setReportModalOpen, reportTargetId, reportTargetType } = useUIStore();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const dealReasons = ['Spam o engaño', 'Precio/Expirado', 'Duplicado', 'Estafa', 'Categoría error', 'Ofensivo', 'Otro'];
  const commentReasons = ['Acoso/Odio', 'Spam', 'Ofensivo', 'Falso', 'Spoiler', 'Otro'];
  const userReasons = ['Nombre inapropiado', 'Foto ofensiva', 'Suplantación', 'Bot/Spam', 'Otro'];

  const currentReasons = useMemo(() => {
    switch (reportTargetType) {
      case 'deal': return dealReasons;
      case 'comment': return commentReasons;
      case 'user': return userReasons;
      default: return dealReasons;
    }
  }, [reportTargetType]);

  const targetConfig = useMemo(() => {
    switch (reportTargetType) {
      case 'deal': return { label: 'Oferta', icon: <Tag className="w-6 h-6" />, color: 'text-orange-500', bg: 'bg-orange-500/10' };
      case 'comment': return { label: 'Comentario', icon: <MessageSquare className="w-6 h-6" />, color: 'text-[#009ea8]', bg: 'bg-[#009ea8]/10' };
      case 'user': return { label: 'Usuario', icon: <User className="w-6 h-6" />, color: 'text-purple-500', bg: 'bg-purple-500/10' };
      default: return { label: 'Contenido', icon: <AlertTriangle className="w-6 h-6" />, color: 'text-red-500', bg: 'bg-red-500/10' };
    }
  }, [reportTargetType]);

  const onClose = () => {
    setReportModalOpen(false);
    setTimeout(() => { setIsSuccess(false); setReason(''); setDetails(''); }, 300);
  };

  const handleSubmit = async () => {
    if (!reason || !reportTargetId || !reportTargetType) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'report', target_type: reportTargetType, target_id: reportTargetId, reason, details }) });
      if ((await res.json()).success) { setIsSuccess(true); setTimeout(onClose, 2000); }
    } catch (err) {} finally { setIsSubmitting(false); }
  };

  const tc = {
    overlay: 'bg-black/90 backdrop-blur-md',
    panel: isDarkMode ? 'bg-[#0a0a0a] border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900',
    input: isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200',
    muted: isDarkMode ? 'text-gray-500' : 'text-slate-400'
  };

  if (!reportModalOpen) return null;

  return (
    <div className={`fixed inset-0 z-[2000] flex items-center justify-center p-4 overflow-hidden`}>
      <div className={`absolute inset-0 ${tc.overlay} animate-in fade-in transition-opacity`} onClick={onClose} />
      
      <div className={`relative w-full max-w-md max-h-[85vh] flex flex-col p-6 sm:p-8 rounded-[2rem] border shadow-2xl animate-in zoom-in-95 duration-300 ${tc.panel}`}>
        {isSuccess ? (
          <div className="py-12 text-center">
             <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner"><CheckCircle2 className="w-10 h-10" /></div>
             <h3 className="text-2xl font-heading font-black mb-2">Enviado</h3>
             <p className={`text-sm font-body ${tc.muted}`}>Gracias por tu reporte.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 shrink-0">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${targetConfig.bg} ${targetConfig.color} border border-white/5 shadow-xl`}>
                  {targetConfig.icon}
                </div>
                <div>
                  <h3 className="font-heading font-black text-xl leading-none mb-1">Reportar {targetConfig.label}</h3>
                  <p className="text-[9px] font-heading font-black uppercase tracking-widest opacity-30">Security Core</p>
                </div>
              </div>
              <button onClick={onClose} className={`p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all`}><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 py-2">
              <div className="space-y-4">
                <label className="text-[10px] font-heading font-black uppercase tracking-[0.2em] text-[#009ea8]">Selecciona el motivo</label>
                <div className="grid grid-cols-1 gap-2">
                  {currentReasons.map(r => (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={`group relative px-5 py-4 rounded-xl border text-left text-xs font-heading font-black transition-all ${
                        reason === r ? 'bg-[#009ea8] border-[#009ea8] text-white shadow-lg' : tc.input + ' hover:translate-x-1'
                      }`}
                    >
                      <div className="flex items-center justify-between relative z-10">
                         <span>{r}</span>
                         <ChevronRight className={`w-4 h-4 transition-all ${reason === r ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-heading font-black uppercase tracking-[0.2em] text-[#009ea8]">Detalles (Opcional)</label>
                 <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Añade contexto..." className={`w-full px-5 py-4 rounded-xl border outline-none text-xs font-body transition-all min-h-[100px] resize-none shadow-inner ${tc.input}`} />
              </div>
            </div>

            <div className="pt-8 shrink-0">
              <button onClick={handleSubmit} disabled={!reason || isSubmitting} className="w-full bg-[#009ea8] text-white py-4 rounded-xl font-heading font-black text-sm shadow-xl shadow-[#009ea8]/20 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-30 disabled:translate-y-0 disabled:shadow-none uppercase tracking-widest flex items-center justify-center gap-3">
                 {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Flag className="w-4 h-4" /> Enviar Reporte</>}
              </button>
              <p className="text-[8px] text-center mt-4 opacity-20 font-heading font-black truncate uppercase tracking-widest">ID: {reportTargetId}</p>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}
