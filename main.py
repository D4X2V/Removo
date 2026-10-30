import os
import sys
import time
import socket
import threading
import subprocess
import webbrowser
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Fix for pythonw.exe where stdout/stderr are None (causes uvicorn logging to crash)
LOG_FILE = BASE_DIR / "removo.log"
if sys.stdout is None:
    sys.stdout = open(LOG_FILE, "a", encoding="utf-8")
elif hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

if sys.stderr is None:
    sys.stderr = open(LOG_FILE, "a", encoding="utf-8")
elif hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

PORT = 8765
URL = f"http://127.0.0.1:{PORT}"

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.3)
        return s.connect_ex(("127.0.0.1", port)) == 0

def launch_desktop_window():
    # Wait until the server is accepting connections
    for _ in range(50):
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
                    "--window-size=1320,860",
                    "--new-window"
                ])
                return
            except Exception:
                pass

    webbrowser.open(URL)

if __name__ == "__main__":
    # If server is already running, just open the window and exit
    if is_port_in_use(PORT):
        launch_desktop_window()
        sys.exit(0)

    threading.Thread(target=launch_desktop_window, daemon=True).start()

    import uvicorn
    from backend.server import app
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=PORT,
        log_config=None
    )
