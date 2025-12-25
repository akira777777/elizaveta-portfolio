/**
 * Main Portfolio Script - Browser Compatible Version
 * Основной скрипт портфолио без ES6 импортов
 */

(function () {
  'use strict';

  // Конфигурация приложения
  const APP_CONFIG = {
    version: '2.2.0',
    debug: false,
    modules: {
      core: true,
      performance: true,
      gallery: true,
      forms: true,
      animations: false // Отключаем пока не нужны
    }
  };

  // Утилиты для оптимизации производительности
  const Utils = {
    // Debounce: откладывает выполнение функции до окончания серии вызовов
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // Throttle: ограничивает частоту вызовов функции
    throttle(func, limit) {
      let inThrottle;
      return function executedFunction(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => {
            inThrottle = false;
          }, limit);
        }
      };
    },

    // Проверка поддержки браузером
    supports(feature) {
      const features = {
        intersectionObserver: 'IntersectionObserver' in window,
        requestIdleCallback: 'requestIdleCallback' in window,
        passiveEvents: (() => {
          let supportsPassive = false;
          try {
            const opts = Object.defineProperty({}, 'passive', {
              get() {
                supportsPassive = true;
                return false;
              }
            });
            window.addEventListener('test', null, opts);
            window.removeEventListener('test', null, opts);
          } catch (e) {
            // ignore
          }
          return supportsPassive;
        })()
      };
      return features[feature] || false;
    }
  };

  class PortfolioApp {
    constructor() {
      this.modules = new Map();
      this.loadStartTime = performance.now();
      this.isInitialized = false;
      this.readyCallbacks = [];

      this.init();
    }

    init() {
      // Проверяем готовность DOM
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initApp());
      } else {
        this.initApp();
      }
    }

    async initApp() {
      try {
        console.log(`🚀 Portfolio App v${APP_CONFIG.version} starting...`);

        // Инициализируем базовые функции
        this.initBasicFeatures();

        // Загружаем модули
        await this.loadModules();

        // Настраиваем интерактивность
        this.setupInteractions();

        // Инициализируем анимации
        this.initAnimations();

        // Завершение инициализации
        this.completeInit();
      } catch (error) {
        console.error('❌ Portfolio App initialization failed:', error);
        this.initFallbackMode();
      }
    }

    initBasicFeatures() {
      // Smooth scroll для ссылок
      this.initSmoothScroll();

      // Мобильное меню
      this.initMobileMenu();

      // Переключение темы
      this.initThemeToggle();

      // Lazy loading изображений
      this.initLazyLoading();

      // Базовая аналитика
      this.initAnalytics();

      // Scroll progress bar
      this.initScrollProgress();
    }

    initSmoothScroll() {
      const links = document.querySelectorAll('a[href^="#"]');
      links.forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          const targetId = link.getAttribute('href').substring(1);
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });

            // Обновляем URL без перезагрузки
            history.pushState(null, null, `#${targetId}`);
          }
        });
      });
    }

    initMobileMenu() {
      const hamburger = document.querySelector('.hamburger');
      const navMenu = document.querySelector('.nav-menu');
      const navbar = document.querySelector('.navbar');

      if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
          navMenu.classList.toggle('active');
          hamburger.classList.toggle('active');
          document.body.classList.toggle('menu-open');
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', e => {
          if (
            navbar &&
            !navbar.contains(e.target) &&
            navMenu.classList.contains('active')
          ) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.classList.remove('menu-open');
          }
        });

        // Закрытие меню при клике на ссылку
        const menuLinks = navMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
          link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.classList.remove('menu-open');
          });
        });
      }
    }

    initLazyLoading() {
      // Обработка изображений с loading="lazy"
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');

      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const img = entry.target;
                // Убеждаемся, что изображение загружено
                if (!img.complete) {
                  img.addEventListener('load', () => {
                    img.classList.add('loaded');
                  });
                  img.addEventListener('error', () => {
                    this.handleImageError(img);
                  });
                } else {
                  img.classList.add('loaded');
                }
                observer.unobserve(img);
              }
            });
          },
          {
            rootMargin: '50px 0px'
          }
        );

        lazyImages.forEach(img => imageObserver.observe(img));
      }

      // Обработка изображений с data-src
      const dataSrcImages = document.querySelectorAll('img[data-src]');
      if (dataSrcImages.length > 0) {
        if ('IntersectionObserver' in window) {
          const dataSrcObserver = new IntersectionObserver(
            (entries, observer) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  const img = entry.target;
                  this.loadImage(img);
                  observer.unobserve(img);
                }
              });
            },
            {
              rootMargin: '50px 0px'
            }
          );

          dataSrcImages.forEach(img => dataSrcObserver.observe(img));
        } else {
          // Fallback для старых браузеров
          dataSrcImages.forEach(img => this.loadImage(img));
        }
      }

      // Обработка ошибок загрузки всех изображений
      document.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('data-error-handled')) {
          img.setAttribute('data-error-handled', 'true');
          img.addEventListener('error', () => {
            this.handleImageError(img);
          });
        }
      });
    }

    loadImage(img) {
      const src = img.getAttribute('data-src');
      if (src) {
        img.src = src;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
      }
    }

    handleImageError(img) {
      console.warn('Image failed to load:', img.src || img.getAttribute('data-src'));
      img.classList.add('error');
      img.classList.add('loaded'); // Чтобы убрать placeholder

      // Можно добавить fallback изображение
      if (!img.hasAttribute('data-fallback-set')) {
        img.setAttribute('data-fallback-set', 'true');
        img.style.backgroundColor = '#f0f0f0';
        img.alt = img.alt || 'Image not available';
      }
    }

    initAnalytics() {
      // Отслеживание производительности
      window.addEventListener('load', () => {
        const loadTime = performance.now() - this.loadStartTime;
        console.log(`⚡ App loaded in ${Math.round(loadTime)}ms`);

        // Обновляем performance badge
        this.updatePerformanceBadge(loadTime);

        // Отправка метрик (если настроен GA)
        if (window.gtag) {
          gtag('event', 'page_load_time', {
            value: Math.round(loadTime),
            event_category: 'performance'
          });
        }
      });

      // Отслеживание ошибок
      window.addEventListener('error', e => {
        console.error('Global error:', e.error);

        if (window.gtag) {
          gtag('event', 'javascript_error', {
            error_message: e.message,
            event_category: 'error'
          });
        }
      });
    }

    updatePerformanceBadge(loadTime) {
      const badge = document.getElementById('performance-badge');
      const scoreElement = document.getElementById('performance-score');

      if (!badge || !scoreElement) return;

      // Вычисляем оценку производительности (100 - время загрузки в секундах * 10, минимум 0)
      let score = Math.max(0, 100 - Math.round(loadTime / 10));

      // Если загрузка очень быстрая (< 1 сек), даем 100
      if (loadTime < 1000) {
        score = 100;
      }

      scoreElement.textContent = score;

      // Обновляем цвет в зависимости от оценки
      if (score >= 90) {
        badge.style.backgroundColor = '#4caf50';
      } else if (score >= 70) {
        badge.style.backgroundColor = '#ff9800';
      } else {
        badge.style.backgroundColor = '#f44336';
      }

      // Показываем badge через небольшую задержку
      setTimeout(() => {
        badge.style.opacity = '1';
        badge.style.visibility = 'visible';
      }, 500);
    }

    async loadModules() {
      const promises = [];

      // Загружаем модули параллельно
      if (APP_CONFIG.modules.gallery) {
        promises.push(this.loadGalleryModule());
      }

      if (APP_CONFIG.modules.forms) {
        promises.push(this.loadFormsModule());
      }

      // Ждем загрузки всех модулей
      const results = await Promise.allSettled(promises);

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`Module ${index} failed to load:`, result.reason);
        }
      });
    }

    async loadGalleryModule() {
      try {
        // Ждем, пока модуль загрузится (если он уже подключен через script тег)
        let attempts = 0;
        while (!window.PortfolioGallery && attempts < 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        // Проверяем, загружен ли модуль
        if (window.PortfolioGallery) {
          const gallery = new window.PortfolioGallery();
          // Инициализируем модуль после небольшой задержки для DOM
          await new Promise(resolve => setTimeout(resolve, 100));
          await gallery.init();
          this.modules.set('gallery', gallery);
          console.log('✅ Gallery module initialized');
          return gallery;
        }

        // Если модуль не загружен, загружаем скрипт
        await this.loadScript('modules/gallery-browser.js');

        // Ждем еще немного после загрузки скрипта
        await new Promise(resolve => setTimeout(resolve, 200));

        if (window.PortfolioGallery) {
          const gallery = new window.PortfolioGallery();
          await gallery.init();
          this.modules.set('gallery', gallery);
          console.log('✅ Gallery module loaded and initialized');
          return gallery;
        }

        console.warn('⚠️ Gallery module not found, but continuing...');
        return null;
      } catch (error) {
        console.error('Failed to load gallery module:', error);
        // Не бросаем ошибку, чтобы приложение продолжало работать
        return null;
      }
    }

    async loadFormsModule() {
      try {
        // Ждем, пока модуль загрузится (если он уже подключен через script тег)
        let attempts = 0;
        while (!window.PortfolioForms && attempts < 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (window.PortfolioForms) {
          const forms = new window.PortfolioForms();
          await forms.init(); // Инициализируем модуль
          this.modules.set('forms', forms);
          return forms;
        }

        await this.loadScript('modules/forms-browser.js');

        // Ждем еще немного после загрузки скрипта
        await new Promise(resolve => setTimeout(resolve, 200));

        if (window.PortfolioForms) {
          const forms = new window.PortfolioForms();
          await forms.init();
          this.modules.set('forms', forms);
          return forms;
        }

        throw new Error('Forms module not found after loading');
      } catch (error) {
        console.error('Failed to load forms module:', error);
        // Не бросаем ошибку, чтобы приложение продолжало работать
        return null;
      }
    }

    loadScript(src) {
      return new Promise((resolve, reject) => {
        // Проверяем, не загружен ли уже скрипт
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;

        script.onload = resolve;
        script.onerror = () =>
          reject(new Error(`Failed to load script: ${src}`));

        document.head.appendChild(script);
      });
    }

    setupInteractions() {
      // Кнопка "Наверх"
      this.setupScrollToTop();

      // Активный раздел в навигации
      this.setupActiveNavigation();

      // Параллакс эффекты (простые)
      this.setupSimpleParallax();

      // Обработка видео в портфолио
      this.setupVideoPortfolio();
    }

    setupVideoPortfolio() {
      const videoItems = document.querySelectorAll('.video-portfolio-item');

      videoItems.forEach(item => {
        const video = item.querySelector('.portfolio-video');
        const playButton = item.querySelector('.play-button');
        const overlay = item.querySelector('.video-overlay');

        if (!video || !playButton) return;

        // Обработка клика на кнопку воспроизведения
        playButton.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleVideoPlayback(video, overlay, playButton);
        });

        // Обработка клика на overlay
        if (overlay) {
          overlay.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleVideoPlayback(video, overlay, playButton);
          });
        }

        // Обработка окончания видео
        video.addEventListener('ended', () => {
          video.pause();
          video.currentTime = 0;
          if (overlay) overlay.style.display = 'flex';
          if (playButton) playButton.style.display = 'flex';
        });

        // Обработка ошибок загрузки видео
        video.addEventListener('error', () => {
          console.warn('Video failed to load:', video.querySelector('source')?.src);
          if (playButton) {
            playButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            playButton.style.cursor = 'not-allowed';
          }
        });
      });
    }

    toggleVideoPlayback(video, overlay, playButton) {
      if (video.paused) {
        video.play().then(() => {
          if (overlay) overlay.style.display = 'none';
          if (playButton) playButton.style.display = 'none';
        }).catch(error => {
          console.error('Error playing video:', error);
        });
      } else {
        video.pause();
        if (overlay) overlay.style.display = 'flex';
        if (playButton) playButton.style.display = 'flex';
      }
    }

    setupScrollToTop() {
      // Проверяем существующую кнопку back-to-top
      const backToTopBtn = document.getElementById('back-to-top');
      const scrollBtn =
        backToTopBtn || document.querySelector('.scroll-to-top') || this.createScrollToTopBtn();

      // Оптимизируем scroll событие с throttle
      const handleScroll = Utils.throttle(() => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollY > 300) {
          scrollBtn.classList.add('visible');
          if (scrollBtn.style) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
          }
        } else {
          scrollBtn.classList.remove('visible');
          if (scrollBtn.style) {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
          }
        }
      }, 100);

      // Используем passive listener для лучшей производительности
      const scrollOptions = Utils.supports('passiveEvents')
        ? { passive: true }
        : false;
      window.addEventListener('scroll', handleScroll, scrollOptions);

      scrollBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }

    initThemeToggle() {
      const themeToggle = document.getElementById('theme-toggle');
      if (!themeToggle) return;

      // Проверяем сохраненную тему
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
      this.updateThemeIcon(savedTheme);

      themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
      });
    }

    updateThemeIcon(theme) {
      const themeToggle = document.getElementById('theme-toggle');
      if (!themeToggle) return;

      const icon = themeToggle.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    }

    initScrollProgress() {
      const scrollProgress = document.getElementById('scroll-progress');
      const scrollProgressBar = document.getElementById('scroll-progress-bar');

      if (!scrollProgress || !scrollProgressBar) return;

      // Оптимизируем scroll событие с throttle для плавности
      const updateProgress = Utils.throttle(() => {
        const windowHeight =
          document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        scrollProgressBar.style.width = `${Math.min(100, Math.max(0, scrolled))}%`;
      }, 16); // ~60fps

      const scrollOptions = Utils.supports('passiveEvents')
        ? { passive: true }
        : false;
      window.addEventListener('scroll', updateProgress, scrollOptions);
    }

    createScrollToTopBtn() {
      const btn = document.createElement('button');
      btn.className = 'scroll-to-top';
      btn.innerHTML = '↑';
      btn.setAttribute('aria-label', 'Scroll to top');

      // Добавляем стили
      btn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border: none;
                border-radius: 50%;
                background: var(--primary-color, #007bff);
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 1000;
            `;

      // Добавляем CSS для видимости
      if (!document.querySelector('#scroll-to-top-styles')) {
        const styles = document.createElement('style');
        styles.id = 'scroll-to-top-styles';
        styles.textContent = `
                    .scroll-to-top.visible {
                        opacity: 1;
                        visibility: visible;
                    }
                    .scroll-to-top:hover {
                        transform: scale(1.1);
                    }
                `;
        document.head.appendChild(styles);
      }

      document.body.appendChild(btn);
      return btn;
    }

    setupActiveNavigation() {
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.navbar a[href^="#"]');

      if (!sections.length || !navLinks.length) return;

      // Оптимизируем IntersectionObserver для лучшей производительности
      const observerOptions = {
        rootMargin: '-20% 0px -80% 0px',
        threshold: [0, 0.1, 0.5, 1] // Несколько порогов для более точного определения
      };

      let activeSection = null;

      const observer = new IntersectionObserver(
        entries => {
          // Находим секцию с наибольшей видимостью
          let maxRatio = 0;
          let mostVisible = null;

          entries.forEach(entry => {
            if (entry.intersectionRatio > maxRatio) {
              maxRatio = entry.intersectionRatio;
              mostVisible = entry.target;
            }
          });

          // Обновляем активную ссылку только если изменилась секция
          if (mostVisible && mostVisible.id !== activeSection) {
            activeSection = mostVisible.id;

            // Убираем активный класс со всех ссылок
            navLinks.forEach(link => link.classList.remove('active'));

            // Добавляем активный класс к текущей ссылке
            const activeLink = document.querySelector(
              `.navbar a[href="#${activeSection}"]`
            );
            if (activeLink) {
              activeLink.classList.add('active');
            }
          }
        },
        observerOptions
      );

      sections.forEach(section => observer.observe(section));
    }

    setupSimpleParallax() {
      const parallaxElements = document.querySelectorAll('[data-parallax]');

      if (!parallaxElements.length) return;

      // Оптимизируем parallax с requestAnimationFrame для плавности
      let ticking = false;
      const updateParallax = () => {
        const scrolled = window.pageYOffset || document.documentElement.scrollTop;

        parallaxElements.forEach(element => {
          const speed = parseFloat(element.dataset.parallax) || 0.5;
          const yPos = -(scrolled * speed);
          element.style.transform = `translateY(${yPos}px)`;
        });

        ticking = false;
      };

      const handleScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(updateParallax);
          ticking = true;
        }
      };

      const scrollOptions = Utils.supports('passiveEvents')
        ? { passive: true }
        : false;
      window.addEventListener('scroll', handleScroll, scrollOptions);
    }

    initAnimations() {
      // Простые анимации появления
      const animateElements = document.querySelectorAll('[data-animate]');

      if (!animateElements.length) return;

      const animationObserver = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const element = entry.target;
              const animation = element.dataset.animate || 'fadeInUp';

              element.classList.add('animate', animation);
              animationObserver.unobserve(element);
            }
          });
        },
        {
          rootMargin: '0px 0px -10% 0px',
          threshold: 0.1
        }
      );

      animateElements.forEach(element => {
        animationObserver.observe(element);
      });

      // Добавляем базовые CSS анимации
      this.addAnimationStyles();
    }

    addAnimationStyles() {
      if (document.querySelector('#portfolio-animations')) return;

      const styles = document.createElement('style');
      styles.id = 'portfolio-animations';
      styles.textContent = `
                [data-animate] {
                    opacity: 0;
                    transition: all 0.8s ease;
                }

                .animate.fadeInUp {
                    opacity: 1;
                    transform: translateY(0);
                }

                [data-animate="fadeInUp"] {
                    transform: translateY(30px);
                }

                .animate.fadeIn {
                    opacity: 1;
                }

                .animate.slideInLeft {
                    opacity: 1;
                    transform: translateX(0);
                }

                [data-animate="slideInLeft"] {
                    transform: translateX(-30px);
                }

                .animate.slideInRight {
                    opacity: 1;
                    transform: translateX(0);
                }

                [data-animate="slideInRight"] {
                    transform: translateX(30px);
                }

                .animate.scaleIn {
                    opacity: 1;
                    transform: scale(1);
                }

                [data-animate="scaleIn"] {
                    transform: scale(0.9);
                }
            `;
      document.head.appendChild(styles);
    }

    completeInit() {
      const loadTime = performance.now() - this.loadStartTime;

      this.isInitialized = true;

      console.log(`✅ Portfolio App initialized in ${Math.round(loadTime)}ms`);

      // Скрываем прелоадер
      this.hidePreloader();

      // Выполняем отложенные коллбеки
      this.readyCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Ready callback error:', error);
        }
      });

      // Отправляем событие готовности
      document.dispatchEvent(
        new CustomEvent('portfolioReady', {
          detail: {
            loadTime,
            modules: Array.from(this.modules.keys())
          }
        })
      );
    }

    hidePreloader() {
      const preloader = document.getElementById('preloader');
      if (!preloader) return;

      // Обновляем прогресс-бар до 100%
      const progressBar = preloader.querySelector('#preloader-bar');
      if (progressBar) {
        progressBar.style.width = '100%';
      }

      // Обновляем текст
      const preloaderText = preloader.querySelector('#preloader-text');
      if (preloaderText) {
        preloaderText.textContent = 'Готово!';
      }

      // Скрываем прелоадер с анимацией
      setTimeout(() => {
        preloader.style.transition = 'opacity 0.5s ease-out';
        preloader.style.opacity = '0';

        setTimeout(() => {
          preloader.style.display = 'none';
          document.body.classList.add('preloader-hidden');
        }, 500);
      }, 300);
    }

    initFallbackMode() {
      console.warn('🔄 Running in fallback mode');

      // Минимальная функциональность без модулей
      this.initBasicFeatures();

      // Простые интерактивные элементы
      this.setupInteractions();

      // Скрываем прелоадер даже в fallback режиме
      this.hidePreloader();

      this.isInitialized = true;
    }

    // Публичные методы
    ready(callback) {
      if (this.isInitialized) {
        callback();
      } else {
        this.readyCallbacks.push(callback);
      }
    }

    getModule(name) {
      return this.modules.get(name);
    }
  }

  // Инициализация приложения
  const app = new PortfolioApp();

  // Экспорт для глобального доступа
  window.PortfolioApp = app;
})();
