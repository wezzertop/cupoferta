
import { createClient } from '@/lib/supabase/server';
import { Metadata, ResolvingMetadata } from 'next';
import { redirect } from 'next/navigation';

interface Props {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// ── SEO & Social Media Previews ─────────────────────────────
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const supabase = createClient();
  const { data: deal } = await supabase
    .from('deals')
    .select('title, description, image_url, store, price')
    .eq('id', params.id)
    .single();

  if (!deal) {
    return {
      title: 'CupOferta - Oferta no encontrada',
    };
  }

  // Obtener la primera imagen
  let firstImage = '';
  if (deal.image_url) {
    if (Array.isArray(deal.image_url)) firstImage = deal.image_url[0];
    else if (deal.image_url.startsWith('[')) {
      try { const p = JSON.parse(deal.image_url); if (p.length > 0) firstImage = p[0]; } catch {}
    } else if (deal.image_url.includes(',')) firstImage = deal.image_url.split(',')[0].trim();
    else firstImage = deal.image_url;
  }

  return {
    title: `${deal.title} - ${deal.store} | CupOferta`,
    description: deal.description?.slice(0, 160) || 'Descubre esta oferta en CupOferta, la comunidad #1 de ahorradores.',
    openGraph: {
      title: deal.title,
      description: deal.description,
      images: firstImage ? [firstImage] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: deal.title,
      description: deal.description,
      images: firstImage ? [firstImage] : [],
    },
  };
}

export default async function DealPage({ params }: Props) {
  // Simplemente redirigimos a la home con el parámetro del chollo
  // Esto permite que la Home maneje la apertura del modal/drawer de forma centralizada
  // pero manteniendo los meta-tags correctos para esta URL específica.
  redirect(`/?deal=${params.id}`);
}
