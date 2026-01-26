-- Таблица для хранения кодов верификации
CREATE TABLE IF NOT EXISTS verification_codes (
    id SERIAL PRIMARY KEY,
    telegram_username VARCHAR(255) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    user_id BIGINT, -- Связь с пользователем после успешной верификации
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_verification_codes_username ON verification_codes(telegram_username);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(verification_code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON verification_codes(expires_at);

-- Функция для очистки истекших кодов
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM verification_codes 
    WHERE expires_at < NOW() OR is_used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Функция для генерации кода верификации
CREATE OR REPLACE FUNCTION generate_verification_code(p_telegram_username VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    v_code VARCHAR(6);
BEGIN
    -- Генерируем 6-значный код
    v_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Удаляем старые коды для этого пользователя
    DELETE FROM verification_codes 
    WHERE telegram_username = p_telegram_username;
    
    -- Вставляем новый код
    INSERT INTO verification_codes (telegram_username, verification_code)
    VALUES (p_telegram_username, v_code);
    
    RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Функция для верификации кода
CREATE OR REPLACE FUNCTION verify_code(p_telegram_username VARCHAR, p_code VARCHAR)
RETURNS BIGINT AS $$
DECLARE
    v_user_id BIGINT;
    v_record RECORD;
BEGIN
    -- Ищем активный код
    SELECT * INTO v_record
    FROM verification_codes 
    WHERE telegram_username = p_telegram_username 
      AND verification_code = p_code 
      AND expires_at > NOW() 
      AND is_used = FALSE
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN NULL; -- Код не найден или истек
    END IF;
    
    -- Ищем пользователя по username
    SELECT user_id INTO v_user_id
    FROM users 
    WHERE username = p_telegram_username 
       OR username = '@' || p_telegram_username;
    
    IF v_user_id IS NULL THEN
        RETURN NULL; -- Пользователь не найден
    END IF;
    
    -- Помечаем код как использованный
    UPDATE verification_codes 
    SET is_used = TRUE, user_id = v_user_id
    WHERE id = v_record.id;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;