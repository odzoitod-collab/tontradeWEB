import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { saveAuthData, getStoredAuthData, clearAuthData } from '../utils/auth';
import type { DbUser } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Установка пользователя при авто-привязке через Telegram (с сохранением в localStorage)
  const setAuthenticatedUser = useCallback((userData: DbUser) => {
    setUser(userData);
    saveAuthData(userData);
    setIsLoading(false);
  }, []);

  // Функция для обновления данных пользователя (без повторного сохранения auth)
  const updateUser = useCallback((userData: DbUser | ((prev: DbUser | null) => DbUser | null)) => {
    setUser(userData);
  }, []);

  // Выход из системы (очистка данных; вход только через Telegram)
  const logout = useCallback(() => {
    setUser(null);
    clearAuthData();
  }, []);

  // Проверка аутентификации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      // 1. Проверяем Telegram WebApp данные (приоритет)
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      let tgId = tgUser?.id;
      
      // 2. Fallback: читаем tgid из URL
      if (!tgId) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlTgId = urlParams.get('tgid');
        if (urlTgId && !isNaN(Number(urlTgId))) {
          tgId = Number(urlTgId);
        }
      }

      // 3. Если есть Telegram ID, аутентифицируемся через него (приоритет)
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

      // 4. Если нет Telegram данных, проверяем сохраненные данные (автологин)
      const storedAuth = getStoredAuthData();
      if (storedAuth) {
        console.log("🔄 Attempting auto-login with stored data...");
        
        try {
          const { data: existingUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', storedAuth.userId)
            .single();
          
          if (existingUser && !error) {
            console.log("✅ Auto-login successful - Welcome back!");
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

      // 5. Нет данных Telegram и нет сохранённой сессии — вход только через Telegram
      console.log("❓ No valid authentication — open app via Telegram");
      setIsLoading(false);
    };

    checkAuth();
  }, [setAuthenticatedUser]);

  return {
    user,
    isLoading,
    setAuthenticatedUser,
    updateUser,
    logout
  };
};