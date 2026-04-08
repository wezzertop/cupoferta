import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { reportId, action, target_type, target_id, reason, details } = await request.json();

    // If it's a new report (POST normally from user side, but keeping it here for simplicity)
    if (action === 'report') {
        const { error } = await supabase.from('reports').insert({
            reporter_id: user.id,
            target_type,
            target_id,
            reason,
            details,
            status: 'pending'
        });
        if (error) throw error;
        return NextResponse.json({ success: true });
    }

    // --- Actions below require Admin privileges ---
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if (!reportId) return NextResponse.json({ error: 'Invalid reportId' }, { status: 400 });

    if (action === 'resolve') {
        const { error } = await supabase
            .from('reports')
            .update({ status: 'resolved' })
            .eq('id', reportId);
        if (error) throw error;
    } else if (action === 'dismiss') {
        const { error } = await supabase
            .from('reports')
            .update({ status: 'dismissed' })
            .eq('id', reportId);
        if (error) throw error;
    } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
