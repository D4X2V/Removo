import os
import sys
import time
import socket
import threading
import subprocess
import webbrowser
from pathlib import Path

if sys.stdout and sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

PORT = 8765
URL = f"http://127.0.0.1:{PORT}"

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def launch_desktop_window():
    for _ in range(40):
        if is_port_in_use(PORT):
            break
        time.sleep(0.15)

    browser_paths = [
        r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    ]

    for path in browser_paths:
        if os.path.exists(path):
            try:
                subprocess.Popen([
                    path,
                    f"--app={URL}",
                    "--window-size=1320,860"
                ])
                return
            except Exception:
                pass

    webbrowser.open(URL)

if __name__ == "__main__":
    print(f"[Removo] Starting local server at {URL}")
    threading.Thread(target=launch_desktop_window, daemon=True).start()

    import uvicorn
    from backend.server import app
    uvicorn.run(app, host="127.0.0.1", port=PORT, log_level="warning")
