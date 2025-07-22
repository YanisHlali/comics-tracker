# Definition du repertoire d'extraction
$extractDir = 'output'

function Find-7Zip {
    $possible7zPaths = @(
        'C:\Program Files\7-Zip\7z.exe',
        'C:\Program Files (x86)\7-Zip\7z.exe'
    )
    
    $7zCommand = Get-Command '7z.exe' -ErrorAction SilentlyContinue
    if ($7zCommand) {
        $possible7zPaths += $7zCommand.Path
    }
    
    $7zGCommand = Get-Command '7zG.exe' -ErrorAction SilentlyContinue
    if ($7zGCommand) {
        $possible7zPaths += $7zGCommand.Path
    }
    
    foreach ($path in $possible7zPaths) {
        if ($path -and (Test-Path $path)) {
            return $path
        }
    }
    return $null
}

function Find-WinRAR {
    $possibleWinRARPaths = @(
        'C:\Program Files\WinRAR\WinRAR.exe',
        'C:\Program Files (x86)\WinRAR\WinRAR.exe',
        'C:\Program Files\WinRAR\RAR.exe',
        'C:\Program Files (x86)\WinRAR\RAR.exe'
    )
    
    $winrarCommand = Get-Command 'winrar.exe' -ErrorAction SilentlyContinue
    if ($winrarCommand) {
        $possibleWinRARPaths += $winrarCommand.Path
    }
    
    $rarCommand = Get-Command 'rar.exe' -ErrorAction SilentlyContinue
    if ($rarCommand) {
        $possibleWinRARPaths += $rarCommand.Path
    }
    
    foreach ($path in $possibleWinRARPaths) {
        if ($path -and (Test-Path $path)) {
            return $path
        }
    }
    return $null
}

# Creation du repertoire d'extraction s'il n'existe pas
New-Item -ItemType Directory -Force -Path $extractDir | Out-Null

# Recuperation de tous les fichiers CBR et CBZ
$cbrFiles = Get-ChildItem -Filter '*.cbr' -File -ErrorAction SilentlyContinue
$cbzFiles = Get-ChildItem -Filter '*.cbz' -File -ErrorAction SilentlyContinue

$archives = @()
if ($cbrFiles) {
    $archives += $cbrFiles
}
if ($cbzFiles) {
    $archives += $cbzFiles
}

if ($archives.Count -eq 0) {
    Write-Host 'Aucun fichier .cbr ou .cbz trouve.'
    exit 1
}

Write-Host "Nombre de fichiers a traiter : $($archives.Count)"

foreach ($archive in $archives) {
    Write-Host "`nTraitement de : $($archive.Name)"
    
    # Creation d'un sous-dossier pour chaque archive
    $currentExtractDir = Join-Path $extractDir $archive.BaseName
    New-Item -ItemType Directory -Force -Path $currentExtractDir | Out-Null
    
    $extension = [System.IO.Path]::GetExtension($archive.FullName).ToLower()
    
    # Extraction selon le format
    if ($extension -eq '.cbr') {
        $winrarPath = Find-WinRAR
        if (-not $winrarPath) {
            Write-Host 'WinRAR n''est pas installe ou introuvable.'
            continue
        }
        Write-Host "Utilisation de WinRAR : $winrarPath"
        Start-Process -NoNewWindow -Wait -FilePath $winrarPath -ArgumentList "x `"$($archive.FullName)`" `"$currentExtractDir`"" -ErrorAction Stop
    } elseif ($extension -eq '.cbz') {
        $7zPath = Find-7Zip
        if (-not $7zPath) {
            Write-Host '7-Zip n''est pas installe ou introuvable.'
            continue
        }
        Write-Host "Utilisation de 7-Zip : $7zPath"
        Start-Process -NoNewWindow -Wait -FilePath $7zPath -ArgumentList "x `"$($archive.FullName)`" -o`"$currentExtractDir`" -y" -ErrorAction Stop
    }
    
    # Recherche des images extraites
    $extractedFiles = Get-ChildItem "$currentExtractDir" -File -Recurse | Where-Object { $_.Extension -match '\.(jpg|png|webp)$' }
    if (-not $extractedFiles) {
        Write-Host 'Aucune image trouvee apres extraction.'
        continue
    }
    
    # Selection de la premiere image pertinente
    $firstImage = $extractedFiles | Where-Object { $_.Name -notmatch 'thumb|cover_small' } | Sort-Object Name | Select-Object -First 1
    
    if (-not $firstImage) {
        Write-Host 'Aucune image valide trouvee apres extraction.'
        continue
    }
    
    Write-Host "Premiere image trouvee : $($firstImage.Name)"
    
    $outputImage = "$($archive.BaseName).webp"
    
    # Conversion en WebP si necessaire
    if ($firstImage.Extension -eq '.webp') {
        Write-Host 'L''image est deja en WebP, copie directe.'
        Copy-Item -Path $firstImage.FullName -Destination $outputImage -Force
    } else {
        if (-not (Get-Command 'magick.exe' -ErrorAction SilentlyContinue)) {
            Write-Host 'ImageMagick n''est pas installe.'
            continue
        }
        Write-Host 'Conversion en WebP...'
        $magickArgs = "`"$($firstImage.FullName)`" -quality 90 `"$outputImage`""
        Start-Process -NoNewWindow -Wait -FilePath 'magick.exe' -ArgumentList $magickArgs -ErrorAction Stop
    }
    
    Write-Host "Traitement termine : $outputImage"
}

Write-Host "`nTraitement de tous les fichiers termine."
