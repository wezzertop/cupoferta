import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { formatPrice, getCurrencyFlag } from '@/lib/utils';

// Helper to extract first image
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

    const { dealId } = await request.json();

    if (!dealId) {
      return NextResponse.json({ error: 'Invalid dealId' }, { status: 400 });
    }

    // 1. Obtener configuración de Telegram
    const { data: telConfig, error: telError } = await supabase
      .from('telegram_config')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (telError || !telConfig || !telConfig.bot_token || !telConfig.channel_id) {
      return NextResponse.json({ error: 'Telegram is not configured' }, { status: 400 });
    }

    // 2. Obtener el deal
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // 3. Preparar mensaje
    const escapeHtml = (text: string) =>
      String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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
        { text: '🛒 Ir al chollo', url: deal.link || platformLink },
        { text: '🌐 Ver más en CupOferta', url: platformLink }
      ]]
    };

    const rawImageUrl = getFirstImage(deal.image_url);
    const botBase = `https://api.telegram.org/bot${telConfig.bot_token}`;
    let sent = false;

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
          const imgFetch = await fetch(rawImageUrl, { signal: AbortSignal.timeout(15_000) });
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
          telegramForm.append(
            'photo',
            new Blob([imageBytes as any], { type: contentType }),
            'deal_image.jpg'
          );

          const telRes = await fetch(`${botBase}/sendPhoto`, {
            method: 'POST',
            body: telegramForm,
          });

          if (telRes.ok) sent = true;
        }
      } catch (imgErr) {
        console.error('[Telegram Push] Image error:', imgErr);
      }
    }

    // 5. Fallback a texto
    if (!sent) {
      const telRes = await fetch(`${botBase}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telConfig.channel_id,
          text: message,
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard,
        }),
      });
      if (!telRes.ok) {
        const errText = await telRes.text();
        return NextResponse.json({ error: 'Telegram API error', details: errText }, { status: 502 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
