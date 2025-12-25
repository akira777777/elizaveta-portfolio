@echo off
echo ========================================
echo LM Studio Connection Test
echo ========================================
echo.
echo This script will test your LM Studio configuration
echo and verify it's ready for Blackbox AI.
echo.
echo Press any key to start the test...
pause > nul

node test-lm-studio-connection.js

echo.
echo ========================================
echo Test Complete
echo ========================================
echo.
echo For detailed setup instructions, see:
echo   - lm-studio-setup-guide.md
echo   - blackbox-lm-studio-config.json
echo.
pause
