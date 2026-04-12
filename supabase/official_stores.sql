-- ============================================================
-- Official Stores System
-- ============================================================

-- Tabla principal de tiendas oficiales
CREATE TABLE IF NOT EXISTS official_stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,                      -- URL del logo (imagen circular)
  color_primary TEXT NOT NULL DEFAULT '#009ea8',    -- Color principal (hex)
  color_secondary TEXT DEFAULT NULL,               -- Color secundario (hex, opcional)
  color_text TEXT NOT NULL DEFAULT '#ffffff',       -- Color del texto sobre el fondo
  color_border TEXT DEFAULT NULL,                   -- Color del borde (hex)
  description TEXT DEFAULT '',
  website_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  deal_count INTEGER DEFAULT 0,       -- Cache de cantidad de deals
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_official_stores_slug ON official_stores(slug);
CREATE INDEX IF NOT EXISTS idx_official_stores_active ON official_stores(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_official_stores_name ON official_stores(name);

-- RLS: Lectura pública, escritura solo admins
ALTER TABLE official_stores ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública
CREATE POLICY "official_stores_read_all" ON official_stores
  FOR SELECT USING (true);

-- Política de escritura para admins
CREATE POLICY "official_stores_admin_write" ON official_stores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insertar tiendas oficiales por defecto
INSERT INTO official_stores (name, slug, color_primary, color_secondary, color_text, color_border, description) VALUES
  ('Amazon', 'amazon', '#FF9900', '#FF6600', '#000000', '#e68a00', 'La tienda de todo'),
  ('Mercado Libre', 'mercado-libre', '#FFE600', '#FFD700', '#000000', '#d4bf00', 'Mercado Libre Latinoamérica'),
  ('TikTok Shop', 'tiktok', '#000000', '#FFFFFF', '#FFFFFF', '#000000', 'Tienda oficial de TikTok'),
  ('AliExpress', 'aliexpress', '#E62E04', '#FF4D2A', '#FFFFFF', '#b52403', 'Ofertas directas de China'),
  ('Miravia', 'miravia', '#FF004C', '#FF66A3', '#FFFFFF', '#cc003d', 'Moda y lifestyle'),
  ('Walmart', 'walmart', '#0071CE', '#004C91', '#FFFFFF', '#005ba6', 'Precios bajos siempre'),
  ('Samsung', 'samsung', '#1428A0', '#0B1E6E', '#FFFFFF', '#102080', 'Tecnología Samsung'),
  ('Temu', 'temu', '#FF6000', '#FF8533', '#FFFFFF', '#cc4d00', 'Compra como millonario'),
  ('Nike', 'nike', '#111111', '#FFFFFF', '#FFFFFF', '#111111', 'Just Do It'),
  ('Adidas', 'adidas', '#111111', '#FFFFFF', '#FFFFFF', '#111111', 'Impossible is Nothing'),
  ('Shein', 'shein', '#000000', '#333333', '#FFFFFF', '#000000', 'Moda accesible'),
  ('Apple', 'apple', '#A2AAAD', '#555555', '#000000', '#999999', 'Think Different'),
  ('PCComponentes', 'pccomponentes', '#FF6000', '#FF8533', '#FFFFFF', '#cc4d00', 'Tecnología y más')
ON CONFLICT (slug) DO NOTHING;

-- Función para actualizar el conteo de deals por tienda
CREATE OR REPLACE FUNCTION update_store_deal_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar conteo para la tienda afectada
  UPDATE official_stores 
  SET deal_count = (
    SELECT COUNT(*) FROM deals 
    WHERE LOWER(deals.store) LIKE '%' || LOWER(official_stores.slug) || '%'
    AND deals.status = 'approved'
  ),
  updated_at = now();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para mantener actualizado el conteo
DROP TRIGGER IF EXISTS trg_update_store_count ON deals;
CREATE TRIGGER trg_update_store_count
  AFTER INSERT OR UPDATE OR DELETE ON deals
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_store_deal_count();
