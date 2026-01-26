# 📱 Telegram Mini App - Fullscreen режим

## Что было добавлено

### 1. Автоматическое разворачивание на весь экран
- ✅ `tg.expand()` - разворачивает приложение
- ✅ `tg.requestFullscreen()` - включает fullscreen (Telegram 7.0+)
- ✅ Автоматическое восстановление при сворачивании

### 2. Отключение жестов Telegram
- ✅ `tg.disableVerticalSwipes()` - отключает свайпы вниз (закрытие)
- ✅ `tg.enableClosingConfirmation()` - подтверждение при закрытии

### 3. Настройка цветов
- ✅ Черный цвет заголовка
- ✅ Черный цвет фона
- ✅ Черный цвет нижней панели

### 4. Адаптивная высота
- ✅ Использование `var(--tg-viewport-height)`
- ✅ Поддержка динамической высоты viewport
- ✅ Автоматическая подстройка при изменении

## Как это работает

### 1. Инициализация в index.html (немедленно)
```javascript
// Выполняется сразу после загрузки Telegram SDK
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.expand();
  tg.requestFullscreen?.();
  tg.disableVerticalSwipes?.();
  tg.ready();
}
```

### 2. Инициализация в index.tsx (при загрузке React)
```typescript
import { initTelegramFullscreen } from './utils/telegram';
initTelegramFullscreen();
```

### 3. Поддержка в App.tsx (при рендере)
```typescript
if (isTelegramWebApp()) {
  expandTelegramApp();
  requestTelegramFullscreen();
}
```

## Утилиты (utils/telegram.ts)

### Проверка режима
```typescript
import { isTelegramWebApp } from './utils/telegram';

if (isTelegramWebApp()) {
  console.log('Running in Telegram');
}
```

### Управление fullscreen
```typescript
import { 
  expandTelegramApp,
  requestTelegramFullscreen,
  exitTelegramFullscreen,
  isTelegramFullscreen
} from './utils/telegram';

// Развернуть на весь экран
expandTelegramApp();

// Включить fullscreen
requestTelegramFullscreen();

// Выйти из fullscreen
exitTelegramFullscreen();

// Проверить статус
if (isTelegramFullscreen()) {
  console.log('In fullscreen mode');
}
```

### Управление жестами
```typescript
import { 
  disableTelegramVerticalSwipes,
  enableTelegramClosingConfirmation
} from './utils/telegram';

// Отключить свайпы вниз
disableTelegramVerticalSwipes();

// Включить подтверждение закрытия
enableTelegramClosingConfirmation();
```

### Управление цветами
```typescript
import { 
  setTelegramHeaderColor,
  setTelegramBackgroundColor,
  setTelegramBottomBarColor
} from './utils/telegram';

setTelegramHeaderColor('#000000');
setTelegramBackgroundColor('#000000');
setTelegramBottomBarColor('#000000');
```

### Получение информации
```typescript
import { 
  getTelegramVersion,
  getTelegramPlatform,
  getTelegramViewportHeight,
  getTelegramInfo
} from './utils/telegram';

console.log('Version:', getTelegramVersion());
console.log('Platform:', getTelegramPlatform());
console.log('Height:', getTelegramViewportHeight());

const info = getTelegramInfo();
console.log('Full info:', info);
```

### Подписка на события
```typescript
import { 
  onTelegramViewportChanged,
  offTelegramViewportChanged
} from './utils/telegram';

const handleViewportChange = () => {
  console.log('Viewport changed!');
};

// Подписаться
onTelegramViewportChanged(handleViewportChange);

// Отписаться
offTelegramViewportChanged(handleViewportChange);
```

## CSS адаптация

### Использование Telegram viewport
```css
/* Для Telegram WebApp - используем var(--tg-viewport-height) */
@supports (height: var(--tg-viewport-height)) {
  html, body {
    height: var(--tg-viewport-height, 100vh);
  }
}
```

### Safe area для Telegram
```css
.safe-area-top {
  padding-top: env(safe-area-inset-top, 0px);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

## Версии Telegram

### Telegram 6.0+
- ✅ `expand()` - разворачивание
- ✅ `disableVerticalSwipes()` - отключение свайпов
- ✅ `setHeaderColor()` - цвет заголовка
- ✅ `setBackgroundColor()` - цвет фона

### Telegram 7.0+
- ✅ `requestFullscreen()` - fullscreen режим
- ✅ `exitFullscreen()` - выход из fullscreen
- ✅ `isFullscreen` - проверка статуса
- ✅ `setBottomBarColor()` - цвет нижней панели

### Проверка версии
```typescript
import { getTelegramVersion } from './utils/telegram';

const version = getTelegramVersion();
const majorVersion = parseInt(version.split('.')[0]);

if (majorVersion >= 7) {
  console.log('Fullscreen supported');
}
```

## Тестирование

### 1. Открыть в Telegram
```
1. Создайте бота через @BotFather
2. Добавьте Web App URL
3. Откройте бота
4. Нажмите на кнопку Web App
```

### 2. Проверить fullscreen
```
1. Приложение должно открыться на весь экран
2. Адресная строка должна быть скрыта
3. Нижняя панель Telegram должна быть скрыта
4. Контент должен занимать весь экран
```

### 3. Проверить жесты
```
1. Свайп вниз НЕ должен закрывать приложение
2. Кнопка "Назад" должна показывать подтверждение
3. Viewport должен автоматически подстраиваться
```

### 4. Проверить логи
```
Откройте DevTools в Telegram Desktop:
1. Telegram Desktop → Settings → Advanced → Enable Debug Mode
2. Ctrl+Shift+I (Windows) или Cmd+Option+I (Mac)
3. Проверьте логи в консоли
```

## Отладка

### Логи в консоли
```
📱 Telegram WebApp pre-initialized
📱 Version: 7.0
📱 Platform: ios
📱 Expanded: true
📱 Fullscreen: true
📱 Viewport Height: 844
📱 Stable Height: 844
```

### Проблемы и решения

**Проблема: Приложение не разворачивается**
```typescript
// Решение: Вызовите expand() несколько раз
expandTelegramApp();
setTimeout(() => expandTelegramApp(), 100);
setTimeout(() => expandTelegramApp(), 500);
```

**Проблема: Fullscreen не работает**
```typescript
// Решение: Проверьте версию Telegram
const version = getTelegramVersion();
if (parseInt(version.split('.')[0]) < 7) {
  console.log('Fullscreen requires Telegram 7.0+');
}
```

**Проблема: Свайпы все еще работают**
```typescript
// Решение: Вызовите disableVerticalSwipes() после ready()
const tg = getTelegramWebApp();
tg.ready();
setTimeout(() => {
  disableTelegramVerticalSwipes();
}, 100);
```

**Проблема: Viewport неправильный**
```css
/* Решение: Используйте CSS переменную Telegram */
@supports (height: var(--tg-viewport-height)) {
  #root {
    height: var(--tg-viewport-height, 100vh);
  }
}
```

## Настройка бота

### 1. Создайте бота
```
1. Откройте @BotFather
2. /newbot
3. Введите название
4. Введите username
```

### 2. Добавьте Web App
```
1. /mybots
2. Выберите вашего бота
3. Bot Settings → Menu Button
4. Configure Menu Button
5. Введите URL вашего сайта
```

### 3. Настройте кнопку
```
1. /setmenubutton
2. Выберите бота
3. Введите текст кнопки (например: "Open App")
4. Введите URL
```

## Дополнительные возможности

### Главная кнопка (Main Button)
```typescript
const tg = getTelegramWebApp();

// Показать кнопку
tg.MainButton.text = 'Продолжить';
tg.MainButton.show();

// Обработчик клика
tg.MainButton.onClick(() => {
  console.log('Main button clicked');
});

// Скрыть кнопку
tg.MainButton.hide();
```

### Закрытие приложения
```typescript
import { closeTelegramApp } from './utils/telegram';

// Закрыть приложение
closeTelegramApp();
```

### Получение данных пользователя
```typescript
const tg = getTelegramWebApp();
const user = tg.initDataUnsafe.user;

console.log('User ID:', user?.id);
console.log('Username:', user?.username);
console.log('First Name:', user?.first_name);
```

## Полезные ссылки

- [Telegram WebApp API](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [BotFather](https://t.me/BotFather)

---

**Статус:** ✅ Fullscreen режим работает  
**Дата:** 26 января 2026  
**Версия:** 1.0.0

**Теперь ваш сайт открывается в Telegram на весь экран!** 📱
