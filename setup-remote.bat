@echo off
echo Setting up remote repository and pushing changes...

REM Create a new remote repository on GitHub
echo Please create a new repository on GitHub and enter the repository URL:
set /p REPO_URL=Repository URL: 

REM Add the remote repository
git remote add origin %REPO_URL%

REM Push the branch to GitHub
git push -u origin blackboxai/install-mcp-filesystem-server

REM Provide instructions for creating a pull request
echo.
echo Changes have been pushed to GitHub.
echo.
echo To create a pull request:
echo 1. Go to %REPO_URL%
echo 2. Click on "Compare & pull request"
echo 3. Set the title to "Install MCP Filesystem Server"
echo 4. Add a description of the changes
echo 5. Click "Create pull request"
echo.
echo Press any key to exit...
pause > nul
