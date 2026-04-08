'use client';
import { useUIStore } from '@/lib/store';
import { useState } from 'react';
import { Flame, Instagram, Twitter, Facebook, Github, ExternalLink, ShieldCheck, Mail, Heart, ChevronRight, ChevronDown } from 'lucide-react';

export function Footer() {
  const { isDarkMode } = useUIStore();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const tc = {
    footer: isDarkMode ? 'bg-[#0a0a0a] border-white/5 text-white' : 'bg-[#ebf0f5] border-slate-200 text-slate-900',
    link: isDarkMode ? 'text-gray-500 hover:text-[#009ea8]' : 'text-slate-500 hover:text-[#009ea8]',
    title: isDarkMode ? 'text-gray-300' : 'text-slate-900',
    border: isDarkMode ? 'border-white/5' : 'border-slate-200',
    textStrong: isDarkMode ? 'text-white' : 'text-slate-900',
    accordion: isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100',
  };

  const currentYear = new Date().getFullYear();

  const sections = [
    {
      id: 'comunidad',
      title: 'Comunidad',
      links: [
        { label: 'Blog de Chollos', href: '/blog' },
        { label: 'Guía de Usuario', href: '/guia' },
        { label: 'Preguntas Frecuentes', href: '/faq' },
        { label: 'Directrices del Foro', href: '/reglas' },
      ]
    },
    {
      id: 'legal',
      title: 'Legal',
      links: [
        { label: 'Términos y Condiciones', href: '/legal/terminos' },
        { label: 'Política de Privacidad', href: '/legal/privacidad' },
        { label: 'Política de Cookies', href: '/legal/cookies' },
        { label: 'Aviso Legal', href: '/legal/aviso' },
      ]
    },
    {
      id: 'empresa',
      title: 'Empresa',
      links: [
        { label: 'Sobre CupOferta', href: '/about' },
        { label: 'Contacto', href: '/contacto' },
        { label: 'Soporte Técnico', href: '/soporte' },
        { label: 'Anúnciate', href: '/publicidad' },
      ]
    }
  ];

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <footer className={`mt-8 md:mt-16 border-t pb-[120px] md:pb-12 ${tc.footer}`}>
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-12 lg:py-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg bg-[#009ea8]">
                 <Flame className="w-5 h-5 fill-current" />
               </div>
               <span className={`text-2xl font-heading font-extrabold tracking-tight uppercase italic ${tc.textStrong}`}>CUPOFERTA</span>
            </div>
            <p className={`text-[13px] leading-relaxed max-w-sm ${tc.link} opacity-80 font-body mx-auto lg:mx-0`}>
              La comunidad de ahorro más grande de Latinoamérica. Encuentra y comparte los mejores chollos hoy mismo.
            </p>
            <div className="flex items-center gap-4 justify-center lg:justify-start">
               {[Instagram, Twitter, Facebook, Github].map((Icon, i) => (
                 <a key={i} href="#" className={`w-10 h-10 rounded-xl border ${tc.border} flex items-center justify-center transition-all hover:bg-[#009ea8] hover:text-white hover:-translate-y-1`}>
                    <Icon className="w-5 h-5" />
                 </a>
               ))}
            </div>
          </div>

          {/* Links Sections (Mobile Accordions / Desktop Grid) */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
            {sections.map((section) => (
              <div key={section.title} className="space-y-4 md:space-y-6">
                 {/* Mobile Title with Toggle */}
                 <button 
                   onClick={() => toggleSection(section.id)}
                   className={`flex md:hidden w-full items-center justify-between p-4 rounded-2xl border ${tc.accordion} font-heading font-black text-[11px] uppercase tracking-widest ${tc.title}`}
                 >
                    {section.title}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSection === section.id ? 'rotate-180 text-[#009ea8]' : 'opacity-40'}`} />
                 </button>

                 {/* Desktop Title */}
                 <h4 className={`hidden md:block text-[11px] font-heading font-black uppercase tracking-[0.2em] ${tc.title}`}>
                    {section.title}
                 </h4>

                 {/* Links List */}
                 <ul className={`space-y-3.5 px-4 md:px-0 transition-all duration-300 overflow-hidden ${openSection === section.id ? 'max-h-60 mt-2 mb-4' : 'max-h-0 md:max-h-full opacity-0 md:opacity-100'}`}>
                    {section.links.map((link) => (
                      <li key={link.label}>
                         <a href={link.href} className={`text-[13px] font-body transition-colors ${tc.link} flex items-center group`}>
                            <ChevronRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all mr-2 text-[#009ea8]" />
                            {link.label}
                         </a>
                      </li>
                    ))}
                 </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`pt-10 border-t ${tc.border} flex flex-col lg:flex-row items-center justify-between gap-8`}>
           <div className={`flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-4 lg:gap-6 text-[10px] font-heading font-bold uppercase tracking-widest ${tc.link}`}>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#009ea8]/5 border border-[#009ea8]/10 text-[#009ea8] shadow-sm">
                 <ShieldCheck className="w-3.5 h-3.5" />
                 Safe Site SSL
              </div>
              <div className="flex items-center gap-4 opacity-50">
                <p>&copy; {currentYear}</p>
                <p>LATAM Team</p>
                <div className="flex items-center gap-1.5">
                   Hecho con <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                </div>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
              <a href="mailto:hola@cupoferta.com" className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl border ${tc.border} text-xs font-heading font-black transition-all hover:bg-[#009ea8] hover:text-white hover:border-[#009ea8]`}>
                 <Mail className="w-4 h-4" />
                 hola@cupoferta.com
              </a>
              <div className={`w-10 h-10 rounded-xl bg-[#009ea8]/10 flex items-center justify-center text-[#009ea8] border border-[#009ea8]/20`}>
                 <ExternalLink className="w-4 h-4" />
              </div>
           </div>
        </div>
      </div>

      <style jsx>{`
        footer {
          position: relative;
          z-index: 10;
        }
      `}</style>
    </footer>
  );
}
