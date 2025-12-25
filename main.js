/**
 * Основной скрипт портфолио - оптимизированная версия
 * Координирует все модули и обеспечивает быструю загрузку
 */

import { inject } from '@vercel/analytics';
import { CoreModule } from './modules/core.js';
import { PerformanceModule } from './modules/performance.js';
import { MediaModule } from './modules/media-optimized.js';
import { LibraryLoader } from './modules/library-loader.js';
import { Utils } from './modules/utils.js';
import logger from './modules/logger.js';

class PortfolioApp {
  constructor() {
    this.modules = new Map();
    this.performance = null;
    this.loadStartTime = performance.now();
    this.isInitialized = false;

    this.initApp();
  }

  async initApp() {
    try {
      // Initialize Vercel Web Analytics
      inject();

      // Сначала запускаем Performance Module для мониторинга
      this.performance = new PerformanceModule();
      this.modules.set('performance', this.performance);

      // Детектируем возможности устройства
      const deviceCapabilities = await this.detectDeviceCapabilities();

      // Инициализируем модули в порядке приоритета
      await this.initCriticalModules(deviceCapabilities);

      // Загружаем остальные модули асинхронно
      this.initSecondaryModules(deviceCapabilities);

      this.setupGlobalErrorHandling();
      this.isInitialized = true;

      const totalTime = performance.now() - this.loadStartTime;
      this.performance?.recordMetric('appInitTime', totalTime);

      // Отправляем событие готовности
      document.dispatchEvent(
        new CustomEvent('app:ready', {
          detail: {
            loadTime: totalTime,
            modules: Array.from(this.modules.keys())
          }
        })
      );
    } catch (error) {
      this.handleCriticalError(error);
    }
  }

  /**
   * Определение возможностей устройства
   */
  async detectDeviceCapabilities() {
    const capabilities = {
      deviceType: Utils.getDeviceType(),
      isSlowConnection: Utils.isSlowConnection(),
      prefersReducedMotion: Utils.prefersReducedMotion(),
      prefersDarkTheme: Utils.prefersDarkScheme(),
      webpSupport: await Utils.checkWebPSupport(),
      avifSupport: await Utils.checkAVIFSupport(),
      memoryInfo: navigator.deviceMemory || 4,
      connectionType: navigator.connection?.effectiveType || 'unknown'
    };

    // Сохраняем в localStorage для последующих посещений
    Utils.saveToStorage('deviceCapabilities', capabilities);

    return capabilities;
  }

  /**
   * Инициализация критических модулей
   */
  async initCriticalModules(capabilities) {
    // Core Module - всегда нужен
    const core = new CoreModule();
    this.modules.set('core', core);

    // Library Loader для управления зависимостями
    const libraryLoader = new LibraryLoader();
    this.modules.set('libraryLoader', libraryLoader);
    window.LibraryLoader = libraryLoader;

    // Media Module если нужен медиа-контент
    if (this.hasMediaContent()) {
      const media = new MediaModule();
      this.modules.set('media', media);
    }
  }

  /**
   * Инициализация вторичных модулей
   */
  async initSecondaryModules(capabilities) {
    // Загружаем модули асинхронно в зависимости от возможностей устройства
    const modulePromises = [];

    // Animations - только если устройство поддерживает и пользователь не отключил
    if (
      !capabilities.prefersReducedMotion &&
      capabilities.deviceType === 'desktop'
    ) {
      modulePromises.push(this.loadModule('animations'));
    }

    // Gallery - если есть галерея на странице
    if (document.querySelector('.gallery, .portfolio-grid')) {
      modulePromises.push(this.loadModule('gallery'));
    }

    // Forms - если есть формы
    if (document.querySelector('form')) {
      modulePromises.push(this.loadModule('forms'));
    }

    // Загружаем все модули параллельно
    try {
      await Promise.allSettled(modulePromises);
    } catch (error) {
      // Не критично, продолжаем работу
      this.performance?.recordError('secondaryModules', error);
    }
  }

  /**
   * Динамическая загрузка модуля
   */
  async loadModule(moduleName) {
    try {
      const moduleMap = {
        animations: () => import('./modules/animations.js'),
        gallery: () => import('./modules/gallery.js'),
        forms: () => import('./modules/forms.js')
      };

      if (moduleMap[moduleName]) {
        const moduleClass = await moduleMap[moduleName]();
        const instance = new moduleClass.default();
        this.modules.set(moduleName, instance);

        return instance;
      }
    } catch (error) {
      this.performance?.recordError(`loadModule:${moduleName}`, error);
      throw error;
    }
  }

  /**
   * Проверка наличия медиа-контента
   */
  hasMediaContent() {
    return document.querySelector('img, video, picture, [data-src]');
  }

  /**
   * Настройка глобальной обработки ошибок
   */
  setupGlobalErrorHandling() {
    window.addEventListener('error', event => {
      this.handleError('javascript', event.error);
    });

    window.addEventListener('unhandledrejection', event => {
      this.handleError('promise', event.reason);
      event.preventDefault(); // Предотвращаем вывод в консоль
    });
  }

  /**
   * Обработка ошибок
   */
  handleError(type, error) {
    this.performance?.recordError(type, error);

    // Логируем ошибку
    logger.error(`Error [${type}]:`, error);

    // В production можно отправлять в систему мониторинга
    if (import.meta.env?.PROD || process.env.NODE_ENV === 'production') {
      this.sendErrorToMonitoring(type, error);
    }
  }

  /**
   * Обработка критических ошибок
   */
  handleCriticalError(error) {
    // Fallback режим - минимальная функциональность
    document.body.classList.add('fallback-mode');

    // Создаем уведомление пользователю
    this.showErrorNotification(
      'Some features may not work properly. Please refresh the page.'
    );

    this.performance?.recordError('critical', error);
  }

  /**
   * Отправка ошибок в мониторинг (заглушка)
   */
  sendErrorToMonitoring(type, error) {
    // Здесь можно интегрировать с Sentry, LogRocket и т.д.
    if (window.gtag) {
      gtag('event', 'exception', {
        description: `${type}: ${error.message || error}`,
        fatal: false
      });
    }
  }

  /**
   * Показ уведомления об ошибке
   */
  showErrorNotification(message) {
    const notification = Utils.createElement('div', {
      className: 'error-notification',
      innerHTML: `
                <span>${message}</span>
                <button onclick="this.parentElement.remove()">×</button>
            `
    });

    document.body.appendChild(notification);

    // Автоудаление через 10 секунд
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  /**
   * Получение модуля
   */
  getModule(name) {
    return this.modules.get(name);
  }

  /**
   * Очистка всех модулей
   */
  cleanup() {
    this.modules.forEach(module => {
      if (typeof module.cleanup === 'function') {
        module.cleanup();
      }
    });

    this.modules.clear();
  }
}

// Инициализация приложения
let app;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app = new PortfolioApp();
  });
} else {
  app = new PortfolioApp();
}

// Экспорт для внешнего использования
window.PortfolioApp = PortfolioApp;
window.app = app;

// Cleanup при выгрузке страницы
window.addEventListener('beforeunload', () => {
  if (app) {
    app.cleanup();
  }
});
