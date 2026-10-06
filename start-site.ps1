# Windows launcher: Caddy in a Command Prompt window, Next.js in PowerShell.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $root

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Find-Caddy {
  $cmd = Get-Command caddy.exe -ErrorAction SilentlyContinue
  if (-not $cmd) { $cmd = Get-Command caddy -ErrorAction SilentlyContinue }
  if ($cmd -and $cmd.Source) { return $cmd.Source }

  $candidates = @(
    (Join-Path $root 'caddy.exe'),
    (Join-Path $root 'tools\caddy.exe'),
    (Join-Path $env:ProgramFiles 'Caddy\caddy.exe'),
    (Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Links\caddy.exe')
  )
  if ($env:ChocolateyInstall) {
    $candidates += (Join-Path $env:ChocolateyInstall 'bin\caddy.exe')
  }
  foreach ($path in $candidates) {
    if (Test-Path -LiteralPath $path) { return $path }
  }
  return $null
}

function Test-WindowsExe([string]$Path) {
  $stream = [System.IO.File]::OpenRead($Path)
  try {
    $header = New-Object byte[] 2
    $read = $stream.Read($header, 0, 2)
    return ($read -eq 2 -and $header[0] -eq 0x4D -and $header[1] -eq 0x5A)
  } finally {
    $stream.Close()
  }
}

$caddy = Find-Caddy
if ($caddy -and -not (Test-WindowsExe $caddy)) { $caddy = $null }
if (-not $caddy) {
  Write-Host 'Caddy is not installed. Downloading the Windows caddy.exe...'
  $tools = Join-Path $root 'tools'
  New-Item -ItemType Directory -Force -Path $tools | Out-Null
  $arch = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'arm64' } else { 'amd64' }
  $caddy = Join-Path $tools 'caddy.exe'
  $url = "https://caddyserver.com/api/download?os=windows&arch=$arch"
  Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $caddy
}

if (-not (Test-Path -LiteralPath $caddy) -or -not (Test-WindowsExe $caddy)) {
  Write-Host 'Could not get a Windows caddy.exe.'
  Write-Host 'Install it in PowerShell, close that window, open a new one, then run start-site.bat again:'
  Write-Host '  winget install -e --id CaddyServer.Caddy'
  exit 1
}

$caddyConfig = Join-Path $root 'Caddyfile'
$cmdLine = "title Caddy & `"$caddy`" run --config `"$caddyConfig`""
Start-Process -FilePath "$env:SystemRoot\System32\cmd.exe" -WorkingDirectory $root -ArgumentList '/k', $cmdLine
Start-Process -FilePath "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -WorkingDirectory $root -ArgumentList '-NoExit', '-NoProfile', '-Command', "Set-Location -LiteralPath '$root'; `$Host.UI.RawUI.WindowTitle = '4EOS server'; npm run dev"
Write-Host 'Opened Caddy and the 4EOS server. Site: http://localhost:8080'
