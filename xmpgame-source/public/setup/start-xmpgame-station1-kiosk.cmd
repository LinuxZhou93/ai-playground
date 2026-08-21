@echo off
setlocal
set "KIOSK_URL=https://www.zhouxiaomai.com/xmpgame/station/1?kiosk=1"
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
