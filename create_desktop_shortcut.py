import os
import sys
from pathlib import Path

def make_shortcut():
    import win32com.client # if available, or use powershell / wscript
    pass

# We will use PowerShell script or WScript to make a 100% reliable shortcut
ps_script = r"""
$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$ShortcutPath = Join-Path $DesktopPath "VioletCut AI.lnk"
$TargetDir = "C:\Users\Dako9\.gemini\antigravity\scratch\VioletCut-AI"
$TargetFile = Join-Path $TargetDir "launch.bat"
$IconFile = Join-Path $TargetDir "assets\app.ico"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetFile
$Shortcut.WorkingDirectory = $TargetDir
$Shortcut.IconLocation = "$IconFile,0"
$Shortcut.Description = "VioletCut AI Studio - Recorte Ultra-Preciso"
$Shortcut.Save()
Write-Host "Acceso directo creado exitosamente en: $ShortcutPath"
"""

if __name__ == "__main__":
    import subprocess
    cmd = ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps_script]
    res = subprocess.run(cmd, capture_output=True, text=True)
    print(res.stdout)
    if res.stderr:
        print("Error:", res.stderr)
