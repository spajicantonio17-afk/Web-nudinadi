# scripts/e2e-run.ps1
# Convenience wrapper: ensures Supabase is up, grabs the anon key, runs Playwright.
# Usage:  pwsh -File scripts/e2e-run.ps1            (default: run all)
#         pwsh -File scripts/e2e-run.ps1 --headed   (visible browser)

$ErrorActionPreference = 'Stop'

# Add User PATH so `supabase` resolves in fresh shells
$env:PATH = [Environment]::GetEnvironmentVariable("PATH", "User") + ";" + [Environment]::GetEnvironmentVariable("PATH", "Machine")

Write-Host "[e2e] Checking Supabase status..." -ForegroundColor Cyan
$statusOutput = supabase status 2>&1
if ($LASTEXITCODE -ne 0 -or $statusOutput -match 'not running|stopped') {
    Write-Host "[e2e] Supabase not running. Starting it now (first run downloads ~1.5 GB)..." -ForegroundColor Yellow
    supabase start
    if ($LASTEXITCODE -ne 0) { throw "supabase start failed" }
    $statusOutput = supabase status 2>&1
}

# Extract anon key from `supabase status` output
$anonKey = ($statusOutput -split "`n" | Where-Object { $_ -match 'anon key' } | Select-Object -First 1) -replace '.*anon key:\s*', ''
$anonKey = $anonKey.Trim()

if (-not $anonKey) { throw "Could not extract anon key from `supabase status` output" }

Write-Host "[e2e] Supabase running. Anon key: $($anonKey.Substring(0, [Math]::Min(20, $anonKey.Length)))..." -ForegroundColor Green

$env:E2E_SUPABASE_ANON_KEY = $anonKey
$env:NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321'
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = $anonKey

# Reset DB to apply seed.sql (idempotent — wipes test data, re-seeds)
Write-Host "[e2e] Resetting DB with migrations + seed..." -ForegroundColor Cyan
supabase db reset --no-seed 2>&1 | Out-Null
supabase db reset 2>&1 | Tee-Object -Variable resetOut | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host $resetOut -ForegroundColor Red
    throw "supabase db reset failed"
}

Write-Host "[e2e] Running Playwright tests..." -ForegroundColor Cyan
npx playwright test $args
$testExit = $LASTEXITCODE

if ($testExit -eq 0) {
    Write-Host "[e2e] All tests passed." -ForegroundColor Green
} else {
    Write-Host "[e2e] Some tests failed. Open the HTML report:" -ForegroundColor Yellow
    Write-Host "      npx playwright show-report" -ForegroundColor Yellow
}
exit $testExit
