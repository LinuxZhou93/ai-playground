@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
  py -3 xmpgame_kiosk.py uninstall
  goto done
)
where python >nul 2>nul
if not errorlevel 1 (
  python xmpgame_kiosk.py uninstall
  goto done
)
echo Python 3 was not found.
:done
echo.
pause
