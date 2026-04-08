import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { bot_token, channel_id } = await request.json();

    if (!bot_token || !channel_id) {
      return NextResponse.json({ success: false, message: 'Faltan credenciales.' }, { status: 400 });
    }

    const testMessage = '🚀 ¡Hola! Esta es una prueba de conexión desde CupOferta. Si ves esto, ¡la configuración de Telegram es correcta!';

    const url = `https://api.telegram.org/bot${bot_token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channel_id,
        text: testMessage,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json({ 
        success: false, 
        message: `Error de Telegram: ${errorData.description || 'Consulta la terminal para más detalles'}` 
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: '¡Conexión exitosa! Mensaje de prueba enviado.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
