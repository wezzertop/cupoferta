'use client';
import { InfoPageLayout } from '@/components/layout/InfoPageLayout';

export default function BlogPage() {
  return (
    <InfoPageLayout 
      category="Comunidad"
      title="Blog de Chollos" 
      subtitle="Noticias, tutoriales y los mejores consejos para convertirte en un experto del ahorro."
    >
      <section>
        <h2>Bienvenidos a nuestro Blog</h2>
        <p>En el Blog de <strong>CupOferta</strong> no solo compartimos ofertas; te enseñamos cómo encontrarlas. Desde guías detalladas sobre cómo comprar en tiendas internacionales hasta comparativas de productos tecnológicos, nuestro objetivo es educar al consumidor latinoamericano.</p>
      </section>

      <section>
        <h2>Categorías Destacadas</h2>
        <ul>
          <li><strong>Tutoriales de Compra:</strong> Cómo comprar en Amazon, AliExpress y otras tiendas globales desde Latinoamérica.</li>
          <li><strong>Análisis de Productos:</strong> Revisamos los gadgets más calientes del momento para decirte si realmente valen la pena.</li>
          <li><strong>Eventos Especiales:</strong> Cobertura total de Black Friday, Cyber Monday, Hot Sale y Buen Fin.</li>
          <li><strong>Lifehacks de Ahorro:</strong> Pequeños trucos que marcan la diferencia en tu presupuesto mensual.</li>
        </ul>
      </section>

      <section>
        <h2>¿Quieres colaborar?</h2>
        <p>Si eres un apasionado del ahorro y te gusta escribir, nuestro blog está abierto a contribuciones de la comunidad. Escríbenos a través de nuestra sección de contacto para más información sobre cómo ser un autor invitado.</p>
      </section>

      <section>
        <h2>Nuestros últimos artículos</h2>
        <p>Próximamente estaremos publicando contenido semanal exclusivo. Mantente atento y no te pierdas ninguna actualización para seguir ahorrando con la comunidad más grande de la región.</p>
      </section>
    </InfoPageLayout>
  );
}
