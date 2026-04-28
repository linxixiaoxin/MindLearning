param(
  [string]$PublishRepo = "E:\Cache\Repos\MindLearning",
  [string]$RemoteUrl = "https://github.com/linxixiaoxin/MindLearning.git"
)

$ErrorActionPreference = "Stop"

$sourceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function Assert-Git {
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "git is not available in PATH."
  }
}

function Ensure-PublishRepo {
  if (-not (Test-Path $PublishRepo)) {
    $parent = Split-Path -Parent $PublishRepo
    if (-not (Test-Path $parent)) {
      New-Item -ItemType Directory -Path $parent | Out-Null
    }
    git clone $RemoteUrl $PublishRepo
    if ($LASTEXITCODE -ne 0) {
      throw "Failed to clone publish repo: $RemoteUrl"
    }
  }

  $resolvedPublishRepo = (Resolve-Path $PublishRepo).Path
  $gitDir = Join-Path $resolvedPublishRepo ".git"
  if (-not (Test-Path $gitDir)) {
    throw "Publish repo does not look like a git repository: $resolvedPublishRepo"
  }

  if ($resolvedPublishRepo -eq $sourceRoot) {
    throw "Publish repo path cannot be the same as source path."
  }

  return $resolvedPublishRepo
}

function Clear-PublishRepo($resolvedPublishRepo) {
  Get-ChildItem -LiteralPath $resolvedPublishRepo -Force |
    Where-Object { $_.Name -ne ".git" } |
    Remove-Item -Recurse -Force
}

function Copy-SourceToPublishRepo($resolvedPublishRepo) {
  $sourceScripts = Join-Path $sourceRoot "scripts"
  $sourceArchive = Join-Path $sourceRoot "90_archive"
  $sourceWebNodeModules = Join-Path $sourceRoot "web\node_modules"
  $sourceWebDist = Join-Path $sourceRoot "web\dist"

  $robocopyArgs = @(
    $sourceRoot
    $resolvedPublishRepo
    "/E"
    "/R:2"
    "/W:1"
    "/XD"
    $sourceArchive
    $sourceWebNodeModules
    $sourceWebDist
    "/XF"
    "*.log"
    "*.tmp"
  )

  & robocopy @robocopyArgs | Out-Host
  $exitCode = $LASTEXITCODE
  if ($exitCode -ge 8) {
    throw "robocopy failed with exit code $exitCode"
  }
}

Assert-Git
$resolvedPublishRepo = Ensure-PublishRepo
Clear-PublishRepo $resolvedPublishRepo
Copy-SourceToPublishRepo $resolvedPublishRepo

Set-Location $resolvedPublishRepo
git status -sb
