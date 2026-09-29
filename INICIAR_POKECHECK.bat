@echo off
setlocal
cd /d "%~dp0"
title PokeCheck v17

echo ========================================
echo          PokeCheck v17 - React TSX
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js no esta instalado o no esta en PATH.
  echo Instala Node.js y vuelve a ejecutar este archivo.
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm no esta disponible en PATH.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Primera ejecucion: instalando dependencias...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo ERROR: No fue posible instalar las dependencias.
    echo Revisa tu conexion a internet y vuelve a intentarlo.
    pause
    exit /b 1
  )
)

echo.
echo Iniciando PokeCheck...
echo El navegador se abrira automaticamente cuando Vite este listo.
echo Para detener el servidor usa Ctrl+C en esta ventana.
echo.
call npm.cmd run dev

endlocal
