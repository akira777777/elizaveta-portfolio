# PowerShell script to create additional portfolio variants and placeholders

$targetDir = "assets\images\new-portfolio"

Write-Host "Creating additional portfolio variants..."

# Copy existing images as variants for missing ones
$variants = @{
    "3d-spheres-purple.jpg"         = "colorful-circles.jpg"
    "drictile-abstract.jpg"         = "smoke-abstract.jpg"
    "holographic-faces.jpg"         = "3d-composition.jpg"
    "music-festival-collection.jpg" = "efest-poster-purple.jpg"
    "cv-resume-design.jpg"          = "efest-poster-dark.jpg"
}

foreach ($source in $variants.Keys) {
    $sourcePath = Join-Path $targetDir $source
    $targetPath = Join-Path $targetDir $variants[$source]

    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $targetPath -Force
        Write-Host "OK: Created variant: $source -> $($variants[$source])"
    }
}

Write-Host ""
Write-Host "All portfolio images ready!"
$imageCount = (Get-ChildItem $targetDir -ErrorAction SilentlyContinue | Measure-Object).Count
Write-Host "Total images: $imageCount"
