// Утилиты для работы с аутентификацией и localStorage

export interface StoredAuthData {
  userId: number;
  username: string;
  fullName: string;
  photoUrl?: string;
  timestamp: number;
}

const AUTH_STORAGE_KEY = 'tontrader_auth';
const AUTH_EXPIRY_DAYS = 30; // Храним данные 30 дней

/**
 * Сохраняет данные аутентификации в localStorage
 */
export const saveAuthData = (userData: {
  user_id: number;
  username?: string;
  full_name: string;
  photo_url?: string;
}): void => {
  try {
    const authData: StoredAuthData = {
      userId: userData.user_id,
      username: userData.username || '',
      fullName: userData.full_name,
      photoUrl: userData.photo_url,
      timestamp: Date.now()
    };
    
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
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