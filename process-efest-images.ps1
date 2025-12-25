# Process EFEST images - convert PNG to JPG and create variants
$sourceDir = "."
$targetDir = "assets\images\portfolio"

Write-Host "Processing EFEST images..." -ForegroundColor Green

# Image mapping based on typical EFEST poster layouts
$imageMapping = @{
    "IMG_4816 1.png" = "freepik__subtle-variation-of-the-previous-electronic-music-__38650.jpg"
    "IMG_4815 1.png" = "freepik__upload__96337.jpg"
    "IMG_4817 1.png" = "freepik__upload__96338.jpg"
}

# Check if ImageMagick is available
$hasImageMagick = $false
try {
    $null = & magick -version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $hasImageMagick = $true
        Write-Host "ImageMagick found - will create optimized variants" -ForegroundColor Green
    }
} catch {
    Write-Host "ImageMagick not found - will copy originals" -ForegroundColor Yellow
}

foreach ($sourceFile in $imageMapping.Keys) {
    $sourcePath = Join-Path $sourceDir $sourceFile
    $targetName = $imageMapping[$sourceFile]
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($targetName)

    if (!(Test-Path $sourcePath)) {
        Write-Host "Not found: $sourceFile" -ForegroundColor Red
        continue
    }

    Write-Host "Processing: $sourceFile -> $targetName" -ForegroundColor Cyan

    # Main image (full size)
    $targetPath = Join-Path $targetDir $targetName

    if ($hasImageMagick) {
        & magick $sourcePath -quality 85 -strip $targetPath
        Write-Host "  Created: $targetName" -ForegroundColor Green
    } else {
        Copy-Item $sourcePath $targetPath -Force
        Write-Host "  Copied: $targetName (PNG format)" -ForegroundColor Yellow
    }

    # Create small variant (-sm)
    $smPath = Join-Path $targetDir ($baseName + "-sm.jpg")
    if ($hasImageMagick) {
        & magick $sourcePath -resize 400x -quality 85 -strip $smPath
        Write-Host "  Created: $($baseName)-sm.jpg (400px)" -ForegroundColor Green
    } else {
        Copy-Item $targetPath $smPath -Force
    }

    # Create medium variant (-md)
    $mdPath = Join-Path $targetDir ($baseName + "-md.jpg")
    if ($hasImageMagick) {
        & magick $sourcePath -resize 800x -quality 85 -strip $mdPath
        Write-Host "  Created: $($baseName)-md.jpg (800px)" -ForegroundColor Green
    } else {
        Copy-Item $targetPath $mdPath -Force
    }

    # Create WebP variants (if ImageMagick supports it)
    if ($hasImageMagick) {
        $webpPath = Join-Path $targetDir ($baseName + ".webp")
        & magick $sourcePath -quality 85 -strip $webpPath
        Write-Host "  Created: $($baseName).webp" -ForegroundColor Green

        $webpSmPath = Join-Path $targetDir ($baseName + "-sm.webp")
        & magick $sourcePath -resize 400x -quality 85 -strip $webpSmPath

        $webpMdPath = Join-Path $targetDir ($baseName + "-md.webp")
        & magick $sourcePath -resize 800x -quality 85 -strip $webpMdPath
    }
}

Write-Host ""
Write-Host "Image processing complete!" -ForegroundColor Green
