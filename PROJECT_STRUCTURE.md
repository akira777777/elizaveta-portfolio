# Структура проекта

## Организация модулей

### Основные модули (ES6)
- `modules/core.js` - Основной модуль приложения
- `modules/performance.js` - Мониторинг производительности
- `modules/media-optimized.js` - Оптимизированный медиа-модуль (используется)
- `modules/gallery.js` - Галерея изображений
- `modules/forms.js` - Обработка форм
- `modules/animations.js` - Анимации

### Browser-compatible модули (Legacy)
- `modules/gallery-browser.js` - Галерея для старых браузеров
- `modules/forms-browser.js` - Формы для старых браузеров
- `main-browser.js` - Главный скрипт для старых браузеров

### Утилиты
- `modules/utils.js` - Общие утилиты
- `modules/logger.js` - Система логирования
- `modules/library-loader.js` - Загрузчик библиотек

### Подмодули медиа
- `modules/media/image-manager.js` - Управление изображениями
- `modules/media/lazy-loader.js` - Ленивая загрузка
- `modules/media/video-manager.js` - Управление видео

## Неиспользуемые файлы

⚠️ **Устаревшие модули (можно удалить после проверки):**
- `modules/media.js` - Заменен на `media-optimized.js`
- `modules/image-fallback.js` - Функциональность перенесена
- `modules/path-resolver.js` - Не используется
- `modules/sw-logger.js` - Дублирует функциональность logger.js

## Правила использования

1. **Логирование**: Всегда используйте `logger` из `modules/logger.js`, не `console.log`
2. **Импорты**: Используйте ES6 imports для новых модулей
3. **Обработка ошибок**: Всегда оборачивайте в try/catch с логированием
4. **Модульность**: Каждый модуль должен быть независимым и иметь cleanup метод
