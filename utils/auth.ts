// Утилиты для работы с аутентификацией и localStorage

export interface StoredAuthData {
  userId: number;
  username: string;
  fullName: string;
  photoUrl?: string;
  referrerId?: number; // Добавляем referrer_id для уведомлений
  timestamp: number;
}

const AUTH_STORAGE_KEY = 'tontrader_auth';
const AUTH_EXPIRY_DAYS = 30; // Храним данные 30 дней
const CURRENT_USER_ID_KEY = 'tontrader_current_user_id'; // Для быстрого доступа к ID

/**
 * Сохраняет данные аутентификации в localStorage
 */
export const saveAuthData = (userData: {
  user_id: number;
  username?: string;
  full_name: string;
  photo_url?: string;
  referrer_id?: number;
}): void => {
  try {
    const authData: StoredAuthData = {
      userId: userData.user_id,
      username: userData.username || '',
      fullName: userData.full_name,
      photoUrl: userData.photo_url,
      referrerId: userData.referrer_id,
      timestamp: Date.now()
    };
    
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    localStorage.setItem(CURRENT_USER_ID_KEY, userData.user_id.toString());
    console.log('✅ Auth data saved to localStorage');
  } catch (error) {
    console.error('❌ Failed to save auth data:', error);
  }
};

/**
 * Получает сохраненные данные аутентификации из localStorage
 */
export const getStoredAuthData = (): StoredAuthData | null => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    
    const authData: StoredAuthData = JSON.parse(stored);
    
    // Проверяем, не истекли ли данные
    const expiryTime = authData.timestamp + (AUTH_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    if (Date.now() > expiryTime) {
      console.log('🕒 Stored auth data expired, removing...');
      clearAuthData();
      return null;
    }
    
    console.log('✅ Valid auth data found in localStorage');
    return authData;
  } catch (error) {
    console.error('❌ Failed to get stored auth data:', error);
    return null;
  }
};

/**
 * Очищает сохраненные данные аутентификации
 */
export const clearAuthData = (): void => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_ID_KEY);
    console.log('🗑️ Auth data cleared from localStorage');
  } catch (error) {
    console.error('❌ Failed to clear auth data:', error);
  }
};

/**
 * Проверяет, есть ли валидные сохраненные данные аутентификации
 */
export const hasValidStoredAuth = (): boolean => {
  return getStoredAuthData() !== null;
};

/**
 * Получает текущий ID пользователя (быстрый доступ)
 */
export const getCurrentUserId = (): number | null => {
  try {
    const userId = localStorage.getItem(CURRENT_USER_ID_KEY);
    return userId ? parseInt(userId, 10) : null;
  } catch (error) {
    console.error('❌ Failed to get current user ID:', error);
    return null;
  }
};