@echo off
setlocal
cd /d "%~dp0"
title Gubali High School Portal

echo ============================================
echo       GUBALI HIGH SCHOOL PORTAL
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js haijaonekana kwenye computer hii.
  echo.
  echo Install Node.js LTS, kisha fungua tena file hili.
  echo Baada ya installation, tumia: node -v
  echo.
  pause
  exit /b 1
)

if not exist .env (
  copy /y .env.example .env >nul
  echo .env imeundwa.
  echo Default login: authority / change-this-before-deployment
  echo BADILISHA password hiyo kabla ya kuweka website online.
  echo.
)

if not exist data mkdir data

echo Node.js imepatikana:
node -v
echo.
echo Starting server...
echo Website: http://localhost:3000
echo Authority: http://localhost:3000/admin.html
echo.
echo USIFUNGE dirisha hili wakati unatumia website.
echo Bonyeza CTRL+C kusimamisha server.
echo.
node server.js

echo.
echo Server imesimama. Error inaweza kuwa imeonyeshwa hapo juu.
pause
