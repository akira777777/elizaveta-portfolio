@echo off
echo Stopping MCP Filesystem Server...
echo.

REM Try to stop mcp-server-filesystem.exe
taskkill /F /IM mcp-server-filesystem.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] MCP Filesystem Server executable stopped successfully.
    goto :success
)

REM Try to stop node.exe processes running mcp-server
echo Checking for Node.js processes running MCP server...
set FOUND=0

for /f "tokens=2" %%i in ('tasklist ^| findstr "node.exe"') do (
    set FOUND=1
    echo Stopping Node.js process with PID: %%i
    taskkill /F /PID %%i 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Node.js process %%i stopped successfully.
    )
)

if %FOUND% EQU 1 (
    goto :success
)

echo [INFO] No running MCP Filesystem Server processes found.
goto :end

:success
echo.
echo [SUCCESS] MCP Filesystem Server stopped successfully.
goto :end

:end
echo.
pause
