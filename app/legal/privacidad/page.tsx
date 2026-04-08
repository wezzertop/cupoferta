'use client';
import { InfoPageLayout } from '@/components/layout/InfoPageLayout';

export default function PrivacyPage() {
  return (
    <InfoPageLayout 
      category="Legal"
      title="Política de Privacidad" 
      subtitle="Última actualización: 05 de Abril, 2026"
    >
      <section>
        <h2>Introducción</h2>
        <p>En <strong>CupOferta</strong>, valoramos su privacidad tanto como usted valora un buen ahorro. Esta política detalla qué información recopilamos, cómo la usamos y por qué.</p>
      </section>

      <section>
        <h2>¿Qué Información Recopilamos?</h2>
        <p>Recopilamos información básica para que el servicio funcione correctamente:</p>
        <ul>
          <li><strong>Perfil:</strong> Nombre de usuario, email y avatar.</li>
          <li><strong>Uso:</strong> Votos, comentarios y ofertas publicadas.</li>
          <li><strong>Técnico:</strong> Dirección IP y tipo de navegador para prevenir fraudes.</li>
        </ul>
      </section>

      <section>
        <h2>Uso de la Información</h2>
        <p>Su información nunca se vende a terceros. La usamos únicamente para:</p>
        <ul>
          <li>Personalizar su experiencia de usuario.</li>
          <li>Enviar alertas de ofertas si así lo solicita.</li>
          <li>Prevenir ataques de spam y mantener la seguridad de la comunidad.</li>
        </ul>
      </section>

      <section>
        <h2>Sus Derechos</h2>
        <p>Usted tiene derecho a acceder, corregir o eliminar sus datos personales en cualquier momento desde los ajustes de su cuenta o contactando a nuestro soporte.</p>
      </section>
    </InfoPageLayout>
  );
}
