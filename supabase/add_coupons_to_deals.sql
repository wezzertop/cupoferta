-- Migration to add coupon support to deals
ALTER TABLE deals ADD COLUMN IF NOT EXISTS deal_type TEXT DEFAULT 'offer' CHECK (deal_type IN ('offer', 'coupon'));
ALTER TABLE deals ADD COLUMN IF NOT EXISTS coupon_code TEXT;
