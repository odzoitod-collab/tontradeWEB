#!/bin/bash

# 🚀 Скрипт для создания APK из веб-приложения TonTrader
# Использует Capacitor для конвертации React приложения в Android APK

echo "📱 Создание APK для TonTrader..."

# Проверяем наличие Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js 18+ и попробуйте снова."
    exit 1
fi

# Проверяем наличие Java
if ! command -v java &> /dev/null; then
    echo "❌ Java не установлен. Установите Java 11+ и попробуйте снова."
    exit 1
fi

echo "✅ Проверка зависимостей пройдена"

# Устанавливаем зависимости если нужно
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm install
fi

# Устанавливаем Capacitor если нужно
if [ ! -f "capacitor.config.ts" ]; then
    echo "⚡ Настройка Capacitor..."
    npm install @capacitor/core @capacitor/cli @capacitor/android
    
    # Создаем конфигурацию Capacitor
    cat > capacitor.config.ts << EOF
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tontrader.app',
  appName: 'TonTrader',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false
    }
  }
};

export default config;
EOF

    # Инициализируем Capacitor
    npx cap init TonTrader com.tontrader.app --web-dir=dist
    
    # Добавляем Android платформу
    npx cap add android
fi

# Собираем веб-приложение
echo "🔨 Сборка веб-приложения..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Ошибка сборки веб-приложения"
    exit 1
fi

# Синхронизируем с Android
echo "🔄 Синхронизация с Android..."
npx cap sync android

# Собираем APK
echo "📱 Сборка APK файла..."
cd android

# Проверяем наличие gradlew
if [ ! -f "gradlew" ]; then
    echo "❌ Gradle wrapper не найден. Откройте проект в Android Studio и попробуйте снова."
    exit 1
fi

# Делаем gradlew исполняемым
chmod +x gradlew

# Собираем debug APK (для тестирования)
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ APK успешно создан!"
    echo "📍 Расположение: android/app/build/outputs/apk/debug/app-debug.apk"
    
    # Копируем APK в корень проекта для удобства
    cp app/build/outputs/apk/debug/app-debug.apk ../tontrader-debug.apk
    echo "📋 Скопирован как: tontrader-debug.apk"
    
    # Показываем размер файла
    size=$(du -h ../tontrader-debug.apk | cut -f1)
    echo "📏 Размер файла: $size"
    
    echo ""
    echo "🚀 Готово! Теперь вы можете:"
    echo "1. Загрузить APK на GitHub Releases"
    echo "2. Разместить на своем сервере"
    echo "3. Отправить пользователям для тестирования"
    echo ""
    echo "📝 Для production сборки используйте:"
    echo "   ./gradlew assembleRelease"
    
else
    echo "❌ Ошибка сборки APK"
    exit 1
fi

cd ..

echo "🎉 Процесс завершен!"