import { createClient } from './lib/supabase/server';

async function checkConfig() {
  const supabase = createClient();
  const { data, error } = await supabase.from('telegram_config').select('*').limit(1).maybeSingle();
  if (error) {
    console.error('Error fetching config:', error);
  } else {
    console.log('Telegram Config:', JSON.stringify(data, null, 2));
  }
}

checkConfig();
