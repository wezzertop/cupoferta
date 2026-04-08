'use client';
import { InfoPageLayout } from '@/components/layout/InfoPageLayout';

export default function CookiesPage() {
  return (
    <InfoPageLayout 
      category="Legal"
      title="Política de Cookies" 
      subtitle="Última actualización: 05 de Abril, 2026"
    >
      <section>
        <h2>¿Qué es una Cookie?</h2>
        <p>Una cookie es un pequeño archivo que se almacena en su ordenador para recordar detalles breves mientras navega.</p>
      </section>

      <section>
        <h2>Tipos de Cookies que Usamos</h2>
        <ul>
          <li><strong>Cookies Esenciales:</strong> Necesarias para iniciar sesión y que el sitio funcione básicamenete.</li>
          <li><strong>Cookies de Rendimiento:</strong> Para analizar el tráfico y saber qué ofertas son las más populares.</li>
          <li><strong>Cookies de Funcionalidad:</strong> Recordar su configuración de tema (Oscuro o Claro).</li>
        </ul>
      </section>

      <section>
        <h2>Gestionar Cookies</h2>
        <p>La mayoría de los navegadores le permiten borrar o bloquear cookies en sus servicios de configuración. Sin embargo, esto puede afectar negativamente su experiencia de uso en CupOferta.</p>
      </section>

      <section>
        <h2>Cookies de Terceros</h2>
        <p>Utilizamos herramientas como Google Analytics para mediciones internas y Firebase para notificaciones en tiempo real, las cuales podrían colocar cookies en su navegador.</p>
      </section>
    </InfoPageLayout>
  );
}
