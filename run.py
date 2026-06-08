import subprocess
import os
import psutil

def is_running(script_name):
    lock = f"{script_name}.lock"
    if os.path.exists(lock):
        with open(lock) as f:
            try:
                pid = int(f.read().strip())
            except ValueError:
                os.remove(lock)
                return False
        if psutil.pid_exists(pid):
            proc = psutil.Process(pid)
            if proc.is_running() and proc.status() != psutil.STATUS_ZOMBIE:
                return True
        os.remove(lock)
    return False

def launch(script_name, title):
    lock = f"{script_name}.lock"
    proc = subprocess.Popen(
        ["python", script_name],
        creationflags=subprocess.CREATE_NEW_CONSOLE
    )
    with open(lock, "w") as f:
        f.write(str(proc.pid))
    print(f"[INFO] Started '{title}' (PID {proc.pid})")

scripts = [
    ("cron_service.py", "Cron Service"),
    ("main.py", "Main App (OnProb System)"),
]

for script, title in scripts:
    if is_running(script):
        print(f"[SKIP] '{title}' is already running.")
    else:
        launch(script, title)