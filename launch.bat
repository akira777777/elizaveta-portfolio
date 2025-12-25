@echo off
echo ===================================
echo   ЗАПУСК ПОРТФОЛИО ЕЛИЗАВЕТЫ
echo ===================================
echo.
cd /d "%~dp0"
echo Пробую запустить локальный сервер...
echo.

REM Пробуем Node.js serve
where node >nul 2>&1
if %errorlevel%==0 (
    echo ✓ Найден Node.js, запускаю сервер...
    echo Сайт будет доступен: http://localhost:8000
    npx serve@latest . --single --listen 8000
    goto end
)

REM Пробуем Python
where python >nul 2>&1
if %errorlevel%==0 (
    echo ✓ Найден Python, запускаю сервер...
    echo Сайт будет доступен: http://localhost:8000
    python -m http.server 8000
    goto end
)

REM Если ничего не найдено, открываем файл напрямую
echo ! Не найден ни Node.js, ни Python
echo Открываю файл напрямую в браузере...
start index.html

:end
echo.
echo Нажмите любую клавишу для выхода...
pause >nul