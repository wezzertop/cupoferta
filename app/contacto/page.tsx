'use client';
import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import { Mail, Clock, MessageSquare, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <InfoPageLayout 
      category="Empresa"
      title="Contacto y Soporte" 
      subtitle="¿Alguna duda, sugerencia o una gran oferta para compartir? Estamos aquí para ayudarte."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="p-6 rounded-2xl bg-[#009ea8]/5 border border-[#009ea8]/20">
           <Mail className="w-8 h-8 text-[#009ea8] mb-4" />
           <h3 className="text-xl font-heading font-black mb-2">Correo Electrónico</h3>
           <p className="text-sm opacity-60">General: hola@cupoferta.com</p>
           <p className="text-sm opacity-60">Soporte: ayuda@cupoferta.com</p>
        </div>
        <div className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/20">
           <MessageSquare className="w-8 h-8 text-orange-500 mb-4" />
           <h3 className="text-xl font-heading font-black mb-2">Comunidad</h3>
           <p className="text-sm opacity-60">Únete a nuestro Discord oficial o comparte tu duda en el foro.</p>
        </div>
      </div>

      <section>
        <h2>Horarios de Atención</h2>
        <p>Nuestro equipo de soporte suele responder en menos de 24 horas hábiles.</p>
        <ul>
          <li><strong>Lunes a Viernes:</strong> 9:00 AM - 6:00 PM (Hora LATAM)</li>
          <li><strong>Sábados:</strong> Soporte de emergencia para ofertas de alto impacto.</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2>Formulario de Contacto</h2>
        <form className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Nombre completo" className="w-full p-4 rounded-xl bg-black/10 border border-white/5 focus:border-[#009ea8] outline-none" />
              <input type="email" placeholder="Correo electrónico" className="w-full p-4 rounded-xl bg-black/10 border border-white/5 focus:border-[#009ea8] outline-none" />
           </div>
           <select className="w-full p-4 rounded-xl bg-black/10 border border-white/5 focus:border-[#009ea8] outline-none">
              <option>General</option>
              <option>Reportar Bug</option>
              <option>Anunciarse</option>
              <option>Problema con una oferta</option>
           </select>
           <textarea rows={5} placeholder="Tu mensaje detallado..." className="w-full p-4 rounded-xl bg-black/10 border border-white/5 focus:border-[#009ea8] outline-none resize-none" />
           <button type="button" className="w-full py-4 bg-[#009ea8] text-white font-heading font-black rounded-xl shadow-lg shadow-[#009ea8]/20 flex items-center justify-center gap-2 hover:-translate-y-1 transition-all">
              <Send className="w-4 h-4" /> Enviar Mensaje
           </button>
        </form>
      </section>
    </InfoPageLayout>
  );
}
