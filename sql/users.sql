-- ==========================================
-- 👤 1. USERS (ПОЛЬЗОВАТЕЛЕЙ)
-- ==========================================

-- Очистка (если нужно пересоздать)
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE public.users (
    user_id BIGINT PRIMARY KEY,                    -- Telegram ID
    username TEXT,                                 -- @username
    full_name TEXT,                                -- Имя
    photo_url TEXT,                                -- Аватарка
    referrer_id BIGINT,                            -- ID воркера (кто привел)
    
    -- 💰 Финансы
    balance FLOAT DEFAULT 0,                       -- Баланс
    
    -- 🎲 Подкрутка (Win/Lose)
    luck TEXT DEFAULT 'default' CHECK (luck IN ('win', 'lose', 'default')),
    
    -- 📝 Статусы
    is_kyc BOOLEAN DEFAULT FALSE,                  -- Верификация
    web_registered BOOLEAN DEFAULT FALSE,          -- Заход через WebApp
    email TEXT DEFAULT '-',                        
    country_code TEXT DEFAULT 'RU',                
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Индекс для воркеров
CREATE INDEX idx_users_referrer ON public.users(referrer_id);

-- RLS (Безопасность)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for users" ON public.users FOR ALL USING (true) WITH CHECK (true);