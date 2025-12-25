/**
 * Простой тест для проверки модуля Gallery
 * Запуск: node test-gallery.js
 */

// Симулируем DOM окружение
global.document = {
  querySelectorAll: () => [],
  querySelector: () => null,
  getElementById: () => null,
  head: { appendChild: () => {} },
  body: { appendChild: () => {}, style: {} },
  addEventListener: () => {},
  removeEventListener: () => {}
}

global.globalThis = global
global.console = {
  log: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args)
}

// Загружаем модуль
try {
  require('./modules/gallery-browser.js')

  console.log('✅ Модуль загружен успешно')

  // Проверяем, что класс экспортирован
  if (typeof globalThis.PortfolioGallery !== 'undefined') {
    console.log('✅ Класс PortfolioGallery экспортирован')

    // Проверяем создание экземпляра
    try {
      const gallery = new globalThis.PortfolioGallery()
      console.log('✅ Экземпляр создан успешно')

      // Проверяем методы
      const methods = [
        'init',
        'cacheElements',
        'initFilters',
        'filterItems',
        'initLazyLoading',
        'initLightbox',
        'initVideo',
        'openLightbox'
      ]
      const missingMethods = methods.filter(
        method => typeof gallery[method] !== 'function'
      )

      if (missingMethods.length === 0) {
        console.log('✅ Все методы присутствуют')
      } else {
        console.error('❌ Отсутствуют методы:', missingMethods)
        process.exit(1)
      }

      // Проверяем кеширование элементов
      if (
        gallery.cachedElements &&
        typeof gallery.cachedElements === 'object'
      ) {
        console.log('✅ Кеширование элементов настроено')
      } else {
        console.error('❌ Кеширование элементов не настроено')
        process.exit(1)
      }

      console.log('\n🎉 Все тесты пройдены успешно!')
    } catch (error) {
      console.error('❌ Ошибка при создании экземпляра:', error.message)
      process.exit(1)
    }
  } else {
    console.error('❌ Класс PortfolioGallery не экспортирован')
    process.exit(1)
  }
} catch (error) {
  console.error('❌ Ошибка загрузки модуля:', error.message)
  console.error(error.stack)
  process.exit(1)
}
