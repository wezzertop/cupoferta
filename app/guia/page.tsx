'use client';
import { InfoPageLayout } from '@/components/layout/InfoPageLayout';

export default function GuiaPage() {
  return (
    <InfoPageLayout 
      category="Comunidad"
      title="Guía de Usuario" 
      subtitle="Todo lo que necesitas saber para sacarle el máximo provecho a CupOferta."
    >
      <section>
        <h2>Introducción</h2>
        <p>En <strong>CupOferta</strong>, todos somos un equipo de expertos en ahorro. Esta guía te ayudará a entender los principios básicos de nuestra plataforma para que puedas compartir y encontrar los mejores chollos con confianza.</p>
      </section>

      <section>
        <h2>¿Qué es un Chollo?</h2>
        <p>Un chollo es una oferta, cupón o descuento que realmente destaca sobre el precio de mercado. Buscamos compartir gangas que sean de alto interés para la comunidad y que ofrezcan un ahorro real y tangible.</p>
      </section>

      <section>
        <h2>Cómo publicar tu primer Chollo</h2>
        <ol>
          <li><strong>Busca la oferta:</strong> Asegúrate de que el precio sea realmente bueno en comparación con otras tiendas.</li>
          <li><strong>Usa el botón "+":</strong> En la versión móvil o el botón "Compartir Chollo" en escritorio.</li>
          <li><strong>Detalles claros:</strong> Pon un título descriptivo, el precio actual y el precio anterior, y una breve descripción de por qué es una buena oferta.</li>
          <li><strong>Adjunta una foto:</strong> Una imagen clara del producto ayuda a que el chollo sea más atractivo.</li>
        </ol>
      </section>

      <section>
        <h2>¿Cómo funcionan las temperaturas?</h2>
        <p>La comunidad vota cada chollo. Si los usuarios creen que es una gran oferta, el chollo se calienta (+ temperatura 🔥). Si el precio es normal o la oferta no es real, se enfría (- temperatura ❄️). ¡Los chollos más calientes llegan a la portada!</p>
      </section>

      <section>
        <h2>Comentarios y Votaciones</h2>
        <p>Te animamos a que interactúes con otros usuarios. Si has comprado el producto, comparte tu experiencia en los comentarios. Tus opiniones ayudan a otros a tomar mejores decisiones de compra.</p>
      </section>
    </InfoPageLayout>
  );
}
