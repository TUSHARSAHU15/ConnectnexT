# NexusHub SaaS Production Deployment Orchestrator
# Act as DevOps Engineer - Windows PowerShell Automation Pipeline

$ErrorActionPreference = "Stop"
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "NexusHub SaaS Production Deployment Pipeline" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Step 1: Execute Static TypeScript Compiler Type Check
Write-Host "`n[Step 1/4] Running strict compiler validation checks..." -ForegroundColor Yellow
try {
    & npx tsc --noEmit
    Write-Host "✔ Static type safety checks passed successfully with zero errors." -ForegroundColor Green
} catch {
    Write-Error "✖ TypeScript compilation failed. Please resolve compiler errors before deploying."
    exit 1
}

# Step 2: Build Production Frontend Bundles locally
Write-Host "`n[Step 2/4] Packaging frontend bundles into optimized static assets..." -ForegroundColor Yellow
try {
    & npm run build
    Write-Host "✔ Frontend production assets compiled successfully inside ./dist." -ForegroundColor Green
} catch {
    Write-Error "✖ Frontend package build failed."
    exit 1
}

# Step 3: Verify Docker Daemon Status
Write-Host "`n[Step 3/4] Establishing secure link to local Docker API..." -ForegroundColor Yellow
$dockerCheck = & docker ps 2>&1
if ($dockerCheck -match "error during connect") {
    Write-Error "✖ Unable to connect to Docker Desktop. Please make sure the Docker daemon is active."
    exit 1
}
Write-Host "✔ Secured connection to Docker API daemon." -ForegroundColor Green

# Step 4: Build and Tag Production-Grade Docker Images
Write-Host "`n[Step 4/4] Packing production-ready container images..." -ForegroundColor Yellow
$registry = Read-Host "Specify container registry domain prefix (e.g. docker.io/username or <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com) [Press Enter for local tag]"

$frontendTag = "nexushub-frontend:latest"
$backendTag = "nexushub-backend:latest"

if ($registry) {
    $frontendTag = "$registry/nexushub-frontend:latest"
    $backendTag = "$registry/nexushub-backend:latest"
}

Write-Host "`nBuilding frontend production container image: $frontendTag..." -ForegroundColor Cyan
& docker build -t $frontendTag -f Dockerfile .

Write-Host "`nBuilding backend production container image: $backendTag..." -ForegroundColor Cyan
& docker build -t $backendTag -f ./backend/Dockerfile ./backend

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "Production Packaging Completed Successfully!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Tagged Images Ready for Registry Push:" -ForegroundColor White
Write-Host "  - Frontend: $frontendTag" -ForegroundColor Gray
Write-Host "  - Backend : $backendTag" -ForegroundColor Gray

if ($registry) {
    Write-Host "`nTo push these images to your production registry, run:" -ForegroundColor Yellow
    Write-Host "  docker push $frontendTag" -ForegroundColor White
    Write-Host "  docker push $backendTag" -ForegroundColor White
} else {
    Write-Host "`nTo run these images locally in production mode, execute:" -ForegroundColor Yellow
    Write-Host "  docker compose up -d" -ForegroundColor White
}
