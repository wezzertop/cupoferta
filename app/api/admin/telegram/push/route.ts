import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { formatPrice, getCurrencyFlag, getHighResImageUrl } from '@/lib/utils';

// Helper to extract first image
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

    const { dealId } = await request.json();

    if (!dealId) {
      return NextResponse.json({ error: 'Invalid dealId' }, { status: 400 });
    }

    // 1. Obtener configuración de Telegram
    const { data: telConfig, error: telConfigError } = await supabase
      .from('telegram_config')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (telConfigError || !telConfig || !telConfig.bot_token || !telConfig.channel_id) {
      console.error('[Telegram Push] Config error or missing:', telConfigError, telConfig);
      return NextResponse.json({ error: 'Telegram is not configured' }, { status: 400 });
    }

    // 2. Obtener el deal
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      console.error('[Telegram Push] Deal not found:', dealId, dealError);
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    console.log(`[Telegram Push] Sending deal: ${deal.title} (${deal.id})`);

    // 3. Preparar mensaje
    const escapeHtml = (text: string) =>
      String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cupoferta.com';
    const platformLink = `${siteUrl}/deal/${deal.id}`;
    let message = telConfig.message_template || '🔥 <b>{title}</b>\n💰 {flag} {price}\n\n📌 {store}\n\n<a href="{link}">Ver en tienda</a>';

    // Helper para reemplazar todos los placeholders
    const replaceAll = (str: string, key: string, val: string) => str.split(key).join(val);

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
    const botBase = `https://api.telegram.org/bot${telConfig.bot_token}`;
    const silent = telConfig.silent_notifications !== false;

    // 4. Enviar imagen (binario)
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
            const arrayBuf = await imgFetch.arrayBuffer();
            imageBytes = new Uint8Array(arrayBuf);
            contentType = imgFetch.headers.get('content-type') || 'image/jpeg';
          }
        }

        if (imageBytes && imageBytes.length > 0) {
          const telegramForm = new FormData();
          telegramForm.append('chat_id', telConfig.channel_id);
          telegramForm.append('parse_mode', 'HTML');
          telegramForm.append('caption', message);
          telegramForm.append('reply_markup', JSON.stringify(inlineKeyboard));
          telegramForm.append('disable_notification', silent ? 'true' : 'false');
          telegramForm.append(
            'photo',
            new Blob([imageBytes as any], { type: contentType }),
            'deal_image.jpg'
          );

          console.log('[Telegram Push] Sending photo...');
          const telRes = await fetch(`${botBase}/sendPhoto`, {
            method: 'POST',
            body: telegramForm,
          });

          if (telRes.ok) {
            sent = true;
            console.log('[Telegram Push] Photo sent successfully');
          } else {
            const errText = await telRes.text();
            console.error('[Telegram Push] sendPhoto error:', errText);
          }
        } else {
          console.warn('[Telegram Push] Could not get image bytes for:', rawImageUrl);
        }
      } catch (imgErr) {
        console.error('[Telegram Push] Image error:', imgErr);
      }
    }

    // 5. Fallback a texto
    if (!sent) {
      console.log('[Telegram Push] Sending text message fallback...');
      const telRes = await fetch(`${botBase}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telConfig.channel_id,
          text: message,
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard,
          disable_notification: silent
        }),
      });
      if (!telRes.ok) {
        const errText = await telRes.text();
        console.error('[Telegram Push] sendMessage error:', errText);
        return NextResponse.json({ error: 'Telegram API error', details: errText }, { status: 502 });
      } else {
        sent = true;
        console.log('[Telegram Push] Text message sent successfully (fallback)');
      }
    }

    if (sent) {
      await supabase.from('deals').update({ telegram_posted: true }).eq('id', deal.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
