# One-click deployment script for Hexo blog

Write-Host "Starting Hexo blog deployment..."

# Change to project directory
Set-Location "d:\blog\hexo-new"

# Check dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install --registry=https://registry.npmmirror.com
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Dependency installation failed"
        Pause
        exit 1
    }
}

# Execute deployment process
Write-Host "Cleaning project..."
npm run clean
if ($LASTEXITCODE -ne 0) {
    Write-Host "Clean failed"
    Pause
    exit 1
}

Write-Host "Building project..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed"
    Pause
    exit 1
}

Write-Host "Deploying project..."
npm run deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "Deploy failed"
    Pause
    exit 1
}

Write-Host "Deployment completed!"
Pause
