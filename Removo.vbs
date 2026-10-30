Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")
AppDir = FSO.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = AppDir
PythonExe = "C:\Users\Dako9\AppData\Local\Programs\Python\Python312\python.exe"
If Not FSO.FileExists(PythonExe) Then
    PythonExe = "python.exe"
End If
WshShell.Run """" & PythonExe & """ """ & AppDir & "\main.py""", 0, False
Set WshShell = Nothing
