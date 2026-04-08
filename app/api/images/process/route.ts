import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processAndUploadImage } from '@/lib/image-processing';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'Se requiere una URL' }, { status: 400 });
    }

    const newUrl = await processAndUploadImage(url, user.id);
    if (!newUrl) {
      return NextResponse.json({ error: 'No se pudo procesar la imagen desde la URL. ¿Es pública?' }, { status: 400 });
    }

    return NextResponse.json({ url: newUrl });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error del servidor procesando imagen url.' }, { status: 500 });
  }
}
