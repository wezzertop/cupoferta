-- Update telegram_config with new settings for gradual, silent publishing
ALTER TABLE public.telegram_config ADD COLUMN IF NOT EXISTS silent_notifications BOOLEAN DEFAULT true;
ALTER TABLE public.telegram_config ADD COLUMN IF NOT EXISTS post_interval INTEGER DEFAULT 3000; -- ms between posts

COMMENT ON COLUMN public.telegram_config.silent_notifications IS 'Sends Telegram messages without sound';
COMMENT ON COLUMN public.telegram_config.post_interval IS 'Delay in milliseconds between individual deal posts in a batch';
