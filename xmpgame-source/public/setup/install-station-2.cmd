@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
  py -3 xmpgame_kiosk.py install --station 2 --launch-now
  goto done
)
where python >nul 2>nul
if not errorlevel 1 (
  python xmpgame_kiosk.py install --station 2 --launch-now
  goto done
)
echo Python 3 was not found. Please install Python or use install-xmpgame-autostart.ps1.
:done
echo.
echo Station 2 installation finished. Press any key to close.
pause >nul
