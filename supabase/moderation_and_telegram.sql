-- ==========================================
-- MODERACIÓN Y INTEGRACIÓN TELEGRAM
-- ==========================================

-- 1. Agregar estados de moderación y enlace a la tabla deals
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS link TEXT;

-- 2. Crear tabla de configuración para Telegram
CREATE TABLE IF NOT EXISTS public.telegram_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_token TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message_template TEXT DEFAULT '🔥 *{title}*\n\n💰 Precio: *{price}€* (antes {old_price}€)\n\n🏢 Tienda: {store}\n\n🔗 Ver oferta: {link}',
    is_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para telegram_config (Solo admins)
ALTER TABLE public.telegram_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage telegram config" ON public.telegram_config
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- 3. Actualizar políticas de RLS para deals
-- Los usuarios normales solo ven deals aprobados
DROP POLICY IF EXISTS "Deals are viewable by everyone." ON deals;
CREATE POLICY "Public can see approved deals" ON deals 
FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- 4. Marcar todas las ofertas existentes como aprobadas para que no desaparezcan
UPDATE public.deals SET status = 'approved';

-- 5. Asegurarse de que el perfil admin existe (esto es para desarrollo, el usuario debe ajustarlo)
-- UPDATE profiles SET role = 'admin' WHERE username = 'tu_usuario'; 
