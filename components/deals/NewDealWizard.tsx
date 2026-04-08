'use client';
import { useUIStore } from '@/lib/store';
import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, ChevronRight, ChevronLeft, Link as LinkIcon, DollarSign, Tag, Image as ImageIcon, Sparkles, Loader2, CheckCircle2, Upload, AlertCircle, Calendar, Search, ChevronDown, Bold, Italic, List, GripHorizontal, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getFlagUrl } from '@/lib/utils';

const STORES = ['Amazon', 'Miravia', 'AliExpress', 'El Corte Inglés', 'MediaMarkt', 'PcComponentes', 'Carrefour', 'Decathlon', 'Nike', 'Adidas', 'Zalando', 'eBay', 'Shein', 'Temu', 'Fnac', 'Leroy Merlin', 'IKEA', 'Promofarma', 'Douglas', 'Chollómetro', 'Otra (Solicitar)'];
const CATEGORIES = ['Electrónica', 'Informática y Redes', 'Videojuegos', 'Hogar y Jardín', 'Salud y Belleza', 'Moda y Accesorios', 'Deportes y Aire Libre', 'Supermercado', 'Motor', 'Viajes', 'Bebés y Niños', 'Mascotas', 'Ocio y Cultura', 'Herramientas y Bricolaje', 'Juguetes', 'Cursos y Software', 'Otra (Solicitar)'];
const BAD_WORDS = ['puta', 'puto', 'mierda', 'cabron', 'pendejo', 'verga', 'porn', 'xxx', 'sexo', 'nude', 'desnudo'];

const toTitleCase = (str: string) => {
  const lowerWords = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'e', 'o', 'u', 'de', 'del', 'al', 'con', 'en', 'por', 'para', 'sin'];
  return str.split(' ').map((word, index) => {
    if (!word) return '';
    const lowerWord = word.toLowerCase();
    if (index !== 0 && lowerWords.includes(lowerWord)) return lowerWord;
    return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
  }).join(' ');
};

function SearchableDropdown({ options, value, onChange, placeholder, icon: Icon, isDarkMode }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter((o: string) => o.toLowerCase().includes((value || '').toLowerCase()) && o !== 'Otra (Solicitar)');

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className={`flex items-center px-4 py-3 rounded-xl border transition-colors ${isDarkMode ? 'bg-[#141414] border-[#333333] focus-within:border-[#009ea8]/50' : 'bg-white border-slate-200 focus-within:border-[#009ea8]/50'}`}>
         <Icon className="w-5 h-5 opacity-50 shrink-0 mr-3" />
         <input 
           type="text" 
           value={value} 
           onChange={(e) => { onChange(e.target.value); setIsOpen(true); }}
           onFocus={() => setIsOpen(true)}
           placeholder={placeholder}
           className={`w-full bg-transparent border-none outline-none font-body text-[15px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`} 
         />
         <ChevronDown className={`w-4 h-4 opacity-50 shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && filtered.length > 0 && (
         <div className={`absolute z-50 w-full mt-2 rounded-xl border shadow-2xl overflow-hidden animate-in slide-in-from-top-1 fade-in duration-200 ${isDarkMode ? 'bg-[#1a1a1a] border-[#333333]' : 'bg-white border-slate-200'}`}>
            <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
               {filtered.map((opt: string) => (
                   <button key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-body transition-colors ${value === opt ? 'bg-[#009ea8]/10 text-[#009ea8] font-bold' : (isDarkMode ? 'hover:bg-[#262626]' : 'hover:bg-slate-100')}`}>{opt}</button>
               ))}
            </div>
         </div>
      )}
    </div>
  );
}

type DealImage = { id: string; preview: string; file?: File; isUrl: boolean; };

export function NewDealWizard() {
  const { newDealModalOpen, setNewDealModalOpen, isDarkMode, user, setAuthModalOpen } = useUIStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mode, setMode] = useState<'manual' | 'bulk'>('manual');
  const [isImporting, setIsImporting] = useState(false);
  const [importReport, setImportReport] = useState<any>(null);
  
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [store, setStore] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [shippingType, setShippingType] = useState('Gratis');
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [dealType, setDealType] = useState<'offer' | 'coupon'>('offer');
  const [couponCode, setCouponCode] = useState('');
  const [currency, setCurrency] = useState('MXN');
  
  const [images, setImages] = useState<DealImage[]>([]);
  const [tempUrlInput, setTempUrlInput] = useState('');
  const [isProcessingCanvas, setIsProcessingCanvas] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  if (!newDealModalOpen) return null;
  if (!user && newDealModalOpen) {
      setNewDealModalOpen(false);
      setTimeout(() => setAuthModalOpen(true), 100);
      return null;
  }

  const supabase = createClient();

  const handleClose = () => {
    setNewDealModalOpen(false);
    setTimeout(() => {
      setStep(1); setSuccess(false); setErrorMsg(''); setMode('manual'); setImportReport(null);
      setUrl(''); setTitle(''); setStore(''); setPrice(''); setOldPrice(''); 
      setCategory(''); setDescription(''); setImages([]); setTempUrlInput('');
      setHasExpiration(false); setExpirationDate(''); setCurrency('MXN');
    }, 300);
  };

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportReport(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/deals/bulk/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setImportReport(data.report);
      } else {
        setErrorMsg('Error: ' + data.error);
      }
    } catch (err: any) {
      setErrorMsg('Error fatal en la importación: ' + err.message);
    } finally {
      setIsImporting(false);
      if (e.target) e.target.value = '';
    }
  };

  const processImageToSquare = (file: File): Promise<{ file: File, preview: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          const MAX_SIZE = 800;
          canvas.width = MAX_SIZE;
          canvas.height = MAX_SIZE;
          
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, MAX_SIZE, MAX_SIZE);
          
          const scale = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height);
          const x = (MAX_SIZE / 2) - (img.width / 2) * scale;
          const y = (MAX_SIZE / 2) - (img.height / 2) * scale;
          
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          
          const preview = canvas.toDataURL('image/jpeg', 0.85);
          canvas.toBlob((blob) => {
             if (blob) {
                const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + "_format.jpg", { type: 'image/jpeg' });
                resolve({ file: newFile, preview });
             }
          }, 'image/jpeg', 0.85);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileMultiSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    const slots = 4 - images.length;
    if (slots <= 0) {
      setErrorMsg("Solo puedes subir un máximo de 4 imágenes.");
      return;
    }
    const toProcess = files.slice(0, slots);
    
    setIsProcessingCanvas(true);
    const newImgs: DealImage[] = [];
    for (const f of toProcess) {
       const { file: nf, preview } = await processImageToSquare(f);
       newImgs.push({ id: Math.random().toString(36).substr(2,9), preview, file: nf, isUrl: false });
    }
    setImages(prev => [...prev, ...newImgs]);
    setIsProcessingCanvas(false);
  };

  const handleAddUrlImage = async () => {
    if (!tempUrlInput.trim()) return;
    if (images.length >= 4) { setErrorMsg("Máximo 4 imágenes."); return; }
    
    setIsProcessingCanvas(true);
    try {
      const res = await fetch('/api/images/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tempUrlInput.trim() })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "No se pudo formatear la imagen.");
      
      setImages(prev => [...prev, { id: Math.random().toString(36).substr(2,9), preview: data.url, isUrl: true }]);
      setTempUrlInput('');
    } catch (e: any) {
      setErrorMsg("Error: " + e.message);
    } finally {
      setIsProcessingCanvas(false);
    }
  };

  const handleMoveImage = (idx: number, dir: -1 | 1) => {
    const newImages = [...images];
    if (idx + dir < 0 || idx + dir >= newImages.length) return;
    const temp = newImages[idx];
    newImages[idx] = newImages[idx + dir];
    newImages[idx + dir] = temp;
    setImages(newImages);
  };
  
  const handleRemoveImage = (id: string) => setImages(prev => prev.filter(img => img.id !== id));

  const validateStep = (currentStep: number) => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (!url.trim()) { setErrorMsg('Necesitamos un enlace de la oferta para continuar.'); return false; }
      if (dealType === 'coupon' && !couponCode.trim()) { setErrorMsg('Si es un cupón, debes introducir el código.'); return false; }
      if (images.length === 0) { setErrorMsg('Sube al menos 1 imagen que describa el producto.'); return false; }
    }
    if (currentStep === 2) {
      if (!title.trim() || !description.trim()) { setErrorMsg('El título y la descripción son obligatorios.'); return false; }
      if (description.trim().length < 50) { setErrorMsg('La descripción es muy corta. Detalla por qué es un buen chollo (Mínimo 50 caracteres).'); return false; }
      if (BAD_WORDS.some(bw => title.toLowerCase().includes(bw) || description.toLowerCase().includes(bw))) {
        setErrorMsg('Por políticas de comunidad, se han detectado palabras no permitidas o antisonantes.'); return false;
      }
    }
    if (currentStep === 3) {
      if (!store) { setErrorMsg('Debes especificar o seleccionar una tienda de origen.'); return false; }
      if (!category) { setErrorMsg('Debes especificar o seleccionar una categoría.'); return false; }
      if (!price) { setErrorMsg('Debes indicar el precio de oferta.'); return false; }
      if (hasExpiration && !expirationDate) { setErrorMsg('Indica la fecha de vencimiento si elegiste caducidad.'); return false; }
    }
    return true;
  };

  const handleNext = () => { if (validateStep(step)) setStep(prev => Math.min(prev + 1, 4)); };
  const handlePrev = () => { setErrorMsg(''); setStep(prev => Math.max(prev - 1, 1)); };

  const insertMarkdown = (e: React.MouseEvent, prefix: string, suffix: string = '') => {
    e.preventDefault();
    const el = descriptionRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = description;
    const selected = text.substring(start, end);
    const newText = text.substring(0, start) + prefix + (selected || 'texto') + suffix + text.substring(end);
    setDescription(newText);
    setTimeout(() => { el.focus(); el.setSelectionRange(start + prefix.length, start + prefix.length + (selected || 'texto').length); }, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setIsSubmitting(true);
    setErrorMsg('');
    
    try {
      const finalImageUrls: string[] = [];
      for (const img of images) {
        finalImageUrls.push(img.preview);
      }

      const insertData: any = {
        user_id: user.id,
        title,
        description,
        price: parseFloat(price) || 0,
        old_price: oldPrice ? parseFloat(oldPrice) : null,
        store: store.trim(),
        category: category.trim(),
        currency: currency,
        image_url: finalImageUrls,
        shipping_type: shippingType,
        link: url,
        expires_at: hasExpiration && expirationDate ? new Date(expirationDate).toISOString() : null,
        deal_type: dealType,
        coupon_code: dealType === 'coupon' ? couponCode : null,
        status: 'pending'
      };

      const { error } = await supabase.from('deals').insert(insertData);
      if (error) throw new Error("Error interno de BD: " + error.message);
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error desconocido al subir la oferta.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const themeClasses = {
    modal: isDarkMode ? 'bg-black/80 backdrop-blur-md border-white/10 text-white' : 'bg-[#f8fafc] backdrop-blur-md border-slate-200 text-slate-800 shadow-2xl',
    inputBg: isDarkMode ? 'bg-[#141414] border-[#333333] text-white focus:border-[#009ea8]' : 'bg-white border-slate-200 text-slate-900 focus:border-[#009ea8] focus:shadow-sm transition-all',
    textMuted: isDarkMode ? 'text-gray-400' : 'text-slate-500',
    textStrong: isDarkMode ? 'text-white' : 'text-slate-900',
    textDesc: isDarkMode ? 'text-gray-300' : 'text-slate-600',
    avatarBubble: isDarkMode ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/50',
  };

  const getBotMessage = () => {
    if (success) return "¡Impresionante! Tu chollo ha sido enviado a moderación. Estará disponible pronto.";
    if (mode === 'bulk') {
       if (importReport) return `¡Importación finalizada! Has insertado ${importReport.inserted} nuevas ofertas y actualizado ${importReport.updated}.`;
       return "¡Modo superusuario activado! Sube tu archivo Excel para importar ofertas por lote.";
    }
    switch (step) {
      case 1: return "¡Añade el enlace base y sube hasta 4 imágenes! Yo alinearé todo perfectamente en cuadros limpios.";
      case 2: return "Dime de qué trata. Escribe claro y usa las utilidades Markdown para destacarte.";
      case 3: return "Indica si expira y búscame la tienda correspondiente. ¡Si no existe, solicítala!";
      case 4: return "¡Observa cómo quedó! La primera foto de tu galería será la portada. Dale a publicar.";
      default: return "¡Vamos a publicar!";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      
      <div className={`relative w-full max-w-4xl h-[85vh] sm:h-[80vh] min-h-[500px] flex flex-col md:flex-row rounded-3xl shadow-2xl border transition-all transform animate-in fade-in zoom-in-95 duration-300 ${themeClasses.modal} overflow-hidden`}>
        
        <div className={`w-full md:w-[320px] p-6 lg:p-8 flex flex-col justify-between relative border-b md:border-b-0 md:border-r shrink-0 border-inherit ${isDarkMode ? 'bg-black/40' : 'bg-white shadow-[2px_0_15px_rgba(0,0,0,0.02)]'} overflow-hidden hidden sm:flex z-10`}>
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#009ea8] rounded-full blur-[80px] opacity-10 pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
           <div>
              <div className="flex items-center gap-2 mb-6">
                 <Sparkles className="w-5 h-5 text-[#009ea8]" />
                 <h2 className="font-heading font-black tracking-tight text-lg">Asistente CholloBot</h2>
              </div>
              <div className="relative z-10 w-full mb-6">
                <div className={`p-4 rounded-2xl border rounded-bl-sm text-[13px] font-body leading-relaxed transition-all duration-500 scale-100 ${themeClasses.avatarBubble}`}>{getBotMessage()}</div>
              </div>
           </div>
           <div className="flex justify-center transition-transform duration-500 hover:-translate-y-2">
              <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=CupOfertaRobo${step}&colors=009ea8`} alt="Bot" className="w-40 h-40 filter drop-shadow-2xl" />
           </div>
        </div>

        <div className={`flex-1 flex flex-col relative h-full min-h-0 overflow-hidden`}>
            {!success && (
              <div className="absolute top-0 left-0 w-full h-1 bg-black/5 dark:bg-white/5">
                <div className="h-full bg-[#009ea8] transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
              </div>
            )}
            
            <button onClick={handleClose} className={`absolute top-4 right-4 p-2 rounded-full ${isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-black/5 text-gray-500'} transition-colors z-10`}><X className="w-5 h-5" /></button>

                {success ? (
                   <div className="h-full flex-1 flex flex-col items-center justify-center text-center p-8 animate-in zoom-in duration-500">
                      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6"><CheckCircle2 className="w-10 h-10 text-green-500" /></div>
                      <h3 className="font-heading font-black text-2xl mb-2">¡Oferta Publicada con Éxito!</h3>
                      <p className={`font-body max-w-sm mb-8 ${themeClasses.textMuted}`}>Tu aporte ha sido enviado a moderación para asegurar la calidad de la comunidad.</p>
                      <button onClick={handleClose} className="px-8 py-3 bg-[#009ea8] text-white font-heading font-bold rounded-xl shadow-lg shadow-[#009ea8]/20 hover:-translate-y-1 transition-all">Ir al Feed principal</button>
                   </div>
                ) : (
                   <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                      <div className="px-6 md:px-8 pt-7 pb-3 shrink-0">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                             <span className="text-[#009ea8] font-heading font-black text-[10px] tracking-[0.2em] uppercase opacity-70 mb-1">
                               {mode === 'manual' ? `Paso ${step} de 4` : 'MODO CREADOR'}
                             </span>
                             <h3 className="font-heading font-black text-2xl md:text-3xl tracking-tight leading-none h-8 flex items-center">
                               {mode === 'bulk' ? "Importación Masiva" : (
                                 step === 1 ? "Enlace y Galería" :
                                 step === 2 ? "Detalles y Formato" :
                                 step === 3 ? "Clasificación Final" :
                                 "Vista Previa de Portada"
                               )}
                             </h3>
                          </div>
                          <div className="flex bg-black/5 dark:bg-white/5 rounded-xl p-1 shrink-0 mb-2 shadow-inner border border-black/5 dark:border-white/5">
                             <button onClick={() => setMode('manual')} className={`px-4 py-2 text-[11px] font-heading font-bold uppercase rounded-lg transition-all ${mode === 'manual' ? 'bg-[#009ea8] text-white shadow-md' : 'opacity-60 hover:opacity-100 text-slate-700 dark:text-gray-300'}`}>Manual</button>
                             <button onClick={() => setMode('bulk')} className={`px-4 py-2 text-[11px] font-heading font-bold uppercase rounded-lg transition-all ${mode === 'bulk' ? 'bg-[#009ea8] text-white shadow-md' : 'opacity-60 hover:opacity-100 text-slate-700 dark:text-gray-300'}`}>Excel</button>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-2 custom-scrollbar">
                        {errorMsg && (
                          <div className="mb-5 flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 text-[12px] font-black rounded-2xl animate-in slide-in-from-top-2">
                             <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><p className="leading-snug">{errorMsg}</p>
                          </div>
                        )}

                        <div className="space-y-6 pb-6">
                         {mode === 'bulk' && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300 h-full flex flex-col justify-center">
                               {importReport ? (
                                  <div className={`p-6 rounded-3xl border-2 border-[#009ea8]/30 bg-[#009ea8]/5 space-y-4`}>
                                     <div className="flex items-center gap-3 text-[#009ea8] mb-4">
                                        <CheckCircle2 className="w-8 h-8" />
                                        <h4 className="font-heading font-black text-xl">Importación Completada</h4>
                                     </div>
                                     <div className="grid grid-cols-3 gap-2">
                                        <div className="p-3 bg-white dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5 text-center">
                                           <div className="text-2xl font-numbers font-black text-green-500">{importReport.inserted}</div>
                                           <div className="text-[10px] font-heading font-bold opacity-60 uppercase">Nuevos</div>
                                        </div>
                                        <div className="p-3 bg-white dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5 text-center">
                                           <div className="text-2xl font-numbers font-black text-blue-500">{importReport.updated}</div>
                                           <div className="text-[10px] font-heading font-bold opacity-60 uppercase">Actualizados</div>
                                        </div>
                                        <div className="p-3 bg-white dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5 text-center">
                                           <div className="text-2xl font-numbers font-black text-red-500">{importReport.failed}</div>
                                           <div className="text-[10px] font-heading font-bold opacity-60 uppercase">Descartados</div>
                                        </div>
                                     </div>
                                     
                                     {importReport.failed > 0 && importReport.errors && (
                                       <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                          <h5 className="font-heading font-bold text-red-500 text-sm mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Detalles de Errores:</h5>
                                          <ul className="text-[11px] text-red-400 font-body space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                                            {importReport.errors.map((e: any, i: number) => (
                                               <li key={i}><span className="font-bold">Fila {e.row}:</span> {e.title} - <span className="opacity-80">{e.issue}</span></li>
                                            ))}
                                          </ul>
                                       </div>
                                     )}
                                     
                                     <div className="pt-4 flex gap-2">
                                        <button onClick={() => setImportReport(null)} className="flex-1 py-3 rounded-xl border font-heading font-bold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Volver</button>
                                     </div>
                                  </div>
                               ) : (
                                  <>
                                     <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                        <h4 className="font-heading font-bold text-sm mb-2 flex items-center gap-2"><Upload className="w-4 h-4 text-[#009ea8]"/> Carga Centralizada de Ofertas</h4>
                                        <p className="text-[13px] font-body text-gray-500 mb-6 leading-relaxed">
                                          Sube un modelo en formato <span className="font-bold">.xlsx (Excel)</span> y nosotros validaremos todas tus ofertas contra anti-spam y tiendas permitidas.
                                        </p>
                                        
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                          <a href="/api/deals/bulk/export?mode=template" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-[#009ea8]/40 hover:bg-[#009ea8]/5 transition-all group">
                                             <List className="w-6 h-6 text-[#009ea8] group-hover:scale-110 transition-transform" />
                                             <div className="text-center">
                                                <div className="font-heading font-bold text-xs">A) Descargar Plantilla</div>
                                                <div className="text-[9px] opacity-60">Formato Virgen + Validaciones</div>
                                             </div>
                                          </a>
                                          <a href="/api/deals/bulk/export?mode=export" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-orange-500/40 hover:bg-orange-500/5 transition-all group">
                                             <GripHorizontal className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform" />
                                             <div className="text-center">
                                                <div className="font-heading font-bold text-xs">A) Exportar Mis Datos</div>
                                                <div className="text-[9px] opacity-60">Para editar y actualizar (Upsert)</div>
                                             </div>
                                          </a>
                                        </div>

                                        <label className={`relative overflow-hidden flex flex-col items-center justify-center w-full h-32 border-2 border-dashed ${isImporting ? 'border-[#009ea8] bg-[#009ea8]/10' : 'border-[#009ea8]/30 hover:border-[#009ea8] hover:bg-[#009ea8]/5'} rounded-2xl cursor-pointer transition-all group`}>
                                           <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                                              {isImporting ? (
                                                <Loader2 className="w-8 h-8 text-[#009ea8] animate-spin mb-3" />
                                              ) : (
                                                <Upload className="w-8 h-8 text-[#009ea8] mb-3 group-hover:-translate-y-1 transition-transform" />
                                              )}
                                              <p className="mb-1 text-sm font-heading font-bold text-gray-500 dark:text-gray-400">
                                                {isImporting ? 'Procesando Magia...' : <><span className="text-[#009ea8] font-black">B) Haz clic aquí</span> para subir tu Excel</>}
                                              </p>
                                              <p className="text-xs text-gray-500 dark:text-gray-400 font-body">XLSX (máx. 10MB)</p>
                                           </div>
                                           <input type="file" className="hidden" accept=".xlsx" onChange={handleBulkImport} disabled={isImporting} />
                                        </label>
                                     </div>
                                  </>
                               )}
                            </div>
                         )}

                         {mode === 'manual' && step === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <div className="space-y-3">
                                  <label className="font-heading font-bold text-[11px] ml-1 uppercase tracking-widest opacity-50">Tipo de Publicación <span className="text-red-500">*</span></label>
                                  <div className="grid grid-cols-2 gap-4">
                                     <button 
                                        onClick={() => setDealType('offer')}
                                        className={`group relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all h-[90px] ${dealType === 'offer' ? 'border-[#009ea8] bg-[#009ea8]/5 ring-4 ring-[#009ea8]/10' : (isDarkMode ? 'border-white/5 bg-white/5 opacity-50 hover:opacity-100' : 'border-slate-200 bg-white opacity-60 hover:opacity-100 hover:shadow-sm')}`}
                                     >
                                        <Tag className={`w-5 h-5 transition-transform group-hover:scale-110 ${dealType === 'offer' ? 'text-[#009ea8]' : ''}`} />
                                        <div className="text-center">
                                           <div className={`text-[11px] font-heading font-black uppercase tracking-wider ${dealType === 'offer' ? 'text-[#009ea8]' : ''}`}>Oferta Directa</div>
                                           <div className="text-[9px] font-body opacity-60">Precio rebajado hoy</div>
                                        </div>
                                     </button>
                                     <button 
                                        onClick={() => setDealType('coupon')}
                                        className={`group relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all h-[90px] ${dealType === 'coupon' ? 'border-[#009ea8] bg-[#009ea8]/5 ring-4 ring-[#009ea8]/10' : (isDarkMode ? 'border-white/5 bg-white/5 opacity-50 hover:opacity-100' : 'border-slate-200 bg-white opacity-60 hover:opacity-100 hover:shadow-sm')}`}
                                     >
                                        <div className={`w-5 h-5 transition-transform group-hover:scale-110 flex items-center justify-center ${dealType === 'coupon' ? 'text-[#009ea8]' : ''}`}>
                                           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M15 5v2"/><path d="M15 11v2"/><path d="M15 17v2"/><path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2Z"/></svg>
                                        </div>
                                        <div className="text-center">
                                           <div className={`text-[11px] font-heading font-black uppercase tracking-wider ${dealType === 'coupon' ? 'text-[#009ea8]' : ''}`}>Código Cupón</div>
                                           <div className="text-[9px] font-body opacity-60">Usa un código extra</div>
                                        </div>
                                     </button>
                                  </div>
                               </div>

                               <div className={`transition-all duration-500 ease-in-out overflow-hidden ${dealType === 'coupon' ? 'max-h-[100px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                 <div className="space-y-1.5 pt-1">
                                    <label className="font-heading font-bold text-[11px] ml-1 uppercase tracking-widest opacity-50">Código del Cupón <span className="text-red-500">*</span></label>
                                    <div className={`flex items-center px-4 py-2.5 rounded-xl border-2 border-dashed border-[#009ea8]/30 transition-colors ${themeClasses.inputBg}`}>
                                       <Tag className="w-4 h-4 text-[#009ea8] mr-3 shrink-0" />
                                       <input type="text" placeholder="EJ: CHOLLO2026" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} className="w-full bg-transparent border-none outline-none font-heading font-black text-sm tracking-widest placeholder:opacity-30" />
                                    </div>
                                 </div>
                               </div>

                               <div className="space-y-1.5">
                                  <label className="font-heading font-bold text-[11px] ml-1 uppercase tracking-widest opacity-50">URL Oficial <span className="text-red-500">*</span></label>
                                  <div className={`flex items-center px-4 py-2.5 rounded-xl border transition-colors ${themeClasses.inputBg}`}>
                                     <LinkIcon className="w-4 h-4 opacity-40 mr-3 shrink-0" />
                                     <input type="url" placeholder="https://amazon.es/chollo..." value={url} onChange={e => setUrl(e.target.value)} className="w-full bg-transparent border-none outline-none font-body text-sm" autoFocus />
                                  </div>
                               </div>

                               <div className="space-y-2">
                                  <div className="flex justify-between items-center ml-1">
                                    <label className="font-heading font-bold text-[11px] uppercase tracking-widest opacity-50">Galería Gráfica (1:1)</label>
                                    <span className="text-[10px] opacity-40 font-numbers">{images.length}/4</span>
                                  </div>

                                  <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                     {images.length > 0 && (
                                       <div className="flex gap-2.5 mb-4 overflow-x-auto pb-1.5 custom-scrollbar">
                                         {images.map((img, idx) => (
                                           <div key={img.id} className="relative shrink-0 w-[70px] flex flex-col group/thumb">
                                              <div className={`w-[70px] h-[70px] border bg-white ${idx === 0 ? 'border-[#009ea8] border-2 shadow-lg shadow-[#009ea8]/20' : 'border-slate-300'} rounded-xl overflow-hidden flex items-center justify-center`}>
                                                <img src={img.preview} alt={`thumb-${idx}`} className="w-full h-full object-contain" />
                                                {idx === 0 && <span className="absolute top-0.5 left-0.5 bg-[#009ea8] text-white text-[6px] font-black px-1 rounded uppercase z-10">PRO</span>}
                                              </div>
                                              
                                              <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-20 backdrop-blur-[1px]">
                                                 {idx > 0 && (
                                                    <button onClick={() => handleMoveImage(idx, -1)} className="p-0.5 bg-black/50 text-white rounded hover:bg-[#009ea8] transition-colors"><ArrowLeft className="w-3 h-3" /></button>
                                                 )}
                                                 {idx < images.length - 1 && (
                                                    <button onClick={() => handleMoveImage(idx, 1)} className="p-0.5 bg-black/50 text-white rounded hover:bg-[#009ea8] transition-colors"><ArrowRight className="w-3 h-3" /></button>
                                                 )}
                                              </div>

                                              <button onClick={() => handleRemoveImage(img.id)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-all scale-75 group-hover/thumb:scale-100 z-30"><X className="w-3 h-3" /></button>
                                           </div>
                                         ))}
                                       </div>
                                     )}

                                     <div className="flex gap-2">
                                        <button onClick={() => fileInputRef.current?.click()} disabled={images.length >= 4 || isProcessingCanvas} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed transition-all font-heading font-black text-[11px] uppercase tracking-wider ${isDarkMode ? 'border-white/10 hover:border-[#009ea8] hover:bg-[#009ea8]/5' : 'border-slate-300 hover:border-[#009ea8] hover:bg-[#009ea8]/5'}`}>
                                           {isProcessingCanvas ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Upload className="w-3.5 h-3.5" />} 
                                           Subir
                                        </button>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileMultiSelect} />
                                        <div className={`flex-[1.5] flex items-center px-3 py-2 rounded-xl border transition-colors ${themeClasses.inputBg} ${images.length >= 4 ? 'opacity-50 pointer-events-none':''}`}>
                                           <input type="url" placeholder="Pegar URL..." value={tempUrlInput} onChange={e => setTempUrlInput(e.target.value)} className="w-full bg-transparent border-none outline-none font-body text-[11px]" />
                                           <button onClick={handleAddUrlImage} className="ml-2 text-[#009ea8] font-black text-[11px] uppercase tracking-widest px-1">Ok</button>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            </div>
                         )}

                         {mode === 'manual' && step === 2 && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                               <div className="space-y-2">
                                  <label className="font-heading font-bold text-sm ml-1">Título Llamativo <span className="text-red-500">*</span></label>
                                  <input type="text" placeholder="Ej: Nintendo Switch OLED - Edición Limitada" value={title} onChange={e => setTitle(e.target.value)} onBlur={() => setTitle(toTitleCase(title))} className={`w-full px-4 py-3 rounded-xl border transition-colors font-body text-[15px] outline-none ${themeClasses.inputBg}`} autoFocus />
                               </div>
                               <div className="space-y-2">
                                  <div className="flex items-center justify-between ml-1 pr-1">
                                    <label className="font-heading font-bold text-sm">Descripción de Valor <span className="text-red-500">*</span></label>
                                    <div className="flex items-center gap-1.5 opacity-60">
                                      <button onMouseDown={e => insertMarkdown(e, '**', '**')} className="p-1 hover:bg-[#009ea8]/20 hover:text-[#009ea8] rounded transition-colors"><Bold className="w-3.5 h-3.5" /></button>
                                      <button onMouseDown={e => insertMarkdown(e, '_', '_')} className="p-1 hover:bg-[#009ea8]/20 hover:text-[#009ea8] rounded transition-colors"><Italic className="w-3.5 h-3.5" /></button>
                                      <button onMouseDown={e => insertMarkdown(e, '- ')} className="p-1 hover:bg-[#009ea8]/20 hover:text-[#009ea8] rounded transition-colors"><List className="w-3.5 h-3.5" /></button>
                                      <button onMouseDown={e => insertMarkdown(e, '[', '](https://)')} className="p-1 hover:bg-[#009ea8]/20 hover:text-[#009ea8] rounded transition-colors"><LinkIcon className="w-3.5 h-3.5" /></button>
                                    </div>
                                  </div>
                                  <textarea ref={descriptionRef} placeholder="Explica detalladamente por qué es un buen precio..." value={description} onChange={e => setDescription(e.target.value)} rows={5} className={`w-full px-4 py-3 rounded-xl border transition-colors font-body text-[15px] outline-none resize-none custom-scrollbar ${themeClasses.inputBg}`} />
                                  
                                  {description.length > 0 && (
                                    <div className={`mt-3 p-4 rounded-xl border border-dashed ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                      <span className="text-[10px] font-heading font-black opacity-40 uppercase tracking-widest block mb-2">Vista Previa Markdown</span>
                                      <div className={`text-sm font-body leading-relaxed md-preview ${themeClasses.textDesc}`}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
                                      </div>
                                    </div>
                                  )}

                                  <div className="text-right text-[11px] font-numbers text-gray-500 mt-1">{description.length} / Min 50 car</div>
                               </div>
                            </div>
                         )}

                         {mode === 'manual' && step === 3 && (
                             <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
                               <div className="space-y-2">
                                  <label className="font-heading font-bold text-[11px] ml-1 uppercase tracking-widest opacity-50">Localización y Moneda <span className="text-red-500">*</span></label>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                     {['MXN', 'ARS', 'CLP', 'COP', 'PEN', 'USD', 'EUR'].map((code) => (
                                       <button
                                         key={code}
                                         type="button"
                                         onClick={() => setCurrency(code)}
                                         className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 transition-all ${currency === code ? 'border-[#009ea8] bg-[#009ea8]/5 ring-4 ring-[#009ea8]/10' : (isDarkMode ? 'border-white/5 bg-white/5 opacity-50 hover:opacity-100' : 'border-slate-200 bg-white opacity-60 hover:opacity-100')}`}
                                       >
                                          <img src={getFlagUrl(code)} alt="" className="w-5 h-auto rounded-sm shadow-sm" />
                                          <span className="text-[10px] font-heading font-black tracking-tight">{code}</span>
                                       </button>
                                     ))}
                                  </div>
                               </div>

                               <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                     <label className="font-heading font-bold text-sm ml-1">Precio Oferta <span className="text-red-500">*</span></label>
                                     <div className={`flex items-center px-4 py-3 rounded-xl border transition-colors ${themeClasses.inputBg}`}>
                                        <DollarSign className="w-5 h-5 text-green-500 mr-2 shrink-0" />
                                        <input type="number" placeholder="299.99" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-transparent border-none outline-none font-numbers font-bold text-lg" autoFocus />
                                     </div>
                                  </div>
                                  <div className="space-y-2">
                                     <label className="font-heading font-bold text-sm ml-1">Precio Original</label>
                                     <div className={`flex items-center px-4 py-3 rounded-xl border transition-colors opacity-80 ${themeClasses.inputBg}`}>
                                        <span className="text-gray-400 font-bold mr-2">$</span>
                                        <input type="number" placeholder="349.99" value={oldPrice} onChange={e => setOldPrice(e.target.value)} className="w-full bg-transparent border-none outline-none font-numbers font-bold line-through text-lg" />
                                     </div>
                                  </div>
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                     <label className="font-heading font-bold text-sm ml-1">Tienda Oficial <span className="text-red-500">*</span></label>
                                     <SearchableDropdown options={STORES} value={store} onChange={setStore} placeholder="Buscar o escribir tienda..." icon={Tag} isDarkMode={isDarkMode} />
                                  </div>
                                  <div className="space-y-2">
                                     <label className="font-heading font-bold text-sm ml-1">Categoría General <span className="text-red-500">*</span></label>
                                     <SearchableDropdown options={CATEGORIES} value={category} onChange={setCategory} placeholder="Buscar o escribir categoría..." icon={Tag} isDarkMode={isDarkMode} />
                                  </div>
                               </div>

                               <div className="space-y-3 pt-2">
                                 <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" checked={hasExpiration} onChange={() => setHasExpiration(!hasExpiration)} className="w-5 h-5 accent-[#009ea8] cursor-pointer" />
                                    <span className="font-heading font-bold text-sm group-hover:text-[#009ea8] transition-colors">¿Esta oferta expirará o tiene unidades limitadas?</span>
                                 </label>
                                 {hasExpiration && (
                                   <div className={`flex items-center px-4 py-3 rounded-xl border transition-colors animate-in slide-in-from-top-2 fade-in ${themeClasses.inputBg}`}>
                                      <Calendar className="w-5 h-5 opacity-50 mr-3 shrink-0" />
                                      <input type="datetime-local" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} min={new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16)} className="w-full bg-transparent border-none outline-none font-body text-[15px] cursor-pointer" />
                                   </div>
                                 )}
                               </div>
                            </div>
                         )}

                         {mode === 'manual' && step === 4 && (
                            <div className="h-full flex flex-col justify-center animate-in slide-in-from-right-4 fade-in duration-300">
                               <div className={`relative p-5 rounded-2xl border shadow-lg overflow-hidden ${isDarkMode ? 'bg-[#111111] border-white/10' : 'bg-white border-slate-200'}`}>
                                  <div className="flex gap-4">
                                     <div className={`w-[100px] h-[100px] rounded-xl flex items-center justify-center p-2 border shrink-0 overflow-hidden bg-white`}>
                                        {images.length > 0 ? <img src={images[0].preview} alt="Portada" className="w-full h-full object-contain" /> : <ImageIcon className="w-8 h-8 opacity-20" />}
                                     </div>
                                     <div className="flex-1 py-1">
                                        <span className="inline-block px-2 py-0.5 rounded text-[9px] font-heading font-extrabold uppercase bg-[#009ea8]/10 text-[#009ea8] mb-1.5">{store === 'Otra (Solicitar)' ? 'Pendiente' : (store || 'Tienda')}</span>
                                        <h4 className={`font-heading font-bold leading-snug line-clamp-2 text-[15px] ${themeClasses.textStrong}`}>{title || 'Misterioso chollo sin título...'}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                           <span className={`text-xl font-numbers font-black ${themeClasses.textStrong}`}>${price || '0'}</span>
                                           {oldPrice && <span className={`text-xs font-numbers font-bold line-through opacity-50 ${themeClasses.textMuted}`}>${oldPrice}</span>}
                                        </div>
                                     </div>
                                  </div>
                                  <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                                     <div className={`text-sm font-body leading-relaxed md-preview ${themeClasses.textDesc}`}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
                                     </div>
                                  </div>
                               </div>
                               <div className="mt-5 p-4 rounded-xl border border-[#009ea8]/30 bg-[#009ea8]/5 flex items-center gap-3">
                                  <Sparkles className="w-6 h-6 text-[#009ea8] shrink-0" />
                                  <p className={`text-sm font-body ${themeClasses.textMuted}`}>¡Saldrán {images.length} foto(s) en tu galería! Presiona publicar para mandarlo a producción.</p>
                                </div>
                            </div>
                         )}
                        </div>
                      </div>

                      <div className={`px-6 md:px-8 py-5 border-t border-inherit ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white shadow-[0_-5px_15_15px_rgba(0,0,0,0.02)]'} flex items-center shrink-0 z-10 ${mode === 'bulk' ? 'justify-end' : 'justify-between'}`}>
                         {mode === 'manual' && (
                           <>
                             <button onClick={handlePrev} className={`px-5 py-3 rounded-2xl text-[10px] font-heading font-black tracking-widest flex items-center gap-2 transition-all hover:translate-x-[-2px] ${step === 1 ? 'opacity-0 pointer-events-none' : (isDarkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-slate-100 text-slate-500')}`}><ChevronLeft className="w-4 h-4 shrink-0" /> ATRÁS</button>
                             {step < 4 ? <button onClick={handleNext} className="bg-[#009ea8] text-white px-8 py-3.5 rounded-2xl text-[11px] font-heading font-black tracking-[0.15em] shadow-2xl shadow-[#009ea8]/20 flex items-center gap-2 hover:-translate-y-1 active:scale-95 transition-all uppercase">SIGUIENTE <ChevronRight className="w-4 h-4 shrink-0" /></button> : <button onClick={handleSubmit} disabled={isSubmitting} className="bg-orange-600 text-white px-10 py-3.5 rounded-2xl text-[11px] font-heading font-black tracking-[0.15em] shadow-2xl shadow-orange-600/30 hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 uppercase">{isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin shrink-0"/>{uploadProgress.total > 0 ? `Subiendo ${uploadProgress.current}/${uploadProgress.total}...` : 'Publicando...'}</> : <><Sparkles className="w-4 h-4 shrink-0" /> PUBLICAR</>}</button>}
                           </>
                         )}
                         {mode === 'bulk' && (
                           <button onClick={handleClose} className="px-8 py-3.5 rounded-2xl text-[11px] font-heading font-black tracking-[0.15em] transition-all bg-white/10 hover:bg-white/20 uppercase">
                              Cerrar Panel
                           </button>
                         )}
                      </div>
                   </div>
                )}
            </div>
        </div>
        <style jsx global>{`
          .md-preview h1, .md-preview h2, .md-preview h3 { font-weight: 900; margin-bottom: 0.5rem; }
          .md-preview ul { list-style-type: disc; margin-left: 1.25rem; }
          .md-preview ol { list-style-type: decimal; margin-left: 1.25rem; }
          .md-preview strong { color: #009ea8; font-weight: 800; }
          .md-preview p { margin-bottom: 0.5rem; }
        `}</style>
    </div>
  );
}
