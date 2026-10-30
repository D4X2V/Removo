import subprocess

ps_script = r"""
$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$ShortcutPath = Join-Path $DesktopPath "Removo.lnk"
$TargetDir = "C:\Users\Dako9\.gemini\antigravity\scratch\Removo"
$TargetFile = Join-Path $TargetDir "Removo.vbs"
$IconFile = Join-Path $TargetDir "assets\app.ico"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetFile
$Shortcut.WorkingDirectory = $TargetDir
$Shortcut.IconLocation = "$IconFile,0"
$Shortcut.Description = "Removo - Local Background Removal"
$Shortcut.Save()
Write-Host "Shortcut created: $ShortcutPath"
"""

if __name__ == "__main__":
    res = subprocess.run(
        ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps_script],
        capture_output=True,
        text=True
    )
    print(res.stdout.strip())
    if res.stderr:
        print(res.stderr.strip())
