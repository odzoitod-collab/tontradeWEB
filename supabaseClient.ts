import { createClient } from '@supabase/supabase-js';

// ==========================================
// ⚙️ КОНФИГУРАЦИЯ (ВСЁ ЗДЕСЬ)
// ==========================================
// 🔐 SUPABASE
const SUPABASE_URL = "https://wzpywfedbowlosmvecos.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cHl3ZmVkYm93bG9zbXZlY29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNTAyMzksImV4cCI6MjA4MTkyNjIzOX0.TmAYsmA8iwSpLPKOHIZM7jf3GLE3oeT7wD-l0ALwBPw";

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