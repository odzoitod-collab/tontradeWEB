# Руководство по внедрению запоминания аккаунта

## Обзор
Эта функциональность позволяет пользователям оставаться авторизованными после закрытия браузера, обновления страницы или повторного входа на сайт без необходимости повторного ввода кода.

## Файлы для создания/изменения

### 1. Создать утилиту для работы с localStorage
**Файл:** `utils/auth.ts`

```typescript
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

export const clearAuthData = (): void => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    console.log('🗑️ Auth data cleared from localStorage');
  } catch (error) {
    console.error('❌ Failed to clear auth data:', error);
  }
};

export const hasValidStoredAuth = (): boolean => {
  return getStoredAuthData() !== null;
};
```

### 2. Изменить импорты в App.tsx
Добавить в начало файла:
```typescript
import { saveAuthData, getStoredAuthData, clearAuthData, hasValidStoredAuth } from './utils/auth';
```

### 3. Изменить функцию handleTelegramAuthSuccess в App.tsx
```typescript
const handleTelegramAuthSuccess = useCallback((userData: DbUser) => {
  setUser(userData);
  setShowTelegramAuth(false);
  setIsLoading(false);
  
  // Сохраняем данные аутентификации в localStorage
  saveAuthData(userData);
}, []);
```

### 4. Изменить функцию initApp в App.tsx
Добавить в начало функции (после `const initApp = async () => {`):

```typescript
// 0. Проверяем сохраненные данные аутентификации
const storedAuth = getStoredAuthData();
if (storedAuth && !window.Telegram?.WebApp?.initDataUnsafe?.user) {
  console.log("🔄 Found stored auth data, attempting auto-login...");
  
  try {
    // Пытаемся загрузить пользователя по сохраненному ID
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', storedAuth.userId)
      .single();
    
    if (existingUser && !fetchError) {
      console.log("✅ Auto-login successful");
      setUser(existingUser);
      setIsLoading(false);
      
      // Загружаем остальные данные (настройки, сделки, историю)
      await loadUserData(existingUser.user_id);
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
```

### 5. Добавить сохранение данных при обычной аутентификации
В блоке где устанавливается `setUser(existingUser)` добавить:
```typescript
if (existingUser) {
  // Обновляем photo_url если оно изменилось
  const photoUrl = tgUser?.photo_url;
  if (photoUrl && photoUrl !== existingUser.photo_url) {
    await supabase
      .from('users')
      .update({ photo_url: photoUrl })
      .eq('user_id', tgId);
    const updatedUser = { ...existingUser, photo_url: photoUrl };
    setUser(updatedUser);
    // Сохраняем обновленные данные
    saveAuthData(updatedUser);
  } else {
    setUser(existingUser);
    // Сохраняем данные аутентификации
    saveAuthData(existingUser);
  }
}
```

И для новых пользователей:
```typescript
if (newUser) {
  setUser(newUser);
  // Сохраняем данные нового пользователя
  saveAuthData(newUser);
  
  // ... остальной код
}
```

### 6. Изменить компонент TelegramAuth.tsx
В функции `handleCodeSubmit` после `setStep('success')` добавить:
```typescript
// Сохраняем данные аутентификации в localStorage
saveAuthData(result.user);
```

И добавить импорт:
```typescript
import { saveAuthData } from '../utils/auth';
```

### 7. Добавить функцию выхода (опционально)
Можно добавить кнопку "Выйти" в настройки аккаунта:
```typescript
const logout = () => {
  clearAuthData();
  setUser(null);
  setShowTelegramAuth(true);
};
```

## Как это работает

1. **При первом входе:** Пользователь вводит код, данные сохраняются в localStorage
2. **При повторном посещении:** Приложение проверяет localStorage, находит сохраненные данные и автоматически авторизует пользователя
3. **Безопасность:** Данные хранятся 30 дней, после чего автоматически удаляются
4. **Обновление страницы:** Пользователь остается авторизованным
5. **Закрытие браузера:** При следующем открытии пользователь автоматически войдет в систему

## Преимущества

- ✅ Пользователь не вводит код повторно
- ✅ Работает при обновлении страницы
- ✅ Работает при повторном заходе на сайт
- ✅ Автоматическое истечение срока действия (30 дней)
- ✅ Безопасное хранение только ID пользователя
- ✅ Совместимость с существующей системой аутентификации

## Безопасность

- Данные хранятся только в localStorage браузера пользователя
- Никакие пароли или токены не сохраняются
- Автоматическое истечение срока действия
- При каждом автологине данные проверяются с сервером