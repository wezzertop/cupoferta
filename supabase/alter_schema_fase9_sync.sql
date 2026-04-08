-- ==========================================
-- FASE 9: SINCRONIZACIÓN DE MÉTRICAS (FIX)
-- ==========================================
-- Este script corrige las tarjetas para que los contadores (temp y comentarios)
-- reflejen exactamente la cantidad REAL de votos y comentarios en la base de datos,
-- eliminando las inconsistencias dejadas por los datos de prueba (seed).

UPDATE deals 
SET comments_count = (
    SELECT COUNT(*) 
    FROM comments 
    WHERE comments.deal_id = deals.id
);

UPDATE deals 
SET temp = COALESCE((
    SELECT SUM(vote_type) 
    FROM deal_votes 
    WHERE deal_votes.deal_id = deals.id
), 0);

UPDATE deals
SET views_count = 0;
