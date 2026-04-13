param(
    [string]$Root = (Resolve-Path "$PSScriptRoot\..\").Path,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function New-ArchiveFolder {
    param([string]$Path)
    if (-not (Test-Path -Path $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
    }
}

function Test-SkipPath {
    param(
        [string]$ItemPath,
        [string]$ArchiveRoot
    )
    if (-not $ItemPath) { return $false }
    $lowerItem = $ItemPath.ToLower()
    $lowerArchive = $ArchiveRoot.ToLower()
    # Skip anything already inside the archive folder
    if ($lowerItem.StartsWith($lowerArchive)) { return $true }
    # Skip virtual environments
    if ($lowerItem -match "\\\.venv\\") { return $true }
    return $false
}

function Move-ItemSafe {
    param(
        [string]$ItemPath,
        [string]$ArchiveRoot,
        [string]$Root
    )
    if (-not (Test-Path -Path $ItemPath)) { return }
    if (Test-SkipPath -ItemPath $ItemPath -ArchiveRoot $ArchiveRoot) {
        Write-Host "Skipped: $ItemPath"
        return
    }
    # Compute path relative to repo root to preserve structure under archive
    $fullResolved = (Resolve-Path $ItemPath).Path
    $relative = $fullResolved
    if ($fullResolved.ToLower().StartsWith($Root.ToLower())) {
        $relative = $fullResolved.Substring($Root.Length).TrimStart('\')
    }
    $dest = Join-Path $ArchiveRoot $relative
    $destDir = Split-Path $dest -Parent
    if (-not (Test-Path -Path $destDir)) { New-ArchiveFolder -Path $destDir }

    if ($DryRun) {
        Write-Host "[DRY-RUN] Would move: $ItemPath -> $dest"
    } else {
        Move-Item -Path $ItemPath -Destination $dest -Force
        Write-Host "Moved: $ItemPath -> $dest"
    }
}

$archiveRoot = Join-Path $Root "archive"
New-ArchiveFolder -Path $archiveRoot

$configPath = Join-Path $Root "archive-config.json"
$files = @()
$patterns = @()

if (Test-Path -Path $configPath) {
    $configJson = Get-Content -Raw -Path $configPath | ConvertFrom-Json
    if ($configJson.files) { $files = $configJson.files }
    if ($configJson.patterns) { $patterns = $configJson.patterns }
}

# Built-in safe defaults: Python __pycache__ folders
$defaults = @(
    "ai_engine/__pycache__",
    "**/__pycache__"
)

foreach ($path in ($defaults + $files)) {
    $fullPath = Join-Path $Root $path
    if ($path.Contains('*') -or $path.Contains('?')) {
        Get-ChildItem -Path $Root -Recurse -Directory -Filter "__pycache__" |
            Where-Object { $_.FullName -notlike "$archiveRoot*" -and $_.FullName -notmatch "\\\.venv\\" } |
            ForEach-Object {
            Move-ItemSafe -ItemPath $_.FullName -ArchiveRoot $archiveRoot -Root $Root
        }
    } else {
        Move-ItemSafe -ItemPath $fullPath -ArchiveRoot $archiveRoot -Root $Root
    }
}

foreach ($pat in $patterns) {
    Get-ChildItem -Path $Root -Recurse -File -Include $pat | ForEach-Object {
        Move-ItemSafe -ItemPath $_.FullName -ArchiveRoot $archiveRoot -Root $Root
    }
}

Write-Host "Archive operation complete. Use -DryRun to preview moves."