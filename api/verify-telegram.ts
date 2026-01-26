import { supabase } from '../supabaseClient';

export interface VerifyTelegramRequest {
  username: string;
  code: string;
}

export interface VerifyTelegramResponse {
  success: boolean;
  user?: any;
  error?: string;
}

export async function verifyTelegramCode(username: string, code: string): Promise<VerifyTelegramResponse> {
  try {
    // Очищаем username
    const cleanUsername = username.startsWith('@') ? username : `@${username}`;
    
    // Вызываем функцию верификации кода
    const { data: userId, error: verifyError } = await supabase
      .rpc('verify_code', {
        p_telegram_username: cleanUsername,
        p_code: code.trim()
      });

    if (verifyError) {
      console.error('Verification error:', verifyError);
      return {
        success: false,
        error: 'Ошибка верификации кода'
      };
    }

    if (!userId) {
      return {
        success: false,
        error: 'Неверный код или код истек'
      };
    }

    // Получаем данные пользователя
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: 'Ошибка получения данных пользователя'
      };
    }

    return {
      success: true,
      user: userData
    };

  } catch (error) {
    console.error('Verify telegram code error:', error);
    return {
      success: false,
      error: 'Внутренняя ошибка сервера'
    };
  }
}

export async function checkUserExists(username: string): Promise<boolean> {
  try {
    const cleanUsername = username.startsWith('@') ? username : `@${username}`;
    
    const { data, error } = await supabase
      .from('users')
      .select('user_id')
      .or(`username.eq.${cleanUsername},username.eq.${username}`)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Check user exists error:', error);
    return false;
  }
}