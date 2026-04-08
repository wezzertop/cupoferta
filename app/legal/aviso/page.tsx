'use client';
import { InfoPageLayout } from '@/components/layout/InfoPageLayout';

export default function LegalNoticePage() {
  return (
    <InfoPageLayout 
      category="Legal"
      title="Aviso Legal" 
      subtitle="Información legal sobre el titular de CupOferta."
    >
      <section>
        <h2>Información del Titular</h2>
        <p>En cumplimiento de la legislación vigente, se informa que el sitio web <strong>CupOferta</strong> es propiedad de <strong>CupOferta LATAM Team</strong>, con domicilio legal en Ciudad de México, México.</p>
        <p>Para cualquier consulta o sugerencia, puede contactarnos a través de nuestro correo electrónico: <strong>hola@cupoferta.com</strong></p>
      </section>

      <section>
        <h2>Propiedad Intelectual</h2>
        <p>Todo el contenido de este sitio web, incluyendo textos, gráficos, logos, iconos e imágenes, así como el diseño gráfico y el código fuente, son propiedad exclusiva de CupOferta o de sus respectivos dueños que han autorizado su uso en la plataforma.</p>
      </section>

      <section>
        <h2>Exclusión de Responsabilidades</h2>
        <p>CupOferta no se hace responsable de las opiniones o contenidos publicados por los usuarios en la plataforma. Tampoco garantiza la disponibilidad continua del servicio, aunque haremos todo lo posible por mantener una operativa estable.</p>
        <p>Los enlaces externos que redirigen a tiendas de terceros son responsabilidad exclusiva de dichas tiendas.</p>
      </section>

      <section>
        <h2>Jurisdicción Aplicable</h2>
        <p>Cualquier controversia relacionada con el uso de este sitio web estará sujeta a la legislación y tribunales competentes de México, salvo disposición legal en contrario.</p>
      </section>
    </InfoPageLayout>
  );
}
