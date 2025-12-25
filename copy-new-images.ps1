# PowerShell script to copy and rename new portfolio images
# Run this script from the elizaveta-portfolio directory

$sourceDir = ".."
$targetDir = "assets\images\new-portfolio"

# Ensure target directory exists
if (!(Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force
}

# Image mapping - original filename to new portfolio name
$imageMapping = @{
    "1022819502.jpg"                  = "music-festival-collection.jpg"
    "Без имени 1.pdf.jpg"             = "drictile-abstract.jpg"
    "Name - CV.png"                   = "cv-resume-design.jpg"
    "Name - CV@2x.pdf"                = "cv-resume-design-hd.jpg"
    "freepik--20250929023551nI0G.pdf" = "3d-spheres-purple.jpg"
    "IMG_8674.psd"                    = "holographic-faces.jpg"
}

# Additional images that might need manual identification
$additionalImages = @(
    "efest-poster-purple.jpg",
    "efest-poster-dark.jpg",
    "colorful-circles.jpg",
    "smoke-abstract.jpg",
    "3d-composition.jpg"
)

Write-Host "Copying and renaming portfolio images..."

# Copy and rename mapped images
foreach ($original in $imageMapping.Keys) {
    $sourcePath = Join-Path $sourceDir $original
    $targetPath = Join-Path $targetDir $imageMapping[$original]

    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $targetPath -Force
        Write-Host "OK: Copied: $original -> $($imageMapping[$original])"
    }
    else {
        Write-Host "Not found: $original"
    }
}

# List remaining images that need manual copying
Write-Host ""
Write-Host "Additional images needed (copy manually):"
foreach ($img in $additionalImages) {
    Write-Host "   - $img"
}

Write-Host ""
Write-Host "Portfolio images ready for optimization!"
Write-Host "Next step: Run image optimization to create responsive variants"
