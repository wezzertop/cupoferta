-- ===============================================
-- FASE 7: SISTEMA DE LIKES PARA COMENTARIOS
-- Copia y pégalo en el SQL Editor y dale a RUN
-- ===============================================

-- 1. Agregar la columna "likes" a la tabla comments
ALTER TABLE public.comments ADD COLUMN likes INTEGER DEFAULT 0;

-- 2. Crear tabla comment_votes para mantener la cuenta individual y seguridad
CREATE TABLE public.comment_votes (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
    vote_type INTEGER NOT NULL CHECK (vote_type IN (1, -1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, comment_id)
);

-- 3. Habilitar y Configurar Row Level Security (Políticas RLS) para comment_votes
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los votos a comentarios son públicos" 
ON public.comment_votes FOR SELECT USING (true);

CREATE POLICY "Usuarios pueden administrar sus propios votos" 
ON public.comment_votes FOR ALL USING (auth.uid() = user_id);

-- 4. Crear un Trigger para recalcular los likes de los comentarios automáticamente!
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.comments SET likes = likes + NEW.vote_type WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.comments SET likes = likes - OLD.vote_type + NEW.vote_type WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.comments SET likes = likes - OLD.vote_type WHERE id = OLD.comment_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_vote_change
AFTER INSERT OR UPDATE OR DELETE ON public.comment_votes
FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();
