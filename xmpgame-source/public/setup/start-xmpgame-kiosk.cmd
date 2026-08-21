@echo off
setlocal
set "STATION=%~1"
if "%STATION%"=="" set "STATION=1"

if "%STATION%"=="1" goto station_ok
if "%STATION%"=="2" goto station_ok
if "%STATION%"=="3" goto station_ok
if "%STATION%"=="4" goto station_ok
echo Station must be 1, 2, 3, or 4.
pause
exit /b 1

:station_ok
set "KIOSK_URL=https://www.zhouxiaomai.com/xmpgame/station/%STATION%?kiosk=1"
set "EDGE_PATH=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"

if exist "%EDGE_PATH%" goto launch
set "EDGE_PATH=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE_PATH%" goto launch
set "EDGE_PATH=%LocalAppData%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE_PATH%" goto launch

echo Microsoft Edge was not found on this computer.
pause
exit /b 1

:launch
start "" "%EDGE_PATH%" --kiosk "%KIOSK_URL%" --edge-kiosk-type=fullscreen --no-first-run --disable-session-crashed-bubble --disable-pinch --overscroll-history-navigation=0 --use-fake-ui-for-media-stream --autoplay-policy=no-user-gesture-required
exit /b 0
