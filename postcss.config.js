export default {
  plugins: {
    autoprefixer: {
      // Используем конфигурацию из .browserslistrc
      // Автоматически исключаем Internet Explorer
      remove: true, // Удаляем устаревшие префиксы
      cascade: false // Более читаемый вывод
    }
  }
};
