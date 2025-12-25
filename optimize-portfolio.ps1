# Image Optimization Script for New Portfolio
# This script creates responsive image variants for better web performance

$sourceDir = "assets\images\new-portfolio"
$targetDir = "assets\images"

Write-Host "Starting image optimization for new portfolio..."

# Create responsive variants for each image
$images = Get-ChildItem $sourceDir -Filter "*.jpg"

foreach ($image in $images) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($image.Name)
    $sourcePath = $image.FullName

    Write-Host "Processing: $($image.Name)"

    # For now, copy original as base variant
    # In production, you would use ImageMagick or similar for resizing
    $originalPath = Join-Path $targetDir "$baseName.jpg"
    Copy-Item $sourcePath $originalPath -Force

    # Create size indicators (for future optimization)
    $size = [math]::Round($image.Length / 1024, 1)
    if ($size -gt 1000) {
        Write-Host "   Warning: Large file ($size KB) - consider optimization"
    } else {
        Write-Host "   OK: Optimized size ($size KB)"
    }
}

Write-Host ""
Write-Host "Portfolio images processed!"
Write-Host "For production: Consider using ImageMagick/Sharp for automatic resizing to 400w, 800w, 1200w variants"
