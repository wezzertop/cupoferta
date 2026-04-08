-- ==========================================
-- FASE 10: NOTIFICACIONES Y ALERTAS DE PALABRAS CLAVE
-- ==========================================

-- 1. TABLA: notifications (Notificaciones dentro de la app)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,       -- Quién recibe
    actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,               -- Quién hizo la acción (null si es el sistema)
    type TEXT NOT NULL CHECK (type IN ('reply', 'deal_comment', 'like_deal', 'like_comment', 'keyword_alert')),
    reference_id UUID NOT NULL,                                            -- ID de la oferta o comentario
    content TEXT,                                                          -- Mensaje corto o contexto ("ha comentado en tu oferta...")
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA: keyword_alerts (Alertas de precio / palabras clave)
CREATE TABLE IF NOT EXISTS keyword_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    keyword TEXT NOT NULL,
    max_price NUMERIC, -- Opcional, si es null avisa a cualquier precio
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TRIGGERS PARA NOTIFICACIONES
-- ============================================

-- A. Notificar al dueño de la oferta cuando alguien comenta, O al dueño del comentario cuando le responden
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
    deal_owner UUID;
    parent_comment_owner UUID;
    deal_title TEXT;
BEGIN
    SELECT user_id, title INTO deal_owner, deal_title FROM deals WHERE id = NEW.deal_id;

    -- Si el comentario es una respuesta a otro comentario
    IF NEW.parent_id IS NOT NULL THEN
        SELECT user_id INTO parent_comment_owner FROM comments WHERE id = NEW.parent_id;
        
        -- Evitamos auto-notificarnos
        IF NEW.user_id != parent_comment_owner THEN
            INSERT INTO notifications (user_id, actor_id, type, reference_id, content)
            VALUES (parent_comment_owner, NEW.user_id, 'reply', NEW.deal_id, 'Han respondido a tu comentario en: ' || deal_title);
        END IF;

    -- Si es un comentario directo a la oferta
    ELSE
        IF NEW.user_id != deal_owner THEN
            INSERT INTO notifications (user_id, actor_id, type, reference_id, content)
            VALUES (deal_owner, NEW.user_id, 'deal_comment', NEW.deal_id, 'Nuevo comentario en tu oferta: ' || deal_title);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_comment_notify
AFTER INSERT ON comments
FOR EACH ROW EXECUTE FUNCTION notify_on_comment();


-- B. Notificar al dueño de la oferta cuando le dan +1
CREATE OR REPLACE FUNCTION notify_on_deal_vote()
RETURNS TRIGGER AS $$
DECLARE
    deal_owner UUID;
    deal_title TEXT;
BEGIN
    IF NEW.vote_type = 1 THEN
        SELECT user_id, title INTO deal_owner, deal_title FROM deals WHERE id = NEW.deal_id;
        
        IF NEW.user_id != deal_owner THEN
            INSERT INTO notifications (user_id, actor_id, type, reference_id, content)
            VALUES (deal_owner, NEW.user_id, 'like_deal', NEW.deal_id, 'A alguien le ha gustado (fuego) tu oferta: ' || deal_title);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_deal_vote_notify
AFTER INSERT ON deal_votes
FOR EACH ROW EXECUTE FUNCTION notify_on_deal_vote();


-- C. Notificar a usuarios si una nueva oferta coincide con sus Alertas
CREATE OR REPLACE FUNCTION notify_keyword_match()
RETURNS TRIGGER AS $$
DECLARE
    alert RECORD;
BEGIN
    -- Buscamos alertas activas cuya palabra clave esté en el título o descripción
    FOR alert IN 
        SELECT * FROM keyword_alerts 
        WHERE is_active = TRUE 
        AND user_id != NEW.user_id
        AND (NEW.title ILIKE '%' || keyword || '%' OR NEW.description ILIKE '%' || keyword || '%')
    LOOP
        -- Verificamos regla de precio si existe
        IF alert.max_price IS NULL OR NEW.price <= alert.max_price THEN
            INSERT INTO notifications (user_id, actor_id, type, reference_id, content)
            VALUES (alert.user_id, NULL, 'keyword_alert', NEW.id, '¡Alerta! Nueva oferta coincide con tu aviso "' || alert.keyword || '": ' || NEW.title);
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_deal_insert_alert
AFTER INSERT ON deals
FOR EACH ROW EXECUTE FUNCTION notify_keyword_match();


-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_alerts ENABLE ROW LEVEL SECURITY;

-- Notifications RLS
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- Keyword Alerts RLS
CREATE POLICY "Users manage own alerts" ON keyword_alerts FOR ALL USING (auth.uid() = user_id);
