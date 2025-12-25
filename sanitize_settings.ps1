# Используем относительный путь или переменную окружения
$tailPath = if (Test-Path 'settings_tail.txt') {
    'settings_tail.txt'
} elseif ($env:USERPROFILE) {
    Join-Path $env:USERPROFILE 'Desktop\settings_tail.txt'
} else {
    Write-Error "Cannot find settings_tail.txt"
    exit 1
}
$lines = Get-Content -LiteralPath $tailPath

# Insert chat.editing.alwaysSaveWithGeneratedChanges after files.autoSaveDelay
$insertLine = ($lines | Select-String -Pattern '"files.autoSaveDelay"' | Select-Object -First 1)
if ($insertLine) {
    $insertIndex = $insertLine.LineNumber
    $arrayList = New-Object System.Collections.ArrayList
    $arrayList.AddRange($lines)
    $arrayList.Insert($insertIndex, '    "chat.editing.alwaysSaveWithGeneratedChanges": true,') | Out-Null
    $lines = [string[]]$arrayList
}

# Remove trailing comma from workbench.enableExperiments line
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '"workbench.enableExperiments"') {
        $lines[$i] = $lines[$i].TrimEnd().TrimEnd(',')
    }
}

# Build final lines with braces
$finalLines = @('{') + $lines + @('}')

$finalPath = if ($env:APPDATA) {
    Join-Path $env:APPDATA 'Code\User\settings.json'
} else {
    Write-Error "Cannot determine AppData path"
    exit 1
}
Set-Content -LiteralPath $finalPath -Value $finalLines -Encoding UTF8
