# Run npm build, commit any changes, and push (force if needed)
# Usage: .\scripts\auto-build-commit.ps1

$ErrorActionPreference = 'Stop'

Write-Host "Running npm install..."
npm install

Write-Host "Running npm run build..."
npm run build

# Check for git repo
if (-not (Test-Path .git)) {
    Write-Error "Not a git repository. Run this from the repository root."
    exit 1
}

# Check for changes
$changes = git status --porcelain
if ([string]::IsNullOrWhiteSpace($changes)) {
    Write-Host "No changes to commit after build."
    exit 0
}

Write-Host "Changes detected. Adding files..."
git add -A

# Create a commit message with timestamp
$timestamp = (Get-Date).ToString('s')
$commitMsg = "ci: build and commit generated files - $timestamp"

git commit -m "$commitMsg"
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Commit failed or no changes to commit. Continuing..."
}

# Try a normal push first
try {
    git push origin main
    Write-Host "Pushed to origin/main successfully."
} catch {
    Write-Warning "Normal push failed, attempting force push..."
    git push --force origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Force-pushed to origin/main."
    } else {
        Write-Error "Force push failed."
        exit 1
    }
}
