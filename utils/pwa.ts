// Утилиты для работы с PWA

/**
 * Проверяет, запущено ли приложение в standalone режиме (как PWA/APK)
 */
export const isStandalone = (): boolean => {
  // Проверка для iOS
  const isIOSStandalone = (window.navigator as any).standalone === true;
  
  // Проверка для Android и других платформ
  const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
  
  // Проверка для Telegram WebApp
  const isTelegramWebApp = window.Telegram?.WebApp?.platform !== undefined;
  
  return isIOSStandalone || isStandaloneMode || isTelegramWebApp;
};

/**
 * Проверяет, является ли устройство мобильным
 */
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Получает тип платформы
 */
export const getPlatform = (): 'ios' | 'android' | 'desktop' => {
  const ua = navigator.userAgent;
  
  if (/iPad|iPhone|iPod/.test(ua)) {
    return 'ios';
  }
  
  if (/Android/.test(ua)) {
    return 'android';
  }
  
  return 'desktop';
};

/**
 * Проверяет, можно ли установить PWA
 */
export const canInstallPWA = (): boolean => {
  return !isStandalone() && isMobile();
};

/**
 * Показывает промпт установки PWA
 */
export const showInstallPrompt = (): void => {
  if (typeof window !== 'undefined' && (window as any).showInstallPrompt) {
    (window as any).showInstallPrompt();
  }
};

/**
 * Отключает pull-to-refresh
 */
export const disablePullToRefresh = (): void => {
  document.body.style.overscrollBehaviorY = 'contain';
};

/**
 * Отключает зум
 */
export const disableZoom = (): void => {
  const viewport = document.querySelector('meta[name=viewport]');
  if (viewport) {
    viewport.setAttribute('content', 
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover'
    );
  }
};

/**
 * Скрывает адресную строку (для старых браузеров)
 */
export const hideAddressBar = (): void => {
  setTimeout(() => {
    window.scrollTo(0, 1);
  }, 0);
};

/**
 * Включает полноэкранный режим
 */
export const requestFullscreen = async (): Promise<void> => {
  try {
    const elem = document.documentElement;
    
    if (elem.requestFullscreen) {
      await elem.requestFullscreen();
    } else if ((elem as any).webkitRequestFullscreen) {
      await (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).mozRequestFullScreen) {
      await (elem as any).mozRequestFullScreen();
    } else if ((elem as any).msRequestFullscreen) {
      await (elem as any).msRequestFullscreen();
    }
  } catch (error) {
    console.log('Fullscreen not supported:', error);
  }
};

/**
 * Выходит из полноэкранного режима
 */
export const exitFullscreen = async (): Promise<void> => {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      await (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      await (document as any).msExitFullscreen();
    }
  } catch (error) {
    console.log('Exit fullscreen failed:', error);
  }
};

/**
 * Проверяет, находится ли приложение в полноэкранном режиме
 */
export const isFullscreen = (): boolean => {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
};

/**
 * Вибрация (если поддерживается)
 */
export const vibrate = (pattern: number | number[]): void => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

/**
 * Запрашивает разрешение на уведомления
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return 'denied';
  }
  
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }
  
  return Notification.permission;
};

/**
 * Показывает уведомление
 */
export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      ...options
    });
  }
};

/**
 * Блокирует скролл страницы
 */
export const lockScroll = (): void => {
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
};

/**
 * Разблокирует скролл страницы
 */
export const unlockScroll = (): void => {
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
};

/**
 * Получает высоту safe area (для iPhone с вырезом)
 */
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0')
  };
};

/**
 * Копирует текст в буфер обмена
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback для старых браузеров
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
};

/**
 * Делится контентом (если поддерживается Web Share API)
 */
export const share = async (data: ShareData): Promise<boolean> => {
  try {
    if (navigator.share) {
      await navigator.share(data);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Share failed:', error);
    return false;
  }
};

/**
 * Инициализация PWA функционала
 */
export const initPWA = (): void => {
  console.log('🚀 Initializing PWA...');
  
  // Отключаем pull-to-refresh
  disablePullToRefresh();
  
  // Отключаем зум
  disableZoom();
  
  // Скрываем адресную строку
  if (isMobile()) {
    hideAddressBar();
  }
  
  // Логируем информацию о платформе
  console.log('📱 Platform:', getPlatform());
  console.log('📱 Standalone:', isStandalone());
  console.log('📱 Mobile:', isMobile());
  
  // Запрашиваем разрешение на уведомления (опционально)
  if (isStandalone()) {
    setTimeout(() => {
      requestNotificationPermission().then((permission) => {
        console.log('🔔 Notification permission:', permission);
      });
    }, 3000);
  }
};
