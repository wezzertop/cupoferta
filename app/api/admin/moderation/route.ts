import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Inline helper
function getFirstImage(urlData: any): string | null {
  if (!urlData) return null;
  if (Array.isArray(urlData) && urlData.length > 0) return urlData[0];
  const urlStr = String(urlData).trim();
  if (urlStr.startsWith('[')) {
    try { const p = JSON.parse(urlStr); if (Array.isArray(p) && p.length > 0) return p[0]; } catch {}
  }
  if (urlStr.includes(',')) return urlStr.split(',')[0].trim();
  return urlStr || null;
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { dealIds, action } = await request.json();

    if (!dealIds || !Array.isArray(dealIds)) {
      return NextResponse.json({ error: 'Invalid dealIds' }, { status: 400 });
    }

    if (action === 'approve') {
      // 1. Actualizar estado en Supabase
      const { error: updateError } = await supabase
        .from('deals')
        .update({ status: 'approved' })
        .in('id', dealIds);

      if (updateError) throw updateError;

      // 2. Obtener configuración de Telegram
      const { data: telConfig, error: telError } = await supabase
        .from('telegram_config')
        .select('*')
        .limit(1)
        .maybeSingle();

      console.log('[Telegram] Config:', telConfig ? `token=${telConfig.bot_token?.slice(0,10)}... canal=${telConfig.channel_id}` : 'SIN CONFIG');
      if (telError) console.error('[Telegram] Error al leer config:', telError);

      if (telConfig && telConfig.bot_token && telConfig.channel_id) {
        // 3. Obtener deals para notificar
        const { data: deals } = await supabase
          .from('deals')
          .select('*')
          .in('id', dealIds);

        console.log('[Telegram] Deals a publicar:', deals?.length ?? 0);

        if (deals) {
          for (const deal of deals) {
            // -- Notificar al usuario --
            try {
              await supabase.from('notifications').insert({
                user_id: deal.user_id,
                actor_id: null,
                type: 'deal_approved',
                reference_id: deal.id,
                content: `¡Enhorabuena! Tu oferta "${deal.title}" ha sido aprobada y ya es pública.`
              });
            } catch (notifErr) {
              console.error('Error sending approval notification:', notifErr);
            }

            // Escapar HTML
            const escapeHtml = (text: string) =>
              String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            const platformLink = `https://cupoferta.com/deal/${deal.id}`;
            let message = telConfig.message_template || '🔥 <b>{title}</b>\n💰 {price}€\n\n📌 {store}\n\n<a href="{link}">Ver en tienda</a>';

            message = message
              .replace('{title}', escapeHtml(deal.title || ''))
              .replace('{price}', escapeHtml((deal.price || 0).toString()))
              .replace('{old_price}', escapeHtml((deal.old_price || 0).toString()))
              .replace('{store}', escapeHtml(deal.store || ''))
              .replace('{link}', deal.link || platformLink);

            const inlineKeyboard = {
              inline_keyboard: [[
                { text: '🛒 Ir al chollo', url: deal.link || platformLink },
                { text: '🌐 Ver más en CupOferta', url: platformLink }
              ]]
            };

            // Obtener la primera imagen del deal
            const rawImageUrl = getFirstImage(deal.image_url);

            // ── Enviar a Telegram ───────────────────────────────────────────────────
            try {
              const botBase = `https://api.telegram.org/bot${telConfig.bot_token}`;
              let sent = false;

              // Estrategia: siempre enviamos BYTES a Telegram (multipart/form-data).
              // Soportamos dos formatos:
              //   1. data:image/jpeg;base64,... → decodificar a Buffer directamente
              //   2. https://...               → descargar desde el servidor y obtener Buffer
              // Así Telegram nunca intenta descargar nada por su cuenta → 0 errores de acceso.

              if (rawImageUrl) {
                try {
                  let imageBytes: Uint8Array | null = null;
                  let contentType = 'image/jpeg';

                  if (rawImageUrl.startsWith('data:')) {
                    // ── Caso 1: Base64 data URL ──────────────────────────────────
                    const match = rawImageUrl.match(/^data:([^;]+);base64,(.+)$/s);
                    if (match) {
                      contentType = match[1];
                      imageBytes = new Uint8Array(Buffer.from(match[2], 'base64'));
                      console.log('[Telegram] Imagen base64 decodificada:', imageBytes.length, 'bytes');
                    } else {
                      console.warn('[Telegram] data: URL con formato inesperado, se omitirá la imagen.');
                    }

                  } else if (rawImageUrl.startsWith('http')) {
                    // ── Caso 2: URL HTTP/HTTPS ───────────────────────────────────
                    console.log('[Telegram] Descargando imagen desde URL:', rawImageUrl.slice(0, 80));
                    const imgFetch = await fetch(rawImageUrl, { signal: AbortSignal.timeout(15_000) });
                    if (imgFetch.ok) {
                      const arrayBuf = await imgFetch.arrayBuffer();
                      imageBytes = new Uint8Array(arrayBuf);
                      contentType = imgFetch.headers.get('content-type') || 'image/jpeg';
                      console.log('[Telegram] Imagen descargada:', imageBytes.length, 'bytes');
                    } else {
                      console.warn('[Telegram] No se pudo descargar la imagen:', imgFetch.status);
                    }
                  }

                  // ── Enviar como archivo binario (multipart) ──────────────────
                  if (imageBytes && imageBytes.length > 0) {
                    const telegramForm = new FormData();
                    telegramForm.append('chat_id', telConfig.channel_id);
                    telegramForm.append('parse_mode', 'HTML');
                    telegramForm.append('caption', message);
                    telegramForm.append('reply_markup', JSON.stringify(inlineKeyboard));
                    telegramForm.append(
                      'photo',
                      new Blob([imageBytes], { type: contentType }),
                      'deal_image.jpg'
                    );

                    const telRes = await fetch(`${botBase}/sendPhoto`, {
                      method: 'POST',
                      body: telegramForm,
                    });

                    if (telRes.ok) {
                      console.log('[Telegram] ✅ sendPhoto (binario) enviado con éxito.');
                      sent = true;
                    } else {
                      const errText = await telRes.text();
                      console.error('[Telegram] sendPhoto falló:', telRes.status, errText);
                    }
                  }

                } catch (imgErr) {
                  console.warn('[Telegram] Error al procesar imagen:', imgErr);
                }
              }

              // ── Fallback: solo texto si la imagen falló ──────────────────────
              if (!sent) {
                console.log('[Telegram] Enviando solo texto (sin imagen).');
                const telRes = await fetch(`${botBase}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: telConfig.channel_id,
                    text: message,
                    parse_mode: 'HTML',
                    reply_markup: inlineKeyboard,
                    disable_web_page_preview: false,
                  }),
                });

                if (telRes.ok) {
                  console.log('[Telegram] ✅ sendMessage (texto) enviado con éxito.');
                } else {
                  const errText = await telRes.text();
                  console.error('[Telegram] sendMessage falló:', telRes.status, errText);
                }
              }

            } catch (err) {
              console.error('[Telegram] Error general al enviar:', err);
            }
          }
        }
      }

    } else if (action === 'reject') {
      const { data: dealsToReject } = await supabase
        .from('deals')
        .select('id, user_id, title')
        .in('id', dealIds);

      const { error: updateError } = await supabase
        .from('deals')
        .update({ status: 'rejected' })
        .in('id', dealIds);

      if (updateError) throw updateError;

      if (dealsToReject) {
        for (const deal of dealsToReject) {
          try {
            await supabase.from('notifications').insert({
              user_id: deal.user_id,
              actor_id: null,
              type: 'deal_rejected',
              reference_id: deal.id,
              content: `Lo sentimos, tu oferta "${deal.title}" no ha sido aprobada. Revisa nuestras normas de publicación.`
            });
          } catch (notifErr) {
            console.error('Error sending rejection notification:', notifErr);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
