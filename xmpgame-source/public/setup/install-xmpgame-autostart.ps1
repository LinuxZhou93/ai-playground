param(
  [Parameter(Mandatory = $true)]
  [ValidateSet(1, 2, 3, 4)]
  [int]$Station
)

$ErrorActionPreference = "Stop"
$kioskUrl = "https://www.zhouxiaomai.com/xmpgame/station/$Station?kiosk=1"
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
$shortcutPath = Join-Path $startupFolder ("XMP Kindergarten - Station {0:D2}.lnk" -f $Station)
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $edgePath
$shortcut.Arguments = "--kiosk `"$kioskUrl`" --edge-kiosk-type=fullscreen --no-first-run --disable-session-crashed-bubble --disable-pinch --overscroll-history-navigation=0 --use-fake-ui-for-media-stream --autoplay-policy=no-user-gesture-required"
$shortcut.WorkingDirectory = Split-Path $edgePath
$shortcut.Description = "西马棚幼儿园 AI 画作装置 · Station $Station"
$shortcut.Save()

Start-Process -FilePath $edgePath -ArgumentList $shortcut.Arguments
Write-Host "Station $Station kiosk startup installed: $shortcutPath"
