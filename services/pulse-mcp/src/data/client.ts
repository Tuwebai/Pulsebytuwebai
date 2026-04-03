import { createClient } from '@supabase/supabase-js';

import { pulseMcpConfig } from '../env.js';

export const supabase = createClient(pulseMcpConfig.supabaseUrl, pulseMcpConfig.supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
