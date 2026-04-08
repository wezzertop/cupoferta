-- Add currency column to deals table
ALTER TABLE deals ADD COLUMN currency TEXT DEFAULT 'MXN';
