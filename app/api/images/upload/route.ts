import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/images/upload
 *
 * Recibe un archivo de imagen via FormData, lo sube a ImgBB y retorna
 * la URL directa pública permanente (i.ibb.co/XXXXX/nombre.jpg).
 *
 * - Sin límites de almacenamiento en ImgBB (free tier)
 * - URLs permanentes: nunca expiran si no se pasa `expiration`
 * - CDN global de alto rendimiento
 * - Telegram acepta perfectamente URLs de i.ibb.co
 */
export async function POST(request: NextRequest) {
  try {
    // ── Verificar autenticación ──────────────────────────────────────────────
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // ── Validar API Key ──────────────────────────────────────────────────────
    const IMGBB_API_KEY = process.env.IMGBB_API_KEY;
    if (!IMGBB_API_KEY) {
      console.error('[ImgBB] IMGBB_API_KEY no definida en .env.local');
      return NextResponse.json(
        { error: 'Servicio de imágenes no configurado en el servidor.' },
        { status: 500 }
      );
    }

    // ── Leer archivo del FormData ────────────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No se recibió ningún archivo de imagen.' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen válida (jpg, png, webp…).' },
        { status: 400 }
      );
    }

    // Max 32 MB (límite de ImgBB)
    const MAX_BYTES = 32 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'La imagen supera el tamaño máximo permitido (32 MB).' },
        { status: 400 }
      );
    }

    // ── Convertir a Base64 ───────────────────────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // ── Subir a ImgBB ────────────────────────────────────────────────────────
    const imgbbForm = new FormData();
    imgbbForm.append('key', IMGBB_API_KEY);
    imgbbForm.append('image', base64);
    imgbbForm.append('name', `cupoferta_${user.id.slice(0, 8)}_${Date.now()}`);
    // Sin 'expiration' → imagen permanente

    const imgbbRes = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbForm,
      signal: AbortSignal.timeout(30_000), // 30 s máximo
    });

    // ── Manejar errores de ImgBB ─────────────────────────────────────────────
    if (!imgbbRes.ok) {
      const raw = await imgbbRes.text();
      console.error('[ImgBB] Error HTTP:', imgbbRes.status, raw);
      return NextResponse.json(
        { error: `Error al subir imagen (ImgBB ${imgbbRes.status}). Inténtalo de nuevo.` },
        { status: 502 }
      );
    }

    const json = await imgbbRes.json();

    if (!json.success || !json.data?.url) {
      console.error('[ImgBB] Respuesta inesperada:', json);
      return NextResponse.json(
        { error: 'ImgBB no devolvió una URL válida. Inténtalo de nuevo.' },
        { status: 502 }
      );
    }

    // ── Extraer URLs útiles ──────────────────────────────────────────────────
    // json.data.url        → URL directa a la imagen (JPEG/PNG)   ← usar esta
    // json.data.display_url→ igual pero con parámetro de tamaño
    // json.data.thumb.url  → miniatura
    // json.data.delete_url → para borrar si hace falta
    const publicUrl: string   = json.data.url;
    const deleteUrl: string   = json.data.delete_url;

    console.log(`[ImgBB] ✅ Imagen subida: ${publicUrl}`);

    return NextResponse.json({
      url: publicUrl,
      delete_url: deleteUrl,
    });

  } catch (err: any) {
    console.error('[ImgBB] Error interno:', err);
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar la imagen.' },
      { status: 500 }
    );
  }
}
