# PowerShell script to start Yuna Parfum development environment
Write-Host "Starting Yuna Parfum Development Environment..." -ForegroundColor Green
Write-Host ""

# Check if MongoDB is available
$mongoPath = Get-Command mongod -ErrorAction SilentlyContinue
if ($mongoPath) {
    Write-Host "Starting MongoDB..." -ForegroundColor Yellow
    Start-Process -FilePath "mongod" -WindowStyle Minimized
} else {
    Write-Host "MongoDB not found in PATH. Please start MongoDB manually if needed." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d `"$backendPath`" && npm run dev"

Write-Host ""
Write-Host "Waiting 3 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "Starting Frontend Development Server..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d `"$frontendPath`" && npm start"

Write-Host ""
Write-Host "Development environment is starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this script..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
