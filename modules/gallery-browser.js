/**
 * Gallery Module - Browser Compatible Version
 * Галерея портфолио для старых браузеров (без ES6 imports)
 */

(function () {
  'use strict';

  class PortfolioGallery {
    constructor() {
      this.items = [];
      this.filters = [];
      this.activeFilter = 'all';
      this.isInitialized = false;
    }

    async init() {
      if (this.isInitialized) return;

      try {
        console.log('🖼️ Initializing Portfolio Gallery...');

        // Инициализируем фильтры
        this.initFilters();

        // Инициализируем ленивую загрузку изображений
        this.initLazyLoading();

        // Инициализируем модальные окна для изображений
        this.initLightbox();

        // Инициализируем видео
        this.initVideo();

        this.isInitialized = true;
        console.log('✅ Portfolio Gallery initialized');

        // Уведомляем о загрузке модуля
        if (typeof globalThis.moduleLoadProgress === 'function') {
          globalThis.moduleLoadProgress('gallery');
        }
      } catch (error) {
        console.error('❌ Gallery initialization error:', error);
      }
    }

    initFilters() {
      const filterButtons = document.querySelectorAll('.filter-btn');
      const portfolioItems = document.querySelectorAll('.portfolio-item');

      if (!filterButtons.length || !portfolioItems.length) {
        return;
      }

      filterButtons.forEach(button => {
        button.addEventListener('click', e => {
          e.preventDefault();

          // Убираем активный класс со всех кнопок
          filterButtons.forEach(btn => btn.classList.remove('active'));
          // Добавляем активный класс к нажатой кнопке
          button.classList.add('active');

          // Получаем фильтр
          const filter = button.dataset.filter || 'all';
          this.activeFilter = filter;

          // Фильтруем элементы
          this.filterItems(filter, portfolioItems);
        });
      });
    }

    filterItems(filter, items) {
      items.forEach(item => {
        const categories = item.dataset.category || '';
        const categoryArray = categories.split(' ').filter(Boolean);

        if (filter === 'all' || categoryArray.includes(filter)) {
          item.style.display = '';
          item.style.opacity = '0';
          setTimeout(() => {
            item.style.transition = 'opacity 0.3s ease';
            item.style.opacity = '1';
          }, 10);
        } else {
          item.style.transition = 'opacity 0.3s ease';
          item.style.opacity = '0';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    }

    initLazyLoading() {
      // Используем Intersection Observer для ленивой загрузки
      if ('IntersectionObserver' in globalThis) {
        const imageObserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;
                const srcset = img.dataset.srcset;

                if (src) {
                  img.src = src;
                  delete img.dataset.src;
                }

                if (srcset) {
                  img.srcset = srcset;
                  delete img.dataset.srcset;
                }

                img.classList.add('loaded');
                observer.unobserve(img);
              }
            });
          },
          {
            rootMargin: '50px'
          }
        );

        // Наблюдаем за всеми изображениями с data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
          imageObserver.observe(img);
        });
      } else {
        // Fallback для старых браузеров
        document.querySelectorAll('img[data-src]').forEach(img => {
          img.src = img.dataset.src;
          delete img.dataset.src;
        });
      }
    }

    initLightbox() {
      const portfolioItems = document.querySelectorAll('.portfolio-item');

      portfolioItems.forEach(item => {
        const image = item.querySelector('img');
        if (!image) return;

        item.addEventListener('click', e => {
          // Проверяем, не кликнули ли на кнопку или ссылку
          if (e.target.closest('a, button')) return;

          const imgSrc = image.src || image.getAttribute('src');
          if (imgSrc) {
            this.openLightbox(imgSrc, image.alt || 'Portfolio image');
          }
        });
      });
    }

    openLightbox(src, alt) {
      // Создаем модальное окно
      const lightbox = document.createElement('div');
      lightbox.className = 'lightbox';
      lightbox.innerHTML = `
        <div class="lightbox-overlay"></div>
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="Close">&times;</button>
          <img src="${src}" alt="${alt}" class="lightbox-image">
        </div>
      `;

      // Добавляем стили, если их еще нет
      if (!document.getElementById('lightbox-styles')) {
        const styles = document.createElement('style');
        styles.id = 'lightbox-styles';
        styles.textContent = `
          .lightbox {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.9);
            animation: fadeIn 0.3s ease;
          }
          .lightbox-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
          .lightbox-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
          }
          .lightbox-image {
            max-width: 100%;
            max-height: 90vh;
            object-fit: contain;
          }
          .lightbox-close {
            position: absolute;
            top: -40px;
            right: 0;
            background: none;
            border: none;
            color: white;
            font-size: 40px;
            cursor: pointer;
            padding: 0;
            width: 40px;
            height: 40px;
            line-height: 1;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `;
        document.head.appendChild(styles);
      }

      document.body.appendChild(lightbox);
      document.body.style.overflow = 'hidden';

      // Закрытие по клику на overlay или кнопку
      const close = () => {
        lightbox.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
          document.body.removeChild(lightbox);
          document.body.style.overflow = '';
        }, 300);
      };

      lightbox
        .querySelector('.lightbox-overlay')
        .addEventListener('click', close);
      lightbox.querySelector('.lightbox-close').addEventListener('click', close);

      // Закрытие по Escape
      const handleEscape = e => {
        if (e.key === 'Escape') {
          close();
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);
    }

    initVideo() {
      const videoItems = document.querySelectorAll('.video-portfolio-item');

      videoItems.forEach(item => {
        const video = item.querySelector('video');
        const playButton = item.querySelector('.play-button');

        if (!video || !playButton) return;

        playButton.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();

          if (video.paused) {
            video.play();
            playButton.style.display = 'none';
            item.classList.add('playing');
          } else {
            video.pause();
            playButton.style.display = 'flex';
            item.classList.remove('playing');
          }
        });

        // Пауза при клике на видео
        video.addEventListener('click', () => {
          if (!video.paused) {
            video.pause();
            playButton.style.display = 'flex';
            item.classList.remove('playing');
          }
        });
      });
    }
  }

  // Экспортируем класс в глобальную область
  window.PortfolioGallery = PortfolioGallery;
})();
