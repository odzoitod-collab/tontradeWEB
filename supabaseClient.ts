import { createClient } from '@supabase/supabase-js';

// ==========================================
// ⚙️ КОНФИГУРАЦИЯ (ВСЁ ЗДЕСЬ)
// ==========================================
// 🔐 SUPABASE
const SUPABASE_URL = "https://ghreaehxygwuemvssear.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdocmVhZWh4eWd3dWVtdnNzZWFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4OTM4ODQsImV4cCI6MjA4NzQ2OTg4NH0.cpXVxAmSGJ_VRFJO4QJkpuYo_s_F0DdcPRCl7V3NtVc";

// 🤖 BOT WEBHOOK
const BOT_WEBHOOK_URL = "8080";

// 🔑 OTHER KEYS
const GEMINI_API_KEY = "PLACEHOLDER_API_KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});