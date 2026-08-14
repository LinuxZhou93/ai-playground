$ErrorActionPreference = "Stop"

$kioskUrl = "https://www.zhouxiaomai.com/xmpgame/station/1?kiosk=1"
$edgeCandidates = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "$env:LocalAppData\Microsoft\Edge\Application\msedge.exe"
)
$edgePath = $edgeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $edgePath) {
  throw "Microsoft Edge was not found on this computer."
}

$startupFolder = [Environment]::GetFolderPath("Startup")
$shortcutPath = Join-Path $startupFolder "XMP Kindergarten - Station 01.lnk"
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $edgePath
$shortcut.Arguments = "--kiosk `"$kioskUrl`" --edge-kiosk-type=fullscreen --no-first-run --disable-session-crashed-bubble --disable-pinch --overscroll-history-navigation=0 --use-fake-ui-for-media-stream --autoplay-policy=no-user-gesture-required"
$shortcut.WorkingDirectory = Split-Path $edgePath
$shortcut.Description = "西马棚幼儿园 · 化形万物"
$shortcut.Save()

Start-Process -FilePath $edgePath -ArgumentList $shortcut.Arguments
Write-Host "Station 01 kiosk startup installed: $shortcutPath"
