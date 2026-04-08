-- ==========================================
-- FASE 8: ACTUALIZACIÓN DE ESQUEMA SUPABASE
-- TABLA DE DEALS (NUEVOS CAMPOS)
-- ==========================================

-- 1. Añadimos el campo opcional expires_at en deals
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE NULL;

-- 2. Aseguramos que tenemos un bucket de Supabase Storage para las imágenes subidas
-- Si vas al Dashboard de Supabase en "Storage", asegúrate de tener
-- un bucket llamado 'deal_images' configurado como PUBLIC.

-- Políticas de Permisos Básicos para el Bucket 'deal_images'
-- (Esto normalmente se hace desde el Dashboard de Supabase, pero aquí están como referencia SQL)
/*
CREATE POLICY "Imagenes publicas" ON storage.objects
FOR SELECT USING (bucket_id = 'deal_images');

CREATE POLICY "Usuarios pueden subir imagenes" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'deal_images' AND auth.role() = 'authenticated');
*/

-- 3. Función y RPC para incrementar las vistas de un deal (Bypass RLS para usuarios anónimos o no dueños)
CREATE OR REPLACE FUNCTION increment_view_count(deal_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE deals SET views_count = views_count + 1 WHERE id = deal_id;
END;
$$;
