import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Отключаем sourcemap в production для уменьшения размера
    minify: 'terser',

    // Улучшенная оптимизация размера
    modulePreload: {
      polyfill: false // Современные браузеры поддерживают нативно
    },

    // Улучшенный code splitting
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        // Автоматическое разделение на chunks по размеру
        manualChunks(id) {
          // Внешние библиотеки в отдельный chunk
          if (id.includes('node_modules')) {
            if (
              id.includes('intersection-observer') ||
              id.includes('core-js')
            ) {
              return 'vendor-polyfills';
            }
            return 'vendor';
          }

          // Модули по функциональности
          if (
            id.includes('modules/core.js') ||
            id.includes('modules/performance.js')
          ) {
            return 'core';
          }
          if (
            id.includes('modules/animations.js') ||
            id.includes('modules/gallery.js')
          ) {
            return 'ui';
          }
          if (id.includes('modules/forms.js')) {
            return 'forms';
          }
          if (id.includes('modules/media') || id.includes('media/')) {
            return 'media';
          }
        },

        // Оптимальное именование файлов с короткими hash
        chunkFileNames: 'js/[name]-[hash:8].js',
        entryFileNames: 'js/[name]-[hash:8].js',
        assetFileNames: assetInfo => {
          const name = assetInfo.fileName || '';
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(name)) {
            return 'images/[name]-[hash:8].[ext]';
          }
          if (/\.(woff|woff2|eot|ttf|otf)$/i.test(name)) {
            return 'fonts/[name]-[hash:8].[ext]';
          }
          if (/\.css$/i.test(name)) {
            return 'css/[name]-[hash:8].[ext]';
          }
          return 'assets/[name]-[hash:8].[ext]';
        },

        // Оптимизация для лучшего tree-shaking
        exports: 'named'
      }
    },

    // Улучшенная оптимизация terser
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2, // Дополнительный проход для лучшей оптимизации
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true
      },
      format: {
        comments: false,
        ecma: 2020
      },
      mangle: {
        safari10: true
      }
    },

    // CSS оптимизация
    cssCodeSplit: true,
    cssMinify: true, // Используем встроенную минификацию

    // Размер chunk предупреждений
    chunkSizeWarningLimit: 500,

    // Улучшенная оптимизация assets
    assetsInlineLimit: 4096, // Инлайним маленькие файлы (< 4KB)
    reportCompressedSize: false // Ускоряет сборку
  },

  // CSS preprocessing
  css: {
    preprocessorOptions: {
      css: {
        charset: false
      }
    },
    devSourcemap: true
  },

  // Оптимизация для разработки
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true,

    // HMR оптимизация
    hmr: {
      overlay: true
    }
  },

  // Предварительный просмотр
  preview: {
    port: 4173,
    host: true,
    cors: true
  },

  plugins: [
    // Поддержка современных браузеров (исключаем IE полностью)
    legacy({
      targets: [
        'last 2 versions',
        '> 1%',
        'Chrome >= 88',
        'Firefox >= 85',
        'Safari >= 14',
        'Edge >= 88',
        'not IE 11',
        'not IE_Mob 11',
        'not dead',
        'supports es6-module'
      ],
      modernPolyfills: true,
      renderLegacyChunks: false // Отключаем legacy chunks для IE
    })
    // PWA конфигурация (временно отключена для решения проблем совместимости)
    // VitePWA({...})
  ],

  // Улучшенные оптимизации зависимостей
  optimizeDeps: {
    include: ['intersection-observer', 'core-js'],
    exclude: ['@vite/client', '@vite/env'],
    esbuildOptions: {
      target: 'esnext'
    }
  },

  // Оптимизация для production
  esbuild: {
    legalComments: 'none', // Удаляем комментарии
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
  },

  // Определение переменных окружения
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
});
