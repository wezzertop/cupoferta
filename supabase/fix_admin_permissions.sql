-- SCRIPT DE PERMISOS: Ejecutar en Supabase SQL Editor
-- Este script otorga a los Administradores permisos totales sobre las ofertas.

-- 1. Permitir a admins ver todas las ofertas (si no pueden ya)
DROP POLICY IF EXISTS "Admins can view all deals" ON deals;
CREATE POLICY "Admins can view all deals" ON deals
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 2. Permitir a admins borrar cualquier oferta
DROP POLICY IF EXISTS "Admins can delete any deal" ON deals;
CREATE POLICY "Admins can delete any deal" ON deals
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 3. Permitir a admins actualizar cualquier oferta (pausar/editar)
DROP POLICY IF EXISTS "Admins can update any deal" ON deals;
CREATE POLICY "Admins can update any deal" ON deals
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
