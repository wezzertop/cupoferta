-- ==========================================
-- MEJORA DE HERRAMIENTAS DE MODERACIÓN (ACTUALIZADO - IDEMPOTENTE)
-- ==========================================

-- 1. Agregar campos a profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS moderation_notes TEXT;

-- 2. Crear tabla de Reportes
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('deal', 'comment', 'user')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para Reportes
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can create reports" ON public.reports;
CREATE POLICY "Anyone authenticated can create reports" ON public.reports
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can view and manage reports" ON public.reports;
CREATE POLICY "Admins can view and manage reports" ON public.reports
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- 3. Crear tabla de Logs de Moderación
CREATE TABLE IF NOT EXISTS public.moderation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'approve_deal', 'reject_deal', 'ban_user', 'delete_comment', etc.
    target_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view logs" ON public.moderation_logs;
CREATE POLICY "Admins can view logs" ON public.moderation_logs
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- 4. Actualizar políticas de RLS para prevenir acciones de usuarios baneados
DO $$ 
BEGIN
    ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.deal_votes ENABLE ROW LEVEL SECURITY;
END $$;

-- Política restrictiva para insert en Deals
DROP POLICY IF EXISTS "Authenticated users can create deals." ON deals;
DROP POLICY IF EXISTS "Unbanned users can create deals" ON deals;
CREATE POLICY "Unbanned users can create deals" ON deals 
FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_banned = true
    )
);

-- Política restrictiva para insert en Comentarios
DROP POLICY IF EXISTS "Users can insert comments." ON comments;
DROP POLICY IF EXISTS "Unbanned users can insert comments" ON comments;
CREATE POLICY "Unbanned users can insert comments" ON comments 
FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_banned = true
    )
);

-- Política restrictiva para Votos
DROP POLICY IF EXISTS "Users can manage their own votes." ON deal_votes;
DROP POLICY IF EXISTS "Unbanned users can manage votes" ON deal_votes;
CREATE POLICY "Unbanned users can manage votes" ON deal_votes 
FOR ALL USING (
    auth.uid() = user_id AND 
    NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_banned = true
    )
);

-- 5. Función para banear/unbanear de forma segura
CREATE OR REPLACE FUNCTION toggle_user_ban(target_user_id UUID, ban_status BOOLEAN)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles SET is_banned = ban_status WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Expandir tipos de notificaciones para soporte de moderación
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('reply', 'deal_comment', 'like_deal', 'like_comment', 'keyword_alert', 'moderation_warning', 'deal_approved', 'deal_rejected'));

-- 7. Función para enviar notificaciones de sistema
CREATE OR REPLACE FUNCTION send_system_notification(
    target_user_id UUID, 
    notif_type TEXT, 
    ref_id UUID, 
    notif_content TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.notifications (user_id, actor_id, type, reference_id, content)
    VALUES (target_user_id, NULL, notif_type, ref_id, notif_content);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
