-- Fase 12: Auditoría de Arquitectura y Optimizaciones de Escalabilidad

-- 1. Migrar la columna de imágenes de texto CSV a un Array de Textos Nativo (text[])
ALTER TABLE deals ALTER COLUMN image_url TYPE TEXT[] USING string_to_array(image_url, ',');

-- 2. Migrar el "Hot Score Algorithm" a Cron Jobs (Base de Datos)
-- Primero creamos una nueva columna para guardar el hot_score computado en la base de datos
-- para evitar procesarlo en memoria desde Next.js
ALTER TABLE deals ADD COLUMN IF NOT EXISTS hot_score NUMERIC DEFAULT 0;

-- Habilitar extensión pg_cron (dependiendo del entorno de Supabase, podría requerir configuración en el Dashboard)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Creamos la función que actualizará de forma periódica el hot_score de las ofertas activas
CREATE OR REPLACE FUNCTION update_deals_hot_score()
RETURNS void AS $$
DECLARE
  deal_record record;
  discount numeric;
  typeScore numeric;
  viewsScore numeric;
  votesScore numeric;
  commentsScore numeric;
  hoursSince numeric;
  finalScore numeric;
  nowMs numeric;
  createdMs numeric;
BEGIN
  nowMs := extract(epoch from now());
  
  FOR deal_record IN SELECT id, price, old_price, title, description, views_count, comments_count, temp, created_at FROM deals WHERE status = 'approved' LOOP
    -- Calcular descuento matemático
    IF deal_record.old_price IS NOT NULL AND deal_record.old_price > deal_record.price THEN
      discount := ((deal_record.old_price - deal_record.price) / deal_record.old_price) * 100;
    ELSE
      discount := 0;
    END IF;

    -- Bonificación por ser cupón
    IF deal_record.title ILIKE '%cupon%' OR deal_record.title ILIKE '%cupón%' OR deal_record.description ILIKE '%código%' THEN
      typeScore := 10;
    ELSE
      typeScore := 0;
    END IF;

    -- Otros puntajes
    viewsScore := COALESCE(deal_record.views_count, 0) * 0.5;
    votesScore := COALESCE(deal_record.temp, 0) * 5;
    commentsScore := COALESCE(deal_record.comments_count, 0) * 2;
    
    -- Tiempo transcurrido (Degradación Newtoniana)
    createdMs := extract(epoch from deal_record.created_at);
    hoursSince := GREATEST(1, (nowMs - createdMs) / 3600.0);

    -- Fórmula final
    finalScore := (discount + typeScore + viewsScore + votesScore + commentsScore) / power(hoursSince + 2, 1.5);

    UPDATE deals SET hot_score = finalScore WHERE id = deal_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Programamos la tarea para que se ejecute cada 5 minutos
SELECT cron.schedule('update-deals-hot-score', '*/5 * * * *', $$SELECT update_deals_hot_score()$$);
