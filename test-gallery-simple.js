/**
 * Простой тест синтаксиса модуля Gallery
 */

console.log('🧪 Тестирование модуля gallery-browser.js...\n');

// Проверка синтаксиса
try {
  const fs = require('fs');
  const code = fs.readFileSync('./modules/gallery-browser.js', 'utf8');

  // Проверяем наличие ключевых элементов
  const checks = {
    'Класс PortfolioGallery': /class\s+PortfolioGallery/,
    'Метод init': /async\s+init\s*\(/,
    'Метод cacheElements': /cacheElements\s*\(/,
    'Метод initFilters': /initFilters\s*\(/,
    'Метод filterItems': /filterItems\s*\(/,
    'Метод initLazyLoading': /initLazyLoading\s*\(/,
    'Метод initLightbox': /initLightbox\s*\(/,
    'Метод initVideo': /initVideo\s*\(/,
    'Метод openLightbox': /openLightbox\s*\(/,
    'Кеширование элементов': /cachedElements/,
    'Делегирование событий': /addEventListener/,
    'Экспорт класса': /globalThis\.PortfolioGallery\s*=/,
    'IIFE обертка': /\(function\s*\(\)\s*\{/
  };

  let passed = 0;
  let failed = 0;

  console.log('Проверка структуры кода:');
  console.log('─'.repeat(50));

  for (const [checkName, pattern] of Object.entries(checks)) {
    if (pattern.test(code)) {
      console.log(`✅ ${checkName}`);
      passed++;
    } else {
      console.log(`❌ ${checkName}`);
      failed++;
    }
  }

  console.log('─'.repeat(50));
  console.log(`\nРезультат: ${passed} пройдено, ${failed} не пройдено`);

  if (failed === 0) {
    console.log('\n🎉 Все проверки пройдены успешно!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Некоторые проверки не пройдены');
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Ошибка при проверке:', error.message);
  process.exit(1);
}
