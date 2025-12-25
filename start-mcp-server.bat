@echo off
echo Starting MCP Filesystem Server...

REM Start the MCP Filesystem Server with the current directory as the allowed directory
mcp-server-filesystem "%CD%"

pause
