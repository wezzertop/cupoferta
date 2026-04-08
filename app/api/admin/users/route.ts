import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verificar si es admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { userId, action } = await request.json();

    if (!userId) return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });

    let updateData: any = {};
    
    if (action === 'ban') {
      updateData = { is_banned: true };
    } else if (action === 'unban') {
      updateData = { is_banned: false };
    } else if (action === 'make_admin') {
      updateData = { role: 'admin' };
    } else if (action === 'make_user') {
      updateData = { role: 'user' };
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (updateError) throw updateError;

    // Log the action (optional, depends if moderation_logs exists)
    try {
      await supabase.from('moderation_logs').insert({
        admin_id: user.id,
        action: `${action}_user`,
        target_id: userId,
        details: { action, timestamp: new Date().toISOString() }
      });
    } catch (logErr) {
      console.error('Error logging moderation action:', logErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
