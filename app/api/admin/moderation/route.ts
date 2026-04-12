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
      // 1. Actualizar estado en Supabase (En lotes para evitar error de URL demasiado larga)
      const UPDATE_CHUNK_SIZE = 100;
      for (let i = 0; i < dealIds.length; i += UPDATE_CHUNK_SIZE) {
        const chunk = dealIds.slice(i, i + UPDATE_CHUNK_SIZE);
        const { error: updateError } = await supabase
          .from('deals')
          .update({ status: 'approved' })
          .in('id', chunk);
        if (updateError) throw updateError;
      }

      // ───────────────────────────────────────────────────────────────────────
      // 2 & 3. NOTIFICACIONES Y TELEGRAM (Sincrónico por lote)
      // ───────────────────────────────────────────────────────────────────────
      // 2. Notificaciones y Telegram (Pre-fetch de datos antes de responder)
      console.log(`[Moderation API] Approving deals count: ${dealIds.length}`);
      
      const dealsForTelegram: any[] = [];
      for (let i = 0; i < dealIds.length; i += UPDATE_CHUNK_SIZE) {
        const chunk = dealIds.slice(i, i + UPDATE_CHUNK_SIZE);
        const { data: chunkDeals, error: dealsError } = await supabase.from('deals').select('*').in('id', chunk);
        if (dealsError) console.error('[Moderation API] Error fetching deals chunk:', dealsError);
        if (chunkDeals) dealsForTelegram.push(...chunkDeals);
      }
      
      const { data: telConfig, error: telConfigError } = await supabase.from('telegram_config').select('*').limit(1).maybeSingle();
      if (telConfigError) console.error('[Moderation API] Error fetching telegram config:', telConfigError);

      const processExternalActions = async (telData: any, dealsData: any[]) => {
        try {
          if (!dealsData || dealsData.length === 0) {
            console.warn('[Telegram BG] No deals found to process.');
            return;
          }

          // 3.1 Notificar a los usuarios (En Bloque)
          const notifications = dealsData.map(deal => ({
            user_id: deal.user_id,
            actor_id: null,
            type: 'deal_approved',
            reference_id: deal.id,
            content: `¡Enhorabuena! Tu oferta "${deal.title}" ha sido aprobada y ya es pública.`
          }));

          for (let i = 0; i < notifications.length; i += 100) {
            await supabase.from('notifications').insert(notifications.slice(i, i + 100));
          }

      // 3.2 Enviar a Telegram (Uno a uno con retraso)
          if (telData?.bot_token && telData?.channel_id && telData?.is_enabled !== false) {
            const silent = telData.silent_notifications !== false;
            console.log(`[Telegram BG] Starting processing ${dealsData.length} deals (SILENT: ${silent}, Delay: ${telData.post_interval || 3000}ms)`);
            
            const botBase = `https://api.telegram.org/bot${telData.bot_token}`;
            const escapeHtml = (t: string) => String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const replaceAll = (str: string, key: string, val: string) => str.split(key).join(val);
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cupoferta.com';
            
            // Retraso entre mensajes (default 2-3s)
            const delayMs = telData.post_interval || 2500;

            for (let idx = 0; idx < dealsData.length; idx++) {
              const deal = dealsData[idx];
              try {
                const platformLink = `${siteUrl}/deal/${deal.id}`;
                let message = telData.message_template || '🔥 <b>{title}</b>\n💰 {flag} {price}\n\n📌 {store}\n\n<a href="{link}">Ver en tienda</a>';
                
                message = replaceAll(message, '{title}', escapeHtml(deal.title));
                message = replaceAll(message, '{price}', escapeHtml(formatPrice(deal.price || 0, deal.currency)));
                message = replaceAll(message, '{old_price}', escapeHtml(formatPrice(deal.old_price || 0, deal.currency)));
                message = replaceAll(message, '{flag}', getCurrencyFlag(deal.currency));
                message = replaceAll(message, '{currency_code}', deal.currency || 'MXN');
                message = replaceAll(message, '{store}', escapeHtml(deal.store));
                message = replaceAll(message, '{link}', escapeHtml(deal.link || platformLink));

                const inlineKeyboard = {
                  inline_keyboard: [[
                    { text: '🛒 Ir a oferta', url: deal.link || platformLink },
                    { text: '🌐 Ver en CupOferta', url: platformLink }
                  ]]
                };

                const rawImageUrl = getFirstImage(deal.image_url);
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
                      const imgFetch = await fetch(optimizedUrl, { signal: AbortSignal.timeout(10000) });
                      if (imgFetch.ok) {
                        imageBytes = new Uint8Array(await imgFetch.arrayBuffer());
                        contentType = imgFetch.headers.get('content-type') || 'image/jpeg';
                      }
                    }

                    if (imageBytes && imageBytes.length > 0) {
                      const telegramForm = new FormData();
                      telegramForm.append('chat_id', telData.channel_id);
                      telegramForm.append('parse_mode', 'HTML');
                      telegramForm.append('caption', message);
                      telegramForm.append('reply_markup', JSON.stringify(inlineKeyboard));
                      telegramForm.append('disable_notification', 'true'); // SIEMPRE SILENCIOSO
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
                      chat_id: telData.channel_id, 
                      text: message, 
                      parse_mode: 'HTML', 
                      reply_markup: inlineKeyboard,
                      disable_notification: true // SIEMPRE SILENCIOSO
                    }),
                  });
                }
                
                await supabase.from('deals').update({ telegram_posted: true }).eq('id', deal.id);
                
                // Retraso para evitar bans
                if (idx < dealsData.length - 1) {
                  await new Promise(r => setTimeout(r, delayMs));
                }
              } catch (err) { 
                console.error('[Telegram BK] Error en oferta:', deal.id, err); 
              }
            }
            console.log(`[Telegram BG] Batch of ${dealsData.length} finished.`);
          }
        } catch (bgErr) { console.error('[Moderation BG] Global Error:', bgErr); }
      };

      if (!telConfig || !telConfig.bot_token || !telConfig.channel_id) {
        return NextResponse.json({ success: true, warning: 'Lote aprobado pero Telegram no está configurado.' });
      }

      // Filtrar el 10% con mejor descuento para Telegram e Intercalar tiendas
      let dealsToNotify = dealsForTelegram || [];
      if (dealsToNotify.length > 0) {
        // 1. Ordenar por porcentaje de descuento (para tomar los mejores)
        const sorted = [...dealsToNotify].sort((a, b) => {
          const getDisc = (d: any) => (d.old_price && d.price && d.old_price > d.price) ? (1 - d.price / d.old_price) : 0;
          return getDisc(b) - getDisc(a);
        });
        
        // 2. Tomar el 10% superior
        const limit = Math.max(1, Math.ceil(sorted.length * 0.1));
        const topDeals = sorted.slice(0, limit);

        // 3. Intercalar tiendas (Round Robin) para que no salgan todas las de una misma tienda juntas
        const groupedByStore: Record<string, any[]> = {};
        topDeals.forEach(d => {
          const s = d.store || 'Otra';
          if (!groupedByStore[s]) groupedByStore[s] = [];
          groupedByStore[s].push(d);
        });

        const stores = Object.keys(groupedByStore);
        const interleaved: any[] = [];
        let hasMore = true;
        let poolIndex = 0;

        while (hasMore) {
          hasMore = false;
          for (const s of stores) {
            if (groupedByStore[s].length > poolIndex) {
              interleaved.push(groupedByStore[s][poolIndex]);
              hasMore = true;
            }
          }
          poolIndex++;
        }
        
        dealsToNotify = interleaved;
        console.log(`[Moderation API] Filtered and Interleaved ${dealsToNotify.length} deals for Telegram.`);
      }

      // Si el lote es grande (> 5), procesamos al fondo para evitar timeout del navegador
      if (dealsForTelegram && dealsForTelegram.length > 5) {
        processExternalActions(telConfig, dealsToNotify);
        return NextResponse.json({ 
          success: true, 
          message: `Iniciado proceso para ${dealsToNotify.length} ofertas (top 10% de ${dealsForTelegram.length}).`,
          count: dealsForTelegram.length,
          telegram_count: dealsToNotify.length 
        });
      } else {
        await processExternalActions(telConfig, dealsToNotify); 
        return NextResponse.json({ success: true, count: dealsForTelegram?.length || 0, telegram_count: dealsToNotify.length });
      }

    } else if (action === 'reject') {
      const REJECT_CHUNK_SIZE = 100;
      for (let i = 0; i < dealIds.length; i += REJECT_CHUNK_SIZE) {
        const chunk = dealIds.slice(i, i + REJECT_CHUNK_SIZE);
        const { error: updateError } = await supabase
          .from('deals')
          .update({ status: 'rejected' })
          .in('id', chunk);
        if (updateError) throw updateError;
      }

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

    } else if (action === 'delete') {
      const DELETE_CHUNK_SIZE = 100;
      for (let i = 0; i < dealIds.length; i += DELETE_CHUNK_SIZE) {
        const chunk = dealIds.slice(i, i + DELETE_CHUNK_SIZE);
        const { error: deleteError } = await supabase
          .from('deals')
          .delete()
          .in('id', chunk);
        if (deleteError) throw deleteError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Moderation API] Global Error:', err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || 'Error interno del servidor',
      message: err.message || 'Ocurrió un error inesperado al procesar el lote.'
    }, { status: 500 });
  }
}
