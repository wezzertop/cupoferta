import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all official stores (public)
export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('official_stores')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, stores: data || [] });
  } catch (err: any) {
    // Si la tabla no existe aún, devolver lista vacía en vez de error 500
    if (err.message?.includes('does not exist') || err.code === '42P01') {
      return NextResponse.json({ success: true, stores: [] });
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Create or update a store (admin only)
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    
    // Verificar autenticación y permisos de admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { action, store } = body;

    if (action === 'create') {
      // Generate slug from name
      const slug = store.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      const { data, error } = await supabase
        .from('official_stores')
        .insert([{
          name: store.name,
          slug,
          logo_url: store.logo_url || null,
          color_primary: store.color_primary || '#009ea8',
          color_secondary: store.color_secondary || null,
          color_text: store.color_text || '#ffffff',
          color_border: store.color_border || null,
          description: store.description || '',
          website_url: store.website_url || '',
          is_active: true,
        }])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, store: data });
    }

    if (action === 'update') {
      const { id, ...updateData } = store;
      // Re-generate slug if name changed
      if (updateData.name) {
        updateData.slug = updateData.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim();
      }
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('official_stores')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, store: data });
    }

    if (action === 'delete') {
      const { error } = await supabase
        .from('official_stores')
        .delete()
        .eq('id', store.id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle') {
      const { data, error } = await supabase
        .from('official_stores')
        .update({ is_active: !store.is_active, updated_at: new Date().toISOString() })
        .eq('id', store.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, store: data });
    }

    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
  } catch (err: any) {
    console.error('[Stores API] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
