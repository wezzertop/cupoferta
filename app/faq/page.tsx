'use client';
import { InfoPageLayout } from '@/components/layout/InfoPageLayout';

export default function FAQPage() {
  return (
    <InfoPageLayout 
      category="Comunidad"
      title="Preguntas Frecuentes (FAQ)" 
      subtitle="Aquí encontrarás las respuestas a las dudas más comunes sobre CupOferta."
    >
      <section>
        <h2>General</h2>
        <h3>¿Qué es CupOferta?</h3>
        <p><strong>CupOferta</strong> es una plataforma comunitaria donde los usuarios comparten y votan las mejores ofertas, cupones y descuentos del mercado en Latinoamérica.</p>

        <h3>¿Es gratis usar CupOferta?</h3>
        <p>Sí, CupOferta es totalmente gratuita para todos los usuarios. No cobramos suscripciones ni cargos por publicar ofertas.</p>

        <h3>¿Venden ustedes los productos?</h3>
        <p>No, CupOferta no es una tienda. Proporcionamos enlaces a las tiendas oficiales (como Amazon, Mercado Libre, Linio, etc.) donde puedes realizar tu compra. Siempre verifica la tienda de destino.</p>
      </section>

      <section>
        <h2>Publicación de Ofertas</h2>
        <h3>¿Cómo puedo publicar una oferta?</h3>
        <p>Solo necesitas estar registrado. Usa el botón "+" en la barra de navegación para abrir el formulario de publicación.</p>

        <h3>¿Qué pasa si mi oferta no aparece?</h3>
        <p>Todas las ofertas nuevas pueden pasar por un proceso de moderación rápido para evitar spam y asegurar la calidad del contenido. Si tu oferta no aparece después de un tiempo, contacta con nosotros.</p>

        <h3>¿Puedo borrar un chollo que publiqué?</h3>
        <p>Sí, desde el detalle de tu chollo puedes solicitar su eliminación o editar los detalles si la oferta ha cambiado.</p>
      </section>

      <section>
        <h2>Cuenta de Usuario</h2>
        <h3>¿Cómo cambio mi avatar o nombre de usuario?</h3>
        <p>Ve a Configuración (el icono del engranaje) en tu menú de usuario para editar tu perfil.</p>

        <h3>¿Cómo recibo alertas de ofertas?</h3>
        <p>Pronto activaremos un sistema de notificaciones personalizadas por palabras clave para que no te pierdas nada que te interese.</p>
      </section>

      <section>
        <h2>Ayuda adicional</h2>
        <p>Si tu pregunta no aparece aquí, no dudes en ponerte en contacto directamente con nuestro equipo de soporte técnico a través del formulario de contacto.</p>
      </section>
    </InfoPageLayout>
  );
}
