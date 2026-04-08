-- ===============================================
-- DATOS DEMO PARA PRUEBAS UI DE CUPOFERTA
-- Ejecutar después de haber creado el schema.sql
-- ===============================================

DO $$ 
DECLARE
  demo_user_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN

  -- 1. Insertamos un Usuario Directo en Auth.Users 
  -- (Esto disparará automáticamente tu trigger y creará el perfil)
  INSERT INTO auth.users (
    id, 
    instance_id, 
    aud, 
    role, 
    email, 
    encrypted_password,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at, 
    updated_at
  ) VALUES (
    demo_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin_hero@cupoferta.com',
    'mock_password',
    '{"provider":"email","providers":["email"]}',
    '{"username":"CazadorExperto_99", "avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=HeroMode"}',
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO NOTHING;

  -- 2. Insertamos algunas Ofertas Premium (Deals) utilizando el ID del usuario anterior
  INSERT INTO public.deals (user_id, title, description, price, old_price, store, category, image_url, shipping_type, views_count, temp, comments_count)
  VALUES
  (
    demo_user_id, 
    'Sony PlayStation 5 Slim 1TB + Juego Exclusivo de Regalo', 
    'Excelente oportunidad para adquirir lo último en tecnología a un precio imbatible. Existencias limitadas, aprovecha antes de que se agote. Este producto incluye garantía completa por 12 meses directamente con el fabricante.', 
    8499, 11999, 'Amazon', 'Gaming', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=600&fit=crop&q=80', 'Envío gratis', 
    4320, 0, 0
  ),
  (
    demo_user_id, 
    'Apple MacBook Air M2 13" 256GB - Oferta Prime Limitada', 
    'La computadora más delgada y ligera vuelve a estar a un precio histórico. Ideal para estudiantes y profesionales en movimiento continuo. Compra ahora y asegúrate de llevarte el mejor precio histórico comprobado en CamelCamel.', 
    17500, 21999, 'Mercado Libre', 'Laptops', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop&q=80', 'Express 24h', 
    8900, 0, 0
  ),
  (
    demo_user_id, 
    'Lentes de Sol Ray-Ban Aviator Classic Polarizados', 
    'Lentes originales importados 100% polarizados. Un clásico inquebrantable a menos de la mitad de su precio oficial de tienda física. Solo válido durante las siguientes 48 horas de "Venta Nocturna".', 
    1450, 2900, 'Liverpool', 'Moda', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop&q=80', 'Recoger en tienda', 
    1250, 0, 0
  ),
  (
    demo_user_id, 
    'Samsung Galaxy S24 Ultra 512GB (Desbloqueado)', 
    'Aprovecha tremenda bestia de teléfono con doble descuento de Samsung Members. Código apilable ingresando GALAXY50 al realizar tu pago final. Se va a agotar muy temprano.', 
    18999, 26999, 'Samsung Store', 'Smartphones', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=600&fit=crop&q=80', 'Envío Internacional', 
    14500, 0, 0
  );

END $$;
