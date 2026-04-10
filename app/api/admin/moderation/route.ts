import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { formatPrice, getCurrencyFlag, getHighResImageUrl } from '@/lib/utils';

// Inline helper
function getFirstImage(urlData: any): string | null {
  if (!urlData) return null;
  if (Array.isArray(urlData) && urlData.length > 0) return urlData[0];
  const urlStr = String(urlData).trim();
  if (urlStr.startsWith('[')) {
    try { const p = JSON.parse(urlStr); if (Array.isArray(p) && p.length > 0) return p[0]; } catch {}
  }
  // No separar si es una Data URL (Base64)
  if (urlStr.includes(',') && !urlStr.startsWith('data:')) return urlStr.split(',')[0].trim();
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
      // 1. Actualizar estado en Supabase (CRÍTICO)
      const { error: updateError } = await supabase
        .from('deals')
        .update({ status: 'approved' })
        .in('id', dealIds);

      if (updateError) throw updateError;

      // ───────────────────────────────────────────────────────────────────────
      // 2 & 3. NOTIFICACIONES Y TELEGRAM (Sincrónico por lote)
      // ───────────────────────────────────────────────────────────────────────
      const processExternalActions = async () => {
        try {
          const { data: telConfig } = await supabase.from('telegram_config').select('*').limit(1).maybeSingle();
          const { data: deals } = await supabase.from('deals').select('*').in('id', dealIds);

          if (!deals) return;

          // 3.1 Notificar a los usuarios (En Bloque)
          const notifications = deals.map(deal => ({
            user_id: deal.user_id,
            actor_id: null,
            type: 'deal_approved',
            reference_id: deal.id,
            content: `¡Enhorabuena! Tu oferta "${deal.title}" ha sido aprobada y ya es pública.`
          }));

          for (let i = 0; i < notifications.length; i += 100) {
            await supabase.from('notifications').insert(notifications.slice(i, i + 100));
          }

          // 3.2 Enviar a Telegram
          if (telConfig?.bot_token && telConfig?.channel_id) {
            for (const deal of deals) {
              try {
                const escapeHtml = (t: string) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cupoferta.com';
                const platformLink = `${siteUrl}/deal/${deal.id}`;
                
                let message = telConfig.message_template || '🔥 <b>{title}</b>\n💰 {flag} {price}\n\n📌 {store}\n\n<a href="{link}">Ver en tienda</a>';
                message = message
                  .replace('{title}', escapeHtml(deal.title || ''))
                  .replace('{price}', escapeHtml(formatPrice(deal.price || 0, deal.currency)))
                  .replace('{old_price}', escapeHtml(formatPrice(deal.old_price || 0, deal.currency)))
                  .replace('{flag}', getCurrencyFlag(deal.currency))
                  .replace('{currency_code}', deal.currency || 'MXN')
                  .replace('{store}', escapeHtml(deal.store || ''))
                  .replace('{link}', deal.link || platformLink);

                const inlineKeyboard = {
                  inline_keyboard: [[
                    { text: '🛒 Ir a oferta', url: deal.link || platformLink },
                    { text: '🌐 Ver en CupOferta', url: platformLink }
                  ]]
                };

                const rawImageUrl = getFirstImage(deal.image_url);
                const botBase = `https://api.telegram.org/bot${telConfig.bot_token}`;
                let sent = false;

                if (rawImageUrl) {
                  try {
                    let imageBytes: Uint8Array | null = null;
                    let contentType = 'image/jpeg';

                    if (rawImageUrl.startsWith('data:')) {
                      const match = rawImageUrl.match(/^data:([^;]+);base64,(.+)$/s);
                      if (match) {
                        contentType = match[1];
                        imageBytes = new Uint8Array(Buffer.from(match[2], 'base64'));
                      }
                    } else if (rawImageUrl.startsWith('http')) {
                      const optimizedUrl = getHighResImageUrl(rawImageUrl);
                      const imgFetch = await fetch(optimizedUrl, { signal: AbortSignal.timeout(2000) });
                      if (imgFetch.ok) {
                        imageBytes = new Uint8Array(await imgFetch.arrayBuffer());
                        contentType = imgFetch.headers.get('content-type') || 'image/jpeg';
                      }
                    }

                    if (imageBytes && imageBytes.length > 0) {
                      const telegramForm = new FormData();
                      telegramForm.append('chat_id', telConfig.channel_id);
                      telegramForm.append('parse_mode', 'HTML');
                      telegramForm.append('caption', message);
                      telegramForm.append('reply_markup', JSON.stringify(inlineKeyboard));
                      telegramForm.append('photo', new Blob([imageBytes as any], { type: contentType }), 'image.jpg');

                      const telRes = await fetch(`${botBase}/sendPhoto`, { method: 'POST', body: telegramForm });
                      if (telRes.ok) sent = true;
                    }
                  } catch (imgErr) { console.warn('[Telegram] Image error:', imgErr); }
                }

                if (!sent) {
                  await fetch(`${botBase}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chat_id: telConfig.channel_id,
                      text: message,
                      parse_mode: 'HTML',
                      reply_markup: inlineKeyboard
                    }),
                  });
                }
                
                // Delay obligatorio para respetar rate limits de Telegram
                await new Promise(r => setTimeout(r, 500));

                // 3.3 Marcar como enviado en la DB
                await supabase.from('deals').update({ telegram_posted: true }).eq('id', deal.id);

              } catch (err) { console.error('[Telegram] Loop error:', err); }
            }
          }
        } catch (bgErr) {
          console.error('[Moderation] Processing Error:', bgErr);
        }
      };

      // Siempre esperamos la respuesta del lote
      await processExternalActions();
      return NextResponse.json({ success: true });

    } else if (action === 'reject') {
      const { error: updateError } = await supabase
        .from('deals')
        .update({ status: 'rejected' })
        .in('id', dealIds);

      if (updateError) throw updateError;

      // Notificaciones de rechazo en segundo plano
      const processRejectNotifs = async () => {
        const { data: dealsToReject } = await supabase.from('deals').select('id, user_id, title').in('id', dealIds);
        if (dealsToReject) {
          const rejectNotifs = dealsToReject.map(deal => ({
            user_id: deal.user_id,
            actor_id: null,
            type: 'deal_rejected',
            reference_id: deal.id,
            content: `Lo sentimos, tu oferta "${deal.title}" no ha sido aprobada. Revisa nuestras normas de publicación.`
          }));
          for (let i = 0; i < rejectNotifs.length; i += 100) {
            await supabase.from('notifications').insert(rejectNotifs.slice(i, i + 100));
          }
        }
      };
      
      if (dealIds.length > 10) processRejectNotifs();
      else await processRejectNotifs();
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Moderation API] Global Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
