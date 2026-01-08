-- ==========================================
-- ⚡️ 7. REALTIME (ВКЛЮЧЕНИЕ)
-- ==========================================

-- Сбрасываем (если была старая публикация)
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Создаем новую для ВСЕХ нужных таблиц сразу
CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.users, 
    public.trades, 
    public.settings, 
    public.deposit_requests,
    public.country_bank_details;

SELECT 'Все таблицы созданы, Realtime включен! 🚀' as status;