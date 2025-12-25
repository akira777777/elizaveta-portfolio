# Create placeholder images for portfolio
$portfolioDir = "assets\images\portfolio"

# Ensure directory exists
if (!(Test-Path $portfolioDir)) {
    New-Item -ItemType Directory -Path $portfolioDir -Force | Out-Null
}

# List of required images from HTML
$requiredImages = @(
    "freepik__subtle-variation-of-the-previous-electronic-music-__38650.jpg",
    "freepik__subtle-variation-of-the-previous-electronic-music-__38650-sm.jpg",
    "freepik__subtle-variation-of-the-previous-electronic-music-__38650-md.jpg",
    "freepik__subtle-variation-of-the-previous-electronic-music-__38650.webp",
    "freepik__subtle-variation-of-the-previous-electronic-music-__38650-sm.webp",
    "freepik__subtle-variation-of-the-previous-electronic-music-__38650-md.webp",
    "freepik__upload__96337.jpg",
    "freepik__upload__96337-sm.jpg",
    "freepik__upload__96337-md.jpg",
    "freepik__upload__96337.webp",
    "freepik__upload__96337-sm.webp",
    "freepik__upload__96337-md.webp",
    "freepik__upload__96338.jpg",
    "freepik__upload__96338-sm.jpg",
    "freepik__upload__96338-md.jpg",
    "freepik__upload__96338.webp",
    "freepik__upload__96338-sm.webp",
    "freepik__upload__96338-md.webp"
)

Write-Host "Creating placeholder images..."

foreach ($imageName in $requiredImages) {
    $imagePath = Join-Path $portfolioDir $imageName

    if (!(Test-Path $imagePath)) {
        # Create a simple SVG placeholder
        $svgContent = @"
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f0f0f0"/>
  <text x="400" y="300" font-family="Arial" font-size="24" fill="#999" text-anchor="middle" dominant-baseline="middle">
    $imageName
  </text>
  <text x="400" y="330" font-family="Arial" font-size="14" fill="#ccc" text-anchor="middle" dominant-baseline="middle">
    Placeholder Image
  </text>
</svg>
"@

        # Save as SVG (works for both .jpg and .webp requests - browser will handle it)
        $svgPath = $imagePath -replace '\.(jpg|webp)$', '.svg'
        $svgContent | Out-File -FilePath $svgPath -Encoding UTF8 -NoNewline

        # For .jpg files, we'll create a simple colored rectangle using PowerShell
        if ($imageName -match '\.jpg$') {
            # Create a simple 1x1 pixel PNG and rename to JPG (browsers are forgiving)
            # Actually, let's just create an SVG and let the browser handle it
            Copy-Item $svgPath $imagePath -Force
        }

        # For .webp, same approach
        if ($imageName -match '\.webp$') {
            Copy-Item $svgPath $imagePath -Force
        }

        Write-Host "Created placeholder: $imageName"
    }
}

Write-Host "`nPlaceholder images created!"
Write-Host "Note: Replace these with actual images when available."
