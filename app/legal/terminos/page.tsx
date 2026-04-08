'use client';
import { InfoPageLayout } from '@/components/layout/InfoPageLayout';

export default function TermsPage() {
  return (
    <InfoPageLayout 
      category="Legal"
      title="Términos y Condiciones de Uso" 
      subtitle="Última actualización: 05 de Abril, 2026"
    >
      <section>
        <h2>1. Aceptación de los Términos</h2>
        <p>Al acceder y utilizar <strong>CupOferta</strong>, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio.</p>
      </section>

      <section>
        <h2>2. Uso del Servicio</h2>
        <p>CupOferta es una plataforma de comunidad para compartir ofertas y chollos. Los usuarios son responsables del contenido que publican y deben seguir nuestras directrices de comunidad.</p>
        <ul>
          <li>Prohibido el spam o la publicidad engañosa.</li>
          <li>Respetar a los demás miembros de la comunidad.</li>
          <li>No publicar enlaces maliciosos o fraudulentos.</li>
        </ul>
      </section>

      <section>
        <h2>3. Registro de Cuenta</h2>
        <p>Para ciertas funciones, como publicar ofertas o comentar, es necesario registrarse. Usted es responsable de mantener la seguridad de sus credenciales de acceso.</p>
      </section>

      <section>
        <h2>4. Propiedad Intelectual</h2>
        <p>Los logos y marcas mostrados en las ofertas pertenecen a sus respectivos dueños. El diseño y código de la plataforma CupOferta es propiedad exclusiva de nuestra empresa.</p>
      </section>

      <section>
        <h2>5. Limitación de Responsabilidad</h2>
        <p>CupOferta no garantiza la veracidad de todas las ofertas publicadas por los usuarios. No nos hacemos responsables de las transacciones realizadas en tiendas externas.</p>
      </section>
    </InfoPageLayout>
  );
}
