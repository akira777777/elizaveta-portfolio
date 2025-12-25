/**
 * Gallery Module - Browser Compatible Version (Optimized)
 * Галерея портфолио для старых браузеров (без ES6 imports)
 */

;(function () {
  'use strict'

  class PortfolioGallery {
    constructor() {
      this.items = []
      this.filters = []
      this.activeFilter = 'all'
      this.isInitialized = false
      // Кеширование DOM элементов
      this.cachedElements = {
        filterButtons: null,
        portfolioItems: null,
        videoItems: null,
        portfolioContainer: null
      }
    }

    async init() {
      if (this.isInitialized) return

      try {
        console.log('🖼️ Initializing Portfolio Gallery...')

        // Кешируем DOM элементы
        this.cacheElements()

        // Инициализируем фильтры (с делегированием событий)
        this.initFilters()

        // Инициализируем ленивую загрузку изображений
        this.initLazyLoading()

        // Инициализируем модальные окна для изображений
        this.initLightbox()

        // Инициализируем видео
        this.initVideo()

        this.isInitialized = true
        console.log('✅ Portfolio Gallery initialized')

        // Уведомляем о загрузке модуля
        if (typeof globalThis.moduleLoadProgress === 'function') {
          globalThis.moduleLoadProgress('gallery')
        }
      } catch (error) {
        console.error('❌ Gallery initialization error:', error)
      }
    }

    cacheElements() {
      this.cachedElements.filterButtons =
        document.querySelectorAll('.filter-btn')
      this.cachedElements.portfolioItems =
        document.querySelectorAll('.portfolio-item')
      this.cachedElements.videoItems = document.querySelectorAll(
        '.video-portfolio-item'
      )
      this.cachedElements.portfolioContainer = document.querySelector(
        '#portfolio, .portfolio-masonry'
      )
    }

    initFilters() {
      const filterButtons = this.cachedElements.filterButtons
      const portfolioItems = this.cachedElements.portfolioItems

      if (
        !filterButtons ||
        !filterButtons.length ||
        !portfolioItems ||
        !portfolioItems.length
      ) {
        return
      }

      // Используем делегирование событий вместо множественных listeners
      const filterContainer =
        filterButtons[0] && filterButtons[0].closest('.portfolio-filters')
      if (filterContainer) {
        filterContainer.addEventListener('click', e => {
          const button = e.target.closest('.filter-btn')
          if (!button) return

          e.preventDefault()

          // Убираем активный класс со всех кнопок
          filterButtons.forEach(btn => btn.classList.remove('active'))
          // Добавляем активный класс к нажатой кнопке
          button.classList.add('active')

          // Получаем фильтр
          const filter = button.dataset.filter || 'all'
          this.activeFilter = filter

          // Фильтруем элементы
          this.filterItems(filter, portfolioItems)
        })
      } else {
        // Fallback для старых браузеров
        filterButtons.forEach(button => {
          button.addEventListener('click', e => {
            e.preventDefault()
            filterButtons.forEach(btn => btn.classList.remove('active'))
            button.classList.add('active')
            const filter = button.dataset.filter || 'all'
            this.activeFilter = filter
            this.filterItems(filter, portfolioItems)
          })
        })
      }
    }

    filterItems(filter, items) {
      // Оптимизация: используем requestAnimationFrame для плавной анимации
      const showItems = []
      const hideItems = []

      items.forEach(item => {
        const categories = item.dataset.category || ''
        const categoryArray = categories.split(' ').filter(Boolean)

        if (filter === 'all' || categoryArray.includes(filter)) {
          showItems.push(item)
        } else {
          hideItems.push(item)
        }
      })

      // Скрываем элементы
      hideItems.forEach(item => {
        item.style.transition = 'opacity 0.3s ease'
        item.style.opacity = '0'
      })

      // Показываем элементы
      requestAnimationFrame(() => {
        showItems.forEach(item => {
          item.style.display = ''
          item.style.opacity = '0'
          requestAnimationFrame(() => {
            item.style.transition = 'opacity 0.3s ease'
            item.style.opacity = '1'
          })
        })

        // Удаляем display: none после анимации
        setTimeout(() => {
          hideItems.forEach(item => {
            item.style.display = 'none'
          })
        }, 300)
      })
    }

    initLazyLoading() {
      // Используем Intersection Observer для ленивой загрузки
      if ('IntersectionObserver' in globalThis) {
        // Оптимизированные настройки для лучшей производительности
        const imageObserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const img = entry.target
                const src = img.dataset.src
                const srcset = img.dataset.srcset

                // Загружаем изображение через новый Image объект для предзагрузки
                if (src) {
                  const imageLoader = new Image()
                  imageLoader.onload = () => {
                    img.src = src
                    img.removeAttribute('data-src')
                    img.classList.add('loaded')
                  }
                  imageLoader.onerror = () => {
                    console.warn('Failed to load image:', src)
                    img.classList.add('error')
                    img.classList.add('loaded') // Убираем placeholder
                    // Добавляем SVG placeholder
                    const placeholder = `data:image/svg+xml,${encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
                        <rect width="400" height="300" fill="#f0f0f0"/>
                        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16" fill="#999">
                          Image not available
                        </text>
                      </svg>
                    `)}`
                    img.src = placeholder
                  }
                  imageLoader.src = src
                } else {
                  img.classList.add('loaded')
                }

                if (srcset) {
                  img.srcset = srcset
                  img.removeAttribute('data-srcset')
                }

                // Прекращаем наблюдение после загрузки
                observer.unobserve(img)
              }
            })
          },
          {
            rootMargin: '50px',
            threshold: 0.01 // Загружаем как только элемент появляется в viewport
          }
        )

        // Наблюдаем за изображениями с data-src (только в портфолио для оптимизации)
        const portfolioImages = document.querySelectorAll(
          '.portfolio-item img[data-src]'
        )
        portfolioImages.forEach(img => {
          // Добавляем placeholder для лучшего UX
          if (!img.style.backgroundColor) {
            img.style.backgroundColor = '#f0f0f0'
            img.style.minHeight = '200px'
          }
          imageObserver.observe(img)
        })

        console.log(`📷 Observing ${portfolioImages.length} lazy images`)
      } else {
        // Fallback для старых браузеров
        console.warn(
          '⚠️ IntersectionObserver not supported, loading all images'
        )
        const portfolioImages = document.querySelectorAll(
          '.portfolio-item img[data-src]'
        )
        portfolioImages.forEach(img => {
          img.src = img.dataset.src
          img.removeAttribute('data-src')
          img.classList.add('loaded')
        })
      }

      // Добавляем обработчик для всех lazy-loaded изображений (включая те, что используют обычный src)
      const allLazyImages = document.querySelectorAll('img[loading="lazy"]')
      allLazyImages.forEach(img => {
        if (img.complete) {
          // Изображение уже загружено
          img.classList.add('loaded')
        } else {
          // Ждем загрузки
          img.addEventListener('load', () => {
            img.classList.add('loaded')
          })
          img.addEventListener('error', () => {
            img.classList.add('error')
          })
        }
      })
    }

    initLightbox() {
      const portfolioItems = this.cachedElements.portfolioItems
      const portfolioContainer = this.cachedElements.portfolioContainer

      if (!portfolioItems || !portfolioItems.length) {
        return
      }

      // Используем делегирование событий для оптимизации
      if (portfolioContainer) {
        portfolioContainer.addEventListener('click', e => {
          // Проверяем, не кликнули ли на кнопку, ссылку или видео-элемент
          if (
            e.target.closest(
              'a, button, .play-button, .video-overlay, video, .video-portfolio-item'
            )
          )
            return

          const item = e.target.closest('.portfolio-item')
          if (!item) return

          // Пропускаем видео-элементы
          if (item.classList.contains('video-portfolio-item')) return

          const image = item.querySelector('img')
          if (!image) return

          const imgSrc = image.src || image.dataset.src
          if (imgSrc) {
            this.openLightbox(imgSrc, image.alt || 'Portfolio image')
          }
        })
      } else {
        // Fallback: добавляем listeners к каждому элементу
        portfolioItems.forEach(item => {
          const image = item.querySelector('img')
          if (!image) return

          item.addEventListener('click', e => {
            if (e.target.closest('a, button')) return
            const imgSrc = image.src || image.dataset.src
            if (imgSrc) {
              this.openLightbox(imgSrc, image.alt || 'Portfolio image')
            }
          })
        })
      }
    }

    openLightbox(src, alt) {
      // Получаем все изображения для навигации
      const allImages = Array.from(
        document.querySelectorAll('.portfolio-item img')
      )
        .map(img => ({
          src: img.src || img.dataset.src,
          alt: img.alt || 'Portfolio image'
        }))
        .filter(img => img.src)

      const currentIndex = allImages.findIndex(img => img.src === src)
      let imageIndex = currentIndex >= 0 ? currentIndex : 0

      // Создаем модальное окно
      const lightbox = document.createElement('div')
      lightbox.className = 'lightbox'
      lightbox.setAttribute('role', 'dialog')
      lightbox.setAttribute('aria-label', 'Image lightbox')
      lightbox.setAttribute('aria-modal', 'true')
      lightbox.innerHTML = `
        <div class="lightbox-overlay" aria-label="Close lightbox"></div>
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="Close lightbox" tabindex="0">&times;</button>
          ${
            allImages.length > 1
              ? `
            <button class="lightbox-nav lightbox-prev" aria-label="Previous image" tabindex="0">‹</button>
            <button class="lightbox-nav lightbox-next" aria-label="Next image" tabindex="0">›</button>
          `
              : ''
          }
          <img src="${src}" alt="${alt}" class="lightbox-image" loading="eager">
          ${
            allImages.length > 1
              ? `
            <div class="lightbox-info">
              <span class="lightbox-counter">${imageIndex + 1} / ${allImages.length}</span>
              <span class="lightbox-caption">${alt}</span>
            </div>
          `
              : ''
          }
        </div>
      `

      // Добавляем стили, если их еще нет
      if (!document.getElementById('lightbox-styles')) {
        const styles = document.createElement('style')
        styles.id = 'lightbox-styles'
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
            background: rgba(0, 0, 0, 0.95);
            animation: fadeIn 0.3s ease;
            backdrop-filter: blur(10px);
          }
          .lightbox-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
          }
          .lightbox-content {
            position: relative;
            max-width: 95%;
            max-height: 95%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .lightbox-image {
            max-width: 100%;
            max-height: 90vh;
            object-fit: contain;
            border-radius: 4px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            animation: zoomIn 0.3s ease;
          }
          .lightbox-close {
            position: absolute;
            top: -50px;
            right: 0;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            color: white;
            font-size: 32px;
            cursor: pointer;
            padding: 0;
            width: 44px;
            height: 44px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            z-index: 10001;
          }
          .lightbox-close:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.1);
          }
          .lightbox-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            color: white;
            font-size: 36px;
            cursor: pointer;
            padding: 0;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            z-index: 10001;
          }
          .lightbox-nav:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-50%) scale(1.1);
          }
          .lightbox-prev {
            left: -70px;
          }
          .lightbox-next {
            right: -70px;
          }
          .lightbox-info {
            position: absolute;
            bottom: -50px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            color: white;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .lightbox-counter {
            font-size: 14px;
            opacity: 0.8;
          }
          .lightbox-caption {
            font-size: 16px;
            font-weight: 500;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes zoomIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          @media (max-width: 768px) {
            .lightbox-prev {
              left: 10px;
            }
            .lightbox-next {
              right: 10px;
            }
            .lightbox-close {
              top: 10px;
              right: 10px;
            }
            .lightbox-info {
              bottom: 10px;
            }
          }
        `
        document.head.appendChild(styles)
      }

      document.body.appendChild(lightbox)
      document.body.style.overflow = 'hidden'

      // Фокус на lightbox для доступности
      lightbox.focus()

      const imageElement = lightbox.querySelector('.lightbox-image')
      const prevButton = lightbox.querySelector('.lightbox-prev')
      const nextButton = lightbox.querySelector('.lightbox-next')
      const counter = lightbox.querySelector('.lightbox-counter')
      const caption = lightbox.querySelector('.lightbox-caption')

      // Функция обновления изображения
      const updateImage = index => {
        if (index < 0 || index >= allImages.length) return
        imageIndex = index
        const img = allImages[imageIndex]

        // Плавная смена изображения
        imageElement.style.opacity = '0'
        setTimeout(() => {
          imageElement.src = img.src
          imageElement.alt = img.alt
          imageElement.style.opacity = '1'

          if (counter) {
            counter.textContent = `${imageIndex + 1} / ${allImages.length}`
          }
          if (caption) {
            caption.textContent = img.alt
          }

          // Показываем/скрываем кнопки навигации
          if (allImages.length > 1) {
            if (prevButton) {
              prevButton.style.display = imageIndex === 0 ? 'none' : 'flex'
            }
            if (nextButton) {
              nextButton.style.display =
                imageIndex === allImages.length - 1 ? 'none' : 'flex'
            }
          }
        }, 150)
      }

      // Навигация
      const showPrev = () => {
        if (imageIndex > 0) {
          updateImage(imageIndex - 1)
        }
      }

      const showNext = () => {
        if (imageIndex < allImages.length - 1) {
          updateImage(imageIndex + 1)
        }
      }

      // Закрытие lightbox
      const close = () => {
        lightbox.style.animation = 'fadeOut 0.3s ease'
        setTimeout(() => {
          if (lightbox.parentElement) {
            lightbox.parentElement.removeChild(lightbox)
          }
          document.body.style.overflow = ''
        }, 300)
      }

      // Обработчики событий
      lightbox
        .querySelector('.lightbox-overlay')
        .addEventListener('click', close)
      lightbox.querySelector('.lightbox-close').addEventListener('click', close)

      if (prevButton) {
        prevButton.addEventListener('click', showPrev)
      }
      if (nextButton) {
        nextButton.addEventListener('click', showNext)
      }

      // Клавиатурная навигация
      const handleKeyDown = e => {
        switch (e.key) {
          case 'Escape':
            close()
            document.removeEventListener('keydown', handleKeyDown)
            break
          case 'ArrowLeft':
            if (allImages.length > 1) {
              e.preventDefault()
              showPrev()
            }
            break
          case 'ArrowRight':
            if (allImages.length > 1) {
              e.preventDefault()
              showNext()
            }
            break
        }
      }

      document.addEventListener('keydown', handleKeyDown)

      // Инициализация навигации
      if (allImages.length > 1) {
        updateImage(imageIndex)
      }

      // Обработка ошибок загрузки изображения
      imageElement.addEventListener('error', () => {
        console.warn('Failed to load lightbox image:', src)
        imageElement.style.backgroundColor = '#333'
        imageElement.alt = 'Image failed to load'
      })
    }

    initVideo() {
      const videoItems = this.cachedElements.videoItems
      const portfolioContainer = this.cachedElements.portfolioContainer

      if (!videoItems || !videoItems.length) {
        return
      }

      // Используем делегирование событий
      if (portfolioContainer) {
        portfolioContainer.addEventListener('click', e => {
          // Проверяем, что клик был на видео-элемент или кнопку воспроизведения
          const playButton = e.target.closest('.play-button')
          const item = e.target.closest('.video-portfolio-item')

          if (!item) return

          const video = item.querySelector('video')
          const itemPlayButton = item.querySelector('.play-button')

          if (!video || !itemPlayButton) return

          // Если клик был на кнопку воспроизведения или видео
          if (playButton || e.target.closest('video')) {
            e.preventDefault()
            e.stopPropagation()

            if (video.paused) {
              video.play().catch(err => console.warn('Video play failed:', err))
              itemPlayButton.style.display = 'none'
              item.classList.add('playing')
            } else {
              video.pause()
              itemPlayButton.style.display = 'flex'
              item.classList.remove('playing')
            }
          }
        })

        // Обработка окончания видео
        videoItems.forEach(item => {
          const video = item.querySelector('video')
          if (!video) return

          video.addEventListener('ended', () => {
            const playButton = item.querySelector('.play-button')
            if (playButton) {
              playButton.style.display = 'flex'
            }
            item.classList.remove('playing')
          })
        })
      } else {
        // Fallback для старых браузеров
        videoItems.forEach(item => {
          const video = item.querySelector('video')
          const playButton = item.querySelector('.play-button')

          if (!video || !playButton) return

          playButton.addEventListener('click', e => {
            e.preventDefault()
            e.stopPropagation()

            if (video.paused) {
              video.play().catch(err => console.warn('Video play failed:', err))
              playButton.style.display = 'none'
              item.classList.add('playing')
            } else {
              video.pause()
              playButton.style.display = 'flex'
              item.classList.remove('playing')
            }
          })

          video.addEventListener('click', () => {
            if (!video.paused) {
              video.pause()
              playButton.style.display = 'flex'
              item.classList.remove('playing')
            }
          })

          video.addEventListener('ended', () => {
            playButton.style.display = 'flex'
            item.classList.remove('playing')
          })
        })
      }
    }
  }

  // Экспортируем класс в глобальную область
  globalThis.PortfolioGallery = PortfolioGallery
})()
