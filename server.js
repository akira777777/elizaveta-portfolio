/**
 * Express сервер для продакшена
 * Раздает статические файлы из папки dist после сборки
 */

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DIST_DIR = join(__dirname, 'dist');

// Проверяем наличие папки dist
import { existsSync } from 'fs';
if (!existsSync(DIST_DIR)) {
  console.warn('⚠️  Папка dist не найдена. Запустите "npm run build" перед запуском сервера.');
  console.warn('⚠️  Сервер будет раздавать файлы из корневой папки (режим разработки).');
}

// Раздаем статические файлы из dist (если есть) или из корня
const staticDir = existsSync(DIST_DIR) ? DIST_DIR : __dirname;
app.use(express.static(staticDir, {
  maxAge: '1y', // Кеширование на год для статических файлов
  etag: true,
  lastModified: true
}));

// SPA fallback - все маршруты ведут на index.html
app.get('*', (req, res) => {
  const indexPath = join(staticDir, 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Страница не найдена. Запустите "npm run build" для создания production сборки.');
  }
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).send('Внутренняя ошибка сервера');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📁 Раздаются файлы из: ${staticDir}`);
  console.log('\n💡 Для production сборки выполните: npm run build');
  console.log('💡 Для разработки используйте: npm run dev\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM получен, завершаем работу сервера...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT получен, завершаем работу сервера...');
  process.exit(0);
});
