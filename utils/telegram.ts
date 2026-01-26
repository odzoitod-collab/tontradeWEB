// Утилиты для работы с Telegram WebApp

/**
 * Получает объект Telegram WebApp
 */
export const getTelegramWebApp = () => {
  return window.Telegram?.WebApp;
};

/**
 * Проверяет, запущено ли приложение в Telegram
 */
export const isTelegramWebApp = (): boolean => {
  return !!window.Telegram?.WebApp?.initData;
};

/**
 * Разворачивает приложение на весь экран
 */
export const expandTelegramApp = (): void => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.expand();
    console.log('📱 Telegram app expanded');
  }
};

/**
 * Включает fullscreen режим (Telegram 7.0+)
 */
export const requestTelegramFullscreen = (): void => {
  const tg = getTelegramWebApp();
  if (tg && tg.requestFullscreen) {
    try {
      tg.requestFullscreen();
      console.log('✅ Fullscreen mode requested');
    } catch (error) {
      console.log('ℹ️ Fullscreen not available:', error);
    }
  }
};

/**
 * Выходит из fullscreen режима
 */
export const exitTelegramFullscreen = (): void => {
  const tg = getTelegramWebApp();
  if (tg && tg.exitFullscreen) {
    try {
      tg.exitFullscreen();
      console.log('✅ Exited fullscreen mode');
    } catch (error) {
      console.log('ℹ️ Exit fullscreen failed:', error);
    }
  }
};

/**
 * Проверяет, находится ли приложение в fullscreen режиме
 */
export const isTelegramFullscreen = (): boolean => {
  const tg = getTelegramWebApp();
  return tg?.isFullscreen ?? false;
};

/**
 * Отключает вертикальные свайпы (закрытие приложения)
 */
export const disableTelegramVerticalSwipes = (): void => {
  const tg = getTelegramWebApp();
  if (tg && tg.disableVerticalSwipes) {
    tg.disableVerticalSwipes();
    console.log('✅ Vertical swipes disabled');
  }
};

/**
 * Включает подтверждение закрытия
 */
export const enableTelegramClosingConfirmation = (): void => {
  const tg = getTelegramWebApp();
  if (tg && tg.enableClosingConfirmation) {
    tg.enableClosingConfirmation();
    console.log('✅ Closing confirmation enabled');
  }
};

/**
 * Устанавливает цвет заголовка
 */
export const setTelegramHeaderColor = (color: string): void => {
  const tg = getTelegramWebApp();
  if (tg && tg.setHeaderColor) {
    tg.setHeaderColor(color);
  }
};

/**
 * Устанавливает цвет фона
 */
export const setTelegramBackgroundColor = (color: string): void => {
  const tg = getTelegramWebApp();
  if (tg && tg.setBackgroundColor) {
    tg.setBackgroundColor(color);
  }
};

/**
 * Устанавливает цвет нижней панели
 */
export const setTelegramBottomBarColor = (color: string): void => {
  const tg = getTelegramWebApp();
  if (tg && tg.setBottomBarColor) {
    tg.setBottomBarColor(color);
  }
};

/**
 * Получает высоту viewport
 */
export const getTelegramViewportHeight = (): number => {
  const tg = getTelegramWebApp();
  return tg?.viewportHeight ?? window.innerHeight;
};

/**
 * Получает стабильную высоту viewport
 */
export const getTelegramViewportStableHeight = (): number => {
  const tg = getTelegramWebApp();
  return tg?.viewportStableHeight ?? window.innerHeight;
};

/**
 * Проверяет, развернуто ли приложение
 */
export const isTelegramExpanded = (): boolean => {
  const tg = getTelegramWebApp();
  return tg?.isExpanded ?? false;
};

/**
 * Получает версию Telegram
 */
export const getTelegramVersion = (): string => {
  const tg = getTelegramWebApp();
  return tg?.version ?? 'unknown';
};

/**
 * Получает платформу
 */
export const getTelegramPlatform = (): string => {
  const tg = getTelegramWebApp();
  return tg?.platform ?? 'unknown';
};

/**
 * Закрывает приложение
 */
export const closeTelegramApp = (): void => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.close();
  }
};

/**
 * Подписывается на событие изменения viewport
 */
export const onTelegramViewportChanged = (callback: () => void): void => {
  const tg = getTelegramWebApp();
  if (tg && tg.onEvent) {
    tg.onEvent('viewportChanged', callback);
  }
};

/**
 * Отписывается от события изменения viewport
 */
export const offTelegramViewportChanged = (callback: () => void): void => {
  const tg = getTelegramWebApp();
  if (tg && tg.offEvent) {
    tg.offEvent('viewportChanged', callback);
  }
};

/**
 * Инициализирует Telegram WebApp в fullscreen режиме
 */
export const initTelegramFullscreen = (): void => {
  if (!isTelegramWebApp()) {
    console.log('ℹ️ Not running in Telegram WebApp');
    return;
  }

  console.log('🚀 Initializing Telegram WebApp in fullscreen mode...');

  const tg = getTelegramWebApp();
  if (!tg) return;

  // Разворачиваем на весь экран
  expandTelegramApp();

  // Включаем fullscreen
  requestTelegramFullscreen();

  // Отключаем вертикальные свайпы
  disableTelegramVerticalSwipes();

  // Включаем подтверждение закрытия
  enableTelegramClosingConfirmation();

  // Устанавливаем цвета
  setTelegramHeaderColor('#000000');
  setTelegramBackgroundColor('#000000');
  setTelegramBottomBarColor('#000000');

  // Устанавливаем CSS переменные для отступов
  const updateCSSVariables = () => {
    const root = document.documentElement;
    
    // Высота header (если есть)
    const headerHeight = tg.isExpanded ? 0 : 56;
    root.style.setProperty('--tg-header-height', `${headerHeight}px`);
    
    // Высота viewport
    root.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`);
    root.style.setProperty('--tg-viewport-stable-height', `${tg.viewportStableHeight}px`);
    
    // Отступы для контента
    const topPadding = tg.isFullscreen ? 0 : 44;
    const bottomPadding = 60; // Для нижней навигации
    root.style.setProperty('--tg-content-top', `${topPadding}px`);
    root.style.setProperty('--tg-content-bottom', `${bottomPadding}px`);
  };

  updateCSSVariables();

  // Подписываемся на изменения viewport
  onTelegramViewportChanged(() => {
    console.log('📱 Viewport changed:', {
      height: getTelegramViewportHeight(),
      stableHeight: getTelegramViewportStableHeight(),
      isExpanded: isTelegramExpanded(),
      isFullscreen: isTelegramFullscreen()
    });

    // Обновляем CSS переменные
    updateCSSVariables();

    // Если свернулось - разворачиваем обратно
    if (!isTelegramExpanded()) {
      expandTelegramApp();
    }

    // Если вышли из fullscreen - включаем обратно
    if (!isTelegramFullscreen()) {
      requestTelegramFullscreen();
    }
  });

  // Логируем информацию
  console.log('✅ Telegram WebApp initialized');
  console.log('📱 Version:', getTelegramVersion());
  console.log('📱 Platform:', getTelegramPlatform());
  console.log('📱 Expanded:', isTelegramExpanded());
  console.log('📱 Fullscreen:', isTelegramFullscreen());
  console.log('📱 Viewport Height:', getTelegramViewportHeight());
  console.log('📱 Stable Height:', getTelegramViewportStableHeight());
};

/**
 * Получает информацию о Telegram WebApp
 */
export const getTelegramInfo = () => {
  const tg = getTelegramWebApp();
  
  if (!tg) {
    return null;
  }

  return {
    version: tg.version,
    platform: tg.platform,
    colorScheme: tg.colorScheme,
    isExpanded: tg.isExpanded,
    isFullscreen: tg.isFullscreen,
    viewportHeight: tg.viewportHeight,
    viewportStableHeight: tg.viewportStableHeight,
    headerColor: tg.headerColor,
    backgroundColor: tg.backgroundColor,
    bottomBarColor: tg.bottomBarColor
  };
};
