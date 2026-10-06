# Windows launcher: Caddy in its own window, Next.js in PowerShell.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $root

function Get-WindowsArch {
  if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64' -or $env:PROCESSOR_ARCHITEW6432 -eq 'ARM64') {
    return 'arm64'
  }
  if ($env:PROCESSOR_ARCHITECTURE -eq 'AMD64' -or $env:PROCESSOR_ARCHITEW6432 -eq 'AMD64') {
    return 'amd64'
  }
  return $null
}

function Test-WindowsExe([string]$Path, [string]$Arch) {
  if (-not (Test-Path -LiteralPath $Path)) { return $false }
  $stream = [System.IO.File]::Open(
    $Path,
    [System.IO.FileMode]::Open,
    [System.IO.FileAccess]::Read,
    [System.IO.FileShare]::ReadWrite
  )
  try {
    if ($stream.Length -lt 10MB) { return $false }
    $dos = New-Object byte[] 64
    if ($stream.Read($dos, 0, 64) -lt 64) { return $false }
    if ($dos[0] -ne 0x4D -or $dos[1] -ne 0x5A) { return $false }
    $peOffset = [BitConverter]::ToInt32($dos, 0x3C)
    if ($peOffset -lt 64 -or $peOffset -gt 1024) { return $false }
    $stream.Position = $peOffset
    $coff = New-Object byte[] 24
    if ($stream.Read($coff, 0, 24) -lt 24) { return $false }
    if ($coff[0] -ne 0x50 -or $coff[1] -ne 0x45 -or $coff[2] -ne 0 -or $coff[3] -ne 0) { return $false }
    $machine = [BitConverter]::ToUInt16($coff, 4)
    $expected = if ($Arch -eq 'arm64') { 0xAA64 } else { 0x8664 }
    if ($machine -ne $expected) { return $false }
    $sections = [BitConverter]::ToUInt16($coff, 6)
    $optionalSize = [BitConverter]::ToUInt16($coff, 20)
    if ($sections -lt 1 -or $optionalSize -lt 24) { return $false }
    $stream.Position = $peOffset + 24
    $magicBytes = New-Object byte[] 2
    if ($stream.Read($magicBytes, 0, 2) -lt 2) { return $false }
    $magic = [BitConverter]::ToUInt16($magicBytes, 0)
    if ($magic -ne 0x20B) { return $false }
    $sectionOffset = $peOffset + 24 + $optionalSize
    $end = 0L
    for ($i = 0; $i -lt $sections; $i++) {
      $stream.Position = $sectionOffset + ($i * 40) + 16
      $raw = New-Object byte[] 8
      if ($stream.Read($raw, 0, 8) -lt 8) { return $false }
      $rawSize = [BitConverter]::ToUInt32($raw, 0)
      $rawPtr = [BitConverter]::ToUInt32($raw, 4)
      $sectionEnd = [int64]$rawPtr + [int64]$rawSize
      if ($sectionEnd -gt $end) { $end = $sectionEnd }
    }
    return ($end -le $stream.Length)
  } catch {
    return $false
  } finally {
    $stream.Close()
  }
}

function Find-Caddy([string]$Arch) {
  $paths = @()
  foreach ($name in @('caddy.exe', 'caddy')) {
    $cmd = Get-Command $name -ErrorAction SilentlyContinue
    if ($cmd -and $cmd.Source) { $paths += $cmd.Source }
  }
  $paths += @(
    (Join-Path $root 'caddy.exe'),
    (Join-Path $root 'tools\caddy.exe'),
    (Join-Path $env:ProgramFiles 'Caddy\caddy.exe'),
    (Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Links\caddy.exe')
  )
  if ($env:ChocolateyInstall) {
    $paths += (Join-Path $env:ChocolateyInstall 'bin\caddy.exe')
  }
  foreach ($path in ($paths | Select-Object -Unique)) {
    if (Test-WindowsExe $path $Arch) { return $path }
  }
  return $null
}

function Save-Caddy([string]$Destination, [string]$Arch) {
  $dir = Split-Path -Parent $Destination
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $temp = "$Destination.download"
  if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Force }
  $curl = Join-Path $env:SystemRoot 'System32\curl.exe'
  if (-not (Test-Path -LiteralPath $curl)) {
    throw 'Windows curl.exe was not found.'
  }
  $url = "https://caddyserver.com/api/download?os=windows&arch=$Arch"
  & $curl -fL --retry 3 --output $temp $url
  if ($LASTEXITCODE -ne 0) {
    throw "Could not download Windows caddy.exe (curl exit $LASTEXITCODE)."
  }
  if (-not (Test-WindowsExe $temp $Arch)) {
    Remove-Item -LiteralPath $temp -Force -ErrorAction SilentlyContinue
    throw 'The download is not a usable Windows caddy.exe.'
  }
  if (Test-Path -LiteralPath $Destination) { Remove-Item -LiteralPath $Destination -Force }
  Move-Item -LiteralPath $temp -Destination $Destination
  Unblock-File -LiteralPath $Destination
}

$arch = Get-WindowsArch
if (-not $arch) {
  Write-Host 'Caddy needs 64-bit Windows. This PC is 32-bit, so caddy.exe cannot start.'
  exit 1
}

foreach ($stale in @(
  (Join-Path $root 'tools\caddy.exe'),
  (Join-Path $root 'caddy.exe')
)) {
  if ((Test-Path -LiteralPath $stale) -and -not (Test-WindowsExe $stale $arch)) {
    Write-Host "Removing unusable $stale"
    try {
      Remove-Item -LiteralPath $stale -Force
    } catch {
      Write-Host 'Close the Caddy window, then run start-site.bat again.'
      Write-Host $_.Exception.Message
      exit 1
    }
  }
}

function Test-CaddyRuns([string]$Path) {
  try {
    & $Path version | Out-Host
    return ($LASTEXITCODE -eq 0)
  } catch {
    Write-Host $_.Exception.Message
    return $false
  }
}

$caddy = Find-Caddy $arch
if ($caddy) {
  $caddy = (Resolve-Path -LiteralPath $caddy).Path
}
if ($caddy -and -not (Test-CaddyRuns $caddy)) {
  $localCopy = $caddy.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)
  if ($localCopy) {
    Write-Host 'The downloaded caddy.exe cannot start. Replacing it...'
    try {
      Remove-Item -LiteralPath $caddy -Force
    } catch {
      Write-Host 'Close the Caddy window, then run start-site.bat again.'
      Write-Host $_.Exception.Message
      exit 1
    }
  }
  $caddy = $null
}

if (-not $caddy) {
  $caddy = Join-Path $root 'tools\caddy.exe'
  Write-Host 'Downloading the Windows caddy.exe...'
  try {
    Save-Caddy $caddy $arch
  } catch {
    Write-Host $_.Exception.Message
    Write-Host 'Install Caddy from PowerShell, close that window, open a new Command Prompt, and run start-site.bat:'
    Write-Host '  winget install -e --id CaddyServer.Caddy'
    exit 1
  }
  if (-not (Test-CaddyRuns $caddy)) {
    Write-Host 'Windows refused to start the new caddy.exe.'
    Write-Host 'Install it, then open a new Command Prompt and run start-site.bat:'
    Write-Host '  winget install -e --id CaddyServer.Caddy'
    exit 1
  }
}

$caddyConfig = Join-Path $root 'Caddyfile'
Start-Process -FilePath $caddy -WorkingDirectory $root -ArgumentList @('run', '--config', $caddyConfig)
Start-Process -FilePath "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -WorkingDirectory $root -ArgumentList @('-NoExit', '-NoProfile', '-Command', 'npm run dev')
Write-Host 'Opened Caddy and the 4EOS server. Site: http://localhost:8080'
