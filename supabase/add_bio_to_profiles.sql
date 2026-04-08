-- Añadir columna bio a profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
