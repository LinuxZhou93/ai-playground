import sys
import os
import time
import subprocess
import threading
import re
import qrcode
import shutil

# 1. Config & Path Alignment
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
SERVER_SCRIPT = os.path.join(BASE_DIR, 'server.py')
USER_BIN_DIR = os.path.join(os.path.expanduser("~"), ".prometheus", "bin")
CLOUDFLARED_BIN = os.path.join(USER_BIN_DIR, 'cloudflared')

# Use our optimized server logic
sys.path.append(BASE_DIR)
import server

# 2. Terminal Visuals (Original Vibe)
CYAN = '\033[96m'
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
BOLD = '\033[1m'
RESET = '\033[0m'

def clear_screen():
    os.system('clear')

def print_banner():
    print(f"{CYAN}{BOLD}")
    print("╔════════════════════════════════════════╗")
    print("║      PROMETHEUS ULTRA-SYNC SYSTEM      ║")
    print("╚════════════════════════════════════════╝")
    print(f"{RESET}")

def install_cloudflared():
    print(f"{YELLOW}⬇️  Installing Link Engine...{RESET}")
    os.makedirs(USER_BIN_DIR, exist_ok=True)
    url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-arm64.tgz" if os.uname().machine == 'arm64' else "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz"
    subprocess.run(f"curl -L {url} -o cf.tgz && tar -xzf cf.tgz && mv cloudflared '{CLOUDFLARED_BIN}' && rm cf.tgz", shell=True, cwd=USER_BIN_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if os.path.exists(CLOUDFLARED_BIN):
        print(f"{GREEN}✅ Ready!{RESET}")
    else:
        print(f"{RED}❌ Install Failed. Please check net connection.{RESET}")
        sys.exit(1)

def run_background_server():
    # Use our optimized server module
    from server import run_server
    run_server()

def main():
    try:
        global CLOUDFLARED_BIN
        clear_screen()
        print_banner()

        # Check Binary
        if not os.path.exists(CLOUDFLARED_BIN):
            if shutil.which('cloudflared'):
                CLOUDFLARED_BIN = shutil.which('cloudflared')
            else:
                install_cloudflared()

        # Start Optimized Server
        print(f"{YELLOW}🐍 Igniting Core Core (480p Mode)...{RESET}", end="\r")
        server_thread = threading.Thread(target=run_background_server, daemon=True)
        server_thread.start()
        time.sleep(1)
        print(f"{GREEN}✓ Sync Engine: ONLINE         {RESET}")

        # Start Tunnel
        print(f"{YELLOW}☁️  Opening Space-Time Tunnel...{RESET}", end="\r")
        # Bypass PROXY for Cloudflare
        env = os.environ.copy()
        env["HTTP_PROXY"] = ""
        env["HTTPS_PROXY"] = ""
        env["ALL_PROXY"] = ""
        
        cf_process = subprocess.Popen(
            [CLOUDFLARED_BIN, "tunnel", "--url", "http://127.0.0.1:3000"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            encoding='utf-8',
            env=env
        )

        public_url = None
        url_pattern = re.compile(r'https://[a-zA-Z0-9-]+\.trycloudflare\.com')

        # Find the URL in the output stream
        for _ in range(30): # Give it 15 seconds
            line = cf_process.stdout.readline()
            if not line: break
            match = url_pattern.search(line)
            if match:
                public_url = match.group(0)
                break
            time.sleep(0.5)

        if public_url:
            clear_screen()
            print_banner()
            print(f"\n{GREEN}🚀 CONNECTED! REMOTE ACCESS READY{RESET}")
            print(f"{YELLOW}Scan this QR code to Control your Mac:{RESET}\n")
            
            qr = qrcode.QRCode(border=2)
            qr.add_data(public_url)
            qr.make(fit=True)
            qr.print_ascii(invert=True)
            
            print(f"\n{BOLD}Mirror URL: {CYAN}{public_url}{RESET}")
            print("\n" + "═"*42)
            print(f"{YELLOW}Press [CTRL+C] to Disconnect{RESET}")

            # Keep tunnel alive
            cf_process.wait()
        else:
            print(f"\n{RED}❌ Link generation failed. Check your network/proxy.{RESET}")
            cf_process.terminate()

    except KeyboardInterrupt:
        print(f"\n\n{YELLOW}🛑 Shutting down mirror system...{RESET}")
    except Exception as e:
        print(f"\n{RED}🔥 CRITICAL: {e}{RESET}")

if __name__ == "__main__":
    main()
