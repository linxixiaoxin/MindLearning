param(
  [switch]$SkipAudit
)

$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$webRoot = Join-Path $projectRoot "web"

function Invoke-ValidationStep {
  param(
    [string]$Name,
    [scriptblock]$Step
  )

  Write-Host ""
  Write-Host "==> $Name"
  & $Step
  if ($LASTEXITCODE -ne 0) {
    throw "Validation step failed: $Name"
  }
}

if (-not (Test-Path $webRoot)) {
  throw "web directory not found: $webRoot"
}

Push-Location $webRoot
try {
  Invoke-ValidationStep "Validate site bundle" {
    npm run validate:site
  }

  Invoke-ValidationStep "Build production bundle" {
    npm run build
  }

  if ($SkipAudit) {
    Write-Host ""
    Write-Host "==> Skip npm audit"
  } else {
    Invoke-ValidationStep "Audit production dependencies" {
      npm audit --omit=dev
    }
  }
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "Release validation completed."
