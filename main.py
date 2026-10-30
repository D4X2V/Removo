import os
import sys
import time
import socket
import threading
import subprocess
import webbrowser
from pathlib import Path

# Safe UTF-8 encoding for Windows terminals
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

PORT = 8765
URL = f"http://127.0.0.1:{PORT}"

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def start_server():
    import uvicorn
    from backend.server import app
    config = uvicorn.Config(app, host="127.0.0.1", port=PORT, log_level="warning")
    server = uvicorn.Server(config)
    server.run()

def launch_desktop_window():
    # Wait for server to come online
    for _ in range(30):
        if is_port_in_use(PORT):
            break
        time.sleep(0.2)

    # Candidate browsers with native --app mode
    browser_paths = [
        r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    ]

    launched = False
    for path in browser_paths:
        if os.path.exists(path):
            try:
                cmd = [
                    path,
                    f"--app={URL}",
                    "--window-size=1366,880",
                    "--app-launch-url-for-shortcuts-menu-item=false"
                ]
                subprocess.Popen(cmd)
                launched = True
                print(f"[VioletCut AI] Ventana de escritorio iniciada con: {Path(path).name}")
                break
            except Exception as e:
                print(f"Error launching {path}: {e}")

    if not launched:
        print(f"[VioletCut AI] Abriendo en navegador predeterminado: {URL}")
        webbrowser.open(URL)

if __name__ == "__main__":
    print("=" * 60)
    print("  [VioletCut AI Studio] Recorte Ultra-Preciso")
    print(f"  Iniciando servidor local en: {URL}")
    print("=" * 60)

    # Launch desktop window in a background thread
    threading.Thread(target=launch_desktop_window, daemon=True).start()

    # Run uvicorn in the main thread
    import uvicorn
    from backend.server import app
    uvicorn.run(app, host="127.0.0.1", port=PORT, log_level="info")

