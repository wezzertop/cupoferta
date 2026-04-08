'use client';
import { InfoPageLayout } from '@/components/layout/InfoPageLayout';

export default function AboutPage() {
  return (
    <InfoPageLayout 
      category="Empresa"
      title="Sobre CupOferta" 
      subtitle="La plataforma líder de ahorradores en Latinoamérica."
    >
      <section>
        <h2>Nuestra Misión</h2>
        <p>En <strong>CupOferta</strong>, creemos que comprar de forma inteligente no debería ser una tarea difícil. Nuestra misión es democratizar el ahorro conectando a miles de personas para que compartan los chollos más increíbles del internet.</p>
      </section>

      <section>
        <h2>Cómo Funciona</h2>
        <p>CupOferta es una comunidad donde los usuarios encuentran y publican ofertas, cupones y descuentos. Cada oferta es votada por la comunidad para determinar si es un trato "caliente" o "frío".</p>
      </section>

      <section>
        <h2>Transparencia</h2>
        <p>Somos una plataforma gratuita. Algunos de los enlaces que se publican pueden ser enlaces de afiliados, lo que significa que CupOferta podría recibir una pequeña comisión si realizas una compra. Esto nos ayuda a mantener el sitio libre de publicidad invasiva.</p>
      </section>

      <section>
        <h2>Nuestra Historia</h2>
        <p>Fundada con el objetivo de ayudar a las familias a ahorrar tiempo y dinero, CupOferta ha crecido de ser un pequeño foro a convertirse en la referencia principal de ofertas online en la región.</p>
      </section>
    </InfoPageLayout>
  );
}
