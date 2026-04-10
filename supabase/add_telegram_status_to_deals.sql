-- Add telegram_posted column to deals table
ALTER TABLE deals ADD COLUMN IF NOT EXISTS telegram_posted BOOLEAN DEFAULT FALSE;

-- Optional: Add index for performance in moderation panel
CREATE INDEX IF NOT EXISTS idx_deals_telegram_posted ON deals(telegram_posted) WHERE status = 'approved';
