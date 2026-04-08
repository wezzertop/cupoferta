'use client';
import { InfoPageLayout } from '@/components/layout/InfoPageLayout';

export default function RulesPage() {
  return (
    <InfoPageLayout 
      category="Comunidad"
      title="Directrices del Foro" 
      subtitle="Las reglas básicas para que tengamos una comunidad de ahorro sana y divertida."
    >
      <section>
        <h2>Nuestra Regla de Oro</h2>
        <p>En <strong>CupOferta</strong>, la regla principal es el respeto mutuo. Buscamos compartir chollos que beneficien a todos.</p>
      </section>

      <section>
        <h2>Qué puedes publicar</h2>
        <ul>
          <li><strong>Grandes ofertas:</strong> Descuentos significativos en productos de calidad.</li>
          <li><strong>Cupones:</strong> Códigos de descuento válidos y verificados.</li>
          <li><strong>Errores de precio:</strong> ¡Si encuentras un precio demasiado bueno para ser verdad, avísanos!</li>
        </ul>
      </section>

      <section>
        <h2>Qué NO puedes publicar</h2>
        <ul>
          <li><strong>Spam:</strong> No promociones tus propios sitios web, videos de YouTube o referidos personales sin autorización.</li>
          <li><strong>Ofertas engañosas:</strong> Descuentos falsos o productos de mala reputación.</li>
          <li><strong>Contenido ofensivo:</strong> Insultos, discriminación o lenguaje inapropiado en comentarios o descripciones.</li>
          <li><strong>Publicidad encubierta:</strong> No se permiten publicaciones de vendedores haciéndose pasar por usuarios.</li>
        </ul>
      </section>

      <section>
        <h2>Moderación</h2>
        <p>Nuestro equipo de moderadores tiene la última palabra sobre qué chollos y comentarios cumplen con las reglas. El incumplimiento repetido de estas normas puede resultar en la suspensión temporal o permanente de tu cuenta.</p>
      </section>

      <section>
        <h2>Sistema de Reportes</h2>
        <p>Si ves algo que rompe las reglas, ¡no te quedes callado! Usa el botón de reporte para alertar a los moderadores. Juntos mantenemos la comunidad limpia.</p>
      </section>
    </InfoPageLayout>
  );
}
