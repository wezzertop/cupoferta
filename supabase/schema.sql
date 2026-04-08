-- ==========================================
-- FASE 1: ESQUEMA DE BASE DE DATOS SUPABASE
-- ==========================================

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: profiles (extensión de auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA: deals (ofertas)
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL,
    old_price NUMERIC,
    store TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    shipping_type TEXT,
    views_count INTEGER DEFAULT 0,
    temp INTEGER DEFAULT 0, -- Se calcula con trigger
    comments_count INTEGER DEFAULT 0, -- Se calcula con trigger
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA: deal_votes (votos de temperatura)
CREATE TABLE deal_votes (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
    vote_type INTEGER NOT NULL CHECK (vote_type IN (1, -1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, deal_id)
);

-- 4. TABLA: comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA: saved_deals
CREATE TABLE saved_deals (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, deal_id)
);

-- ============================================
-- TRIGGERS Y FUNCIONES
-- ============================================

-- Función para actualizar la temperatura del deal (suma de votos)
CREATE OR REPLACE FUNCTION update_deal_temperature()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE deals SET temp = temp + NEW.vote_type WHERE id = NEW.deal_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE deals SET temp = temp - OLD.vote_type + NEW.vote_type WHERE id = NEW.deal_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE deals SET temp = temp - OLD.vote_type WHERE id = OLD.deal_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_vote_change
AFTER INSERT OR UPDATE OR DELETE ON deal_votes
FOR EACH ROW EXECUTE FUNCTION update_deal_temperature();

-- Función para actualizar el contador de comentarios automáticamente
CREATE OR REPLACE FUNCTION update_deal_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE deals SET comments_count = comments_count + 1 WHERE id = NEW.deal_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE deals SET comments_count = comments_count - 1 WHERE id = OLD.deal_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_comment_change
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_deal_comments_count();

-- Trigger para crear perfil automáticamente al registrarse en auth.users
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_deals ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Deals
CREATE POLICY "Deals are viewable by everyone." ON deals FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create deals." ON deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own deals." ON deals FOR UPDATE USING (auth.uid() = user_id);

-- Deal Votes
CREATE POLICY "Votes are viewable by everyone." ON deal_votes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own votes." ON deal_votes FOR ALL USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "Comments are viewable by everyone." ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments." ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments." ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments." ON comments FOR DELETE USING (auth.uid() = user_id);

-- Saved Deals
CREATE POLICY "Users view own saved deals." ON saved_deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own saved deals." ON saved_deals FOR ALL USING (auth.uid() = user_id);
