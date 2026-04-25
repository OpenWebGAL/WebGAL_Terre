$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
$SteamCmd = Join-Path $RepoRoot 'tools\steamcmd\steamcmd.exe'
$ContentRoot = Join-Path $RepoRoot 'terre-electron\build\win-unpacked'
$ScriptOutputDir = Join-Path $RepoRoot 'output\steampipe'
$AppBuild = Join-Path $ScriptOutputDir 'app_build_2978410.vdf'
$DepotBuild = Join-Path $ScriptOutputDir 'depot_build_2978412.vdf'

if (!(Test-Path $SteamCmd)) {
  throw "steamcmd.exe not found: $SteamCmd"
}

if (!(Test-Path (Join-Path $ContentRoot 'WebGAL Terre.exe'))) {
  throw "WebGAL Terre.exe not found under depot content root: $ContentRoot"
}

if (Test-Path (Join-Path $ContentRoot 'steam_appid.txt')) {
  throw "Remove steam_appid.txt before uploading to Steam: $(Join-Path $ContentRoot 'steam_appid.txt')"
}

New-Item -ItemType Directory -Force -Path $ScriptOutputDir | Out-Null

$ContentRootForVdf = $ContentRoot.Replace('\', '/')
$BuildOutputForVdf = (Join-Path $RepoRoot 'output').Replace('\', '/')

@"
"DepotBuild"
{
  "DepotID" "2978412"
  "FileMapping"
  {
    "LocalPath" "*"
    "DepotPath" "."
    "Recursive" "1"
  }
  "FileExclusion" "steam_appid.txt"
  "FileExclusion" "*.pdb"
}
"@ | Set-Content -Path $DepotBuild -Encoding ASCII

@"
"AppBuild"
{
  "AppID" "2978410"
  "Desc" "WebGAL Terre Steam Edition Windows build"
  "ContentRoot" "$ContentRootForVdf"
  "BuildOutput" "$BuildOutputForVdf/"
  "Depots"
  {
    "2978412" "depot_build_2978412.vdf"
  }
}
"@ | Set-Content -Path $AppBuild -Encoding ASCII

Write-Host ''
Write-Host 'Uploading WebGAL Terre Steam Edition to SteamPipe'
Write-Host 'AppID: 2978410'
Write-Host 'DepotID: 2978412'
Write-Host "ContentRoot: $ContentRoot"
Write-Host ''
Write-Host 'Enter your Steamworks build account name below.'
Write-Host 'SteamCMD will ask for the password and Steam Guard code if needed.'
Write-Host ''

$Account = Read-Host 'Steamworks build account'
if ([string]::IsNullOrWhiteSpace($Account)) {
  throw 'Steamworks build account is required.'
}

& $SteamCmd +login $Account +run_app_build $AppBuild +quit
$ExitCode = $LASTEXITCODE

Write-Host ''
if ($ExitCode -eq 0) {
  Write-Host 'SteamPipe upload command completed.'
} else {
  Write-Host "SteamPipe upload command exited with code $ExitCode."
}

Write-Host 'Check the SteamCMD output above and Steamworks Builds page for the uploaded build.'
Read-Host 'Press Enter to close this window'
exit $ExitCode
