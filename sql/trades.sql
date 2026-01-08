-- ==========================================
-- 📈 4. TRADES (СДЕЛКИ)
-- ==========================================

DROP TABLE IF EXISTS public.trades CASCADE;

CREATE TABLE public.trades (
    id TEXT PRIMARY KEY,                      -- UUID
    user_id BIGINT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    pair TEXT NOT NULL,                       -- BTC/USDT
    symbol TEXT NOT NULL,                     -- BTC
    type TEXT NOT NULL CHECK (type IN ('Long', 'Short')),
    
    amount FLOAT NOT NULL,                    -- Ставка
    leverage INT DEFAULT 1,                   -- Плечо
    
    entry_price FLOAT NOT NULL,               -- Вход
    final_price FLOAT,                        -- Выход
    
    start_time BIGINT NOT NULL,               -- Start TS
    duration_seconds INT NOT NULL,            -- Секунды
    
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    
    final_pnl FLOAT,                          -- Профит
    is_winning BOOLEAN,                       -- Win/Lose
    forced_result TEXT CHECK (forced_result IN ('win', 'lose')), -- Подкрутка конкретной сделки
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_trades_user_active ON public.trades(user_id, status);

-- RLS
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for trades" ON public.trades FOR ALL USING (true) WITH CHECK (true);