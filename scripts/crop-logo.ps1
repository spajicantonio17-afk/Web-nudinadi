Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Image]::FromFile("C:\Users\spaji\Desktop\NudiNadi\nudinadi\public\Logo.jpeg")

# Crop the emblem only — no text
$cropRect = New-Object System.Drawing.Rectangle(115, 355, 170, 245)
$cropped = $img.Clone($cropRect, $img.PixelFormat)

$outPath = "C:\Users\spaji\Desktop\NudiNadi\nudinadi\public\logo-emblem.png"
$cropped.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

Write-Output "Emblem saved to: $outPath"
Write-Output "Cropped size: $($cropped.Width) x $($cropped.Height)"

$cropped.Dispose()
$img.Dispose()
