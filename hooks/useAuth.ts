import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { saveAuthData, getStoredAuthData, clearAuthData } from '../utils/auth';
import type { DbUser } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTelegramAuth, setShowTelegramAuth] = useState(false);

  // Функция для установки пользователя с сохранением в localStorage
  const setAuthenticatedUser = useCallback((userData: DbUser) => {
    setUser(userData);
    saveAuthData(userData);
    setShowTelegramAuth(false);
    setIsLoading(false);
  }, []);

  // Функция для выхода из системы
  const logout = useCallback(() => {
    setUser(null);
    clearAuthData();
    setShowTelegramAuth(true);
  }, []);

  // Проверка аутентификации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      // 1. Проверяем сохраненные данные
      const storedAuth = getStoredAuthData();
      
      // 2. Проверяем Telegram WebApp данные
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      let tgId = tgUser?.id;
      
      // 3. Fallback: читаем tgid из URL
      if (!tgId) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlTgId = urlParams.get('tgid');
        if (urlTgId && !isNaN(Number(urlTgId))) {
          tgId = Number(urlTgId);
        }
      }

      // 4. Если есть сохраненные данные и нет Telegram данных, пытаемся автологин
      if (storedAuth && !tgId) {
        console.log("🔄 Attempting auto-login with stored data...");
        
        try {
          const { data: existingUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', storedAuth.userId)
            .single();
          
          if (existingUser && !error) {
            console.log("✅ Auto-login successful");
            setUser(existingUser);
            setIsLoading(false);
            return;
          } else {
            console.log("❌ Stored user not found, clearing auth data");
            clearAuthData();
          }
        } catch (error) {
          console.error("❌ Auto-login failed:", error);
          clearAuthData();
        }
      }

      // 5. Если есть Telegram ID, аутентифицируемся через него
      if (tgId) {
        console.log("🔐 Authenticating via Telegram ID:", tgId);
        
        try {
          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', tgId)
            .single();

          if (existingUser && !fetchError) {
            // Обновляем фото если изменилось
            const photoUrl = tgUser?.photo_url;
            if (photoUrl && photoUrl !== existingUser.photo_url) {
              await supabase
                .from('users')
                .update({ photo_url: photoUrl })
                .eq('user_id', tgId);
              const updatedUser = { ...existingUser, photo_url: photoUrl };
              setAuthenticatedUser(updatedUser);
            } else {
              setAuthenticatedUser(existingUser);
            }
            return;
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }

      // 6. Если ничего не сработало, показываем форму аутентификации
      console.log("❓ No valid authentication found, showing auth modal");
      setIsLoading(false);
      setShowTelegramAuth(true);
    };

    checkAuth();
  }, [setAuthenticatedUser]);

  return {
    user,
    isLoading,
    showTelegramAuth,
    setAuthenticatedUser,
    logout,
    setShowTelegramAuth
  };
};