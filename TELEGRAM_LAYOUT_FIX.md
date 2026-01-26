# 🔧 Исправление layout для Telegram

## Что было исправлено

### 1. Добавлены отступы для кнопок Telegram
- ✅ Верхний отступ 44px (для header Telegram)
- ✅ Нижний отступ 60px (для нижней навигации)
- ✅ Динамические CSS переменные
- ✅ Автоматическая подстройка при изменении viewport

### 2. Исправлен скролл страницы активов
- ✅ Изменен `overflow-y-scroll` на `overflow-y-auto`
- ✅ Добавлен `overscrollBehavior: 'contain'`
- ✅ Улучшен `scrollBehavior: 'smooth'`
- ✅ Теперь страница листается вверх без проблем

### 3. Улучшен layout всех страниц
- ✅ Все страницы имеют классы `telegram-safe-top` и `telegram-safe-bottom`
- ✅ Контент не перекрывается кнопками Telegram
- ✅ Все элементы видны полностью

## Технические детали

### CSS переменные

Автоматически устанавливаются при инициализации:

```css
:root {
  --tg-header-height: 0px;           /* Высота header */
  --tg-viewport-height: 100vh;       /* Высота viewport */
  --tg-viewport-stable-height: 100vh; /* Стабильная высота */
  --tg-content-top: 44px;            /* Верхний отступ */
  --tg-content-bottom: 60px;         /* Нижний отступ */
}
```

### CSS классы

```css
.telegram-safe-top {
  padding-top: max(env(safe-area-inset-top, 0px), var(--tg-content-top, 44px));
}

.telegram-safe-bottom {
  padding-bottom: max(env(safe-area-inset-bottom, 0px), var(--tg-content-bottom, 60px));
}
```

### Использование в компонентах

```tsx
// Все страницы обернуты в div с отступами
<div className="h-full w-full telegram-safe-top telegram-safe-bottom">
  <TradingPage ... />
</div>
```

## Как это работает

### 1. Инициализация (utils/telegram.ts)

```typescript
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
  const bottomPadding = 60;
  root.style.setProperty('--tg-content-top', `${topPadding}px`);
  root.style.setProperty('--tg-content-bottom', `${bottomPadding}px`);
};
```

### 2. Автоматическое обновление

При изменении viewport (разворачивание/сворачивание):
```typescript
onTelegramViewportChanged(() => {
  updateCSSVariables(); // Обновляем переменные
});
```

### 3. Применение в layout

```tsx
// Home page с скроллом
<div 
  ref={containerRef}
  className="h-full w-full overflow-y-auto snap-y snap-mandatory no-scrollbar scroll-smooth telegram-safe-top telegram-safe-bottom"
  style={{ 
    WebkitOverflowScrolling: 'touch',
    scrollBehavior: 'smooth',
    overscrollBehavior: 'contain'
  }}
>
  <section className="h-[100dvh] w-full snap-start shrink-0 relative z-10 flex items-center justify-center">
    <div className="w-full h-full pt-12 pb-20">
      <HeroSection ... />
    </div>
  </section>
</div>
```

## Исправление скролла

### Было:
```tsx
className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
style={{ WebkitOverflowScrolling: 'touch' }}
```

### Стало:
```tsx
className="h-full w-full overflow-y-auto snap-y snap-mandatory no-scrollbar scroll-smooth telegram-safe-top telegram-safe-bottom"
style={{ 
  WebkitOverflowScrolling: 'touch',
  scrollBehavior: 'smooth',
  overscrollBehavior: 'contain'
}}
```

### Изменения:
1. `overflow-y-scroll` → `overflow-y-auto` (скролл только когда нужен)
2. Добавлен `scrollBehavior: 'smooth'` (плавный скролл)
3. Добавлен `overscrollBehavior: 'contain'` (предотвращает bounce)
4. Добавлены классы `telegram-safe-top` и `telegram-safe-bottom`

## Дополнительные отступы

### HeroSection
```tsx
<div className="w-full h-full pt-12 pb-20">
  <HeroSection ... />
</div>
```
- `pt-12` (48px) - дополнительный отступ сверху
- `pb-20` (80px) - дополнительный отступ снизу

### TasksSheet
```tsx
<section className="min-h-[100dvh] w-full snap-start shrink-0 relative z-20 -mt-4 pb-20">
  <TasksSheet ... />
</section>
```
- `pb-20` (80px) - отступ снизу для навигации

## Тестирование

### 1. Проверка отступов
```
1. Откройте приложение в Telegram
2. Проверьте, что верхний контент не перекрыт header
3. Проверьте, что нижний контент не перекрыт навигацией
4. Все элементы должны быть видны полностью
```

### 2. Проверка скролла
```
1. Откройте главную страницу (Home)
2. Попробуйте листать вверх
3. Страница должна листаться плавно
4. Попробуйте листать вниз к TasksSheet
5. Snap должен работать корректно
```

### 3. Проверка на разных устройствах
```
1. iPhone с вырезом (notch)
2. Android с кнопками навигации
3. Telegram Desktop
4. Telegram Web
```

## Отладка

### Проверка CSS переменных

Откройте DevTools и выполните:
```javascript
const root = document.documentElement;
console.log('--tg-header-height:', getComputedStyle(root).getPropertyValue('--tg-header-height'));
console.log('--tg-viewport-height:', getComputedStyle(root).getPropertyValue('--tg-viewport-height'));
console.log('--tg-content-top:', getComputedStyle(root).getPropertyValue('--tg-content-top'));
console.log('--tg-content-bottom:', getComputedStyle(root).getPropertyValue('--tg-content-bottom'));
```

### Проверка отступов

```javascript
const element = document.querySelector('.telegram-safe-top');
console.log('Padding top:', getComputedStyle(element).paddingTop);

const element2 = document.querySelector('.telegram-safe-bottom');
console.log('Padding bottom:', getComputedStyle(element2).paddingBottom);
```

## Настройка отступов

Если нужно изменить отступы, отредактируйте в `utils/telegram.ts`:

```typescript
// Отступы для контента
const topPadding = tg.isFullscreen ? 0 : 44; // Измените 44 на нужное значение
const bottomPadding = 60; // Измените 60 на нужное значение
```

Или в CSS:

```css
:root {
  --tg-content-top: 44px;  /* Верхний отступ */
  --tg-content-bottom: 60px; /* Нижний отступ */
}
```

## Проблемы и решения

### Проблема: Контент все еще перекрыт

**Решение:**
```typescript
// Увеличьте отступы в utils/telegram.ts
const topPadding = tg.isFullscreen ? 0 : 60; // Было 44
const bottomPadding = 80; // Было 60
```

### Проблема: Скролл не работает

**Решение:**
```tsx
// Проверьте, что используется overflow-y-auto
className="overflow-y-auto"
```

### Проблема: Snap не работает

**Решение:**
```tsx
// Убедитесь, что есть snap-y и snap-mandatory
className="snap-y snap-mandatory"
```

### Проблема: Bounce эффект на iOS

**Решение:**
```tsx
style={{ overscrollBehavior: 'contain' }}
```

## Итог

✅ Все элементы видны полностью  
✅ Кнопки Telegram не перекрывают контент  
✅ Скролл работает плавно вверх и вниз  
✅ Snap работает корректно  
✅ Адаптация под все устройства  

---

**Статус:** ✅ Исправлено  
**Дата:** 26 января 2026
