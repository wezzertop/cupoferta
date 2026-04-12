-- SCRIPT REVISADO: Ejecutar en Supabase SQL Editor
-- Este script activa el "Borrado en Cascada" para que al borrar una oferta
-- se borren automáticamente sus votos y comentarios sin dar error.

-- 1. Reparar Votos (deal_votes)
ALTER TABLE deal_votes 
DROP CONSTRAINT IF EXISTS deal_votes_deal_id_fkey,
ADD CONSTRAINT deal_votes_deal_id_fkey 
FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE;

-- 2. Reparar Comentarios (comments)
ALTER TABLE comments 
DROP CONSTRAINT IF EXISTS comments_deal_id_fkey,
ADD CONSTRAINT comments_deal_id_fkey 
FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE;

-- 3. Otras tablas (Si las tienes configuradas)
-- La tabla 'reports' ha sido omitida porque usa una estructura diferente (target_id)
-- que gestionaremos directamente desde el código de la aplicación.
