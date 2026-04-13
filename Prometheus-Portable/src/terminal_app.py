import sys
import os
import time
import subprocess
import threading
import re
import qrcode
import shutil

# Config
if getattr(sys, 'frozen', False):
    # Running as PyInstaller bundle
    BASE_DIR = sys._MEIPASS
    PROJECT_ROOT = sys._MEIPASS
else:
    # Running as script
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    PROJECT_ROOT = os.path.dirname(BASE_DIR)

SERVER_SCRIPT = os.path.join(BASE_DIR, 'server.py')
# Install cloudflared to user's home dir to avoid permission issues in /tmp or bundle
USER_BIN_DIR = os.path.join(os.path.expanduser("~"), ".prometheus", "bin")
CLOUDFLARED_BIN = os.path.join(USER_BIN_DIR, 'cloudflared')

# Import server module (must be in path)
sys.path.append(BASE_DIR)
import server

# Colors
CYAN = '\033[96m'
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
BOLD = '\033[1m'
RESET = '\033[0m'

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def print_banner():
    print(f"{CYAN}{BOLD}")
    print("╔════════════════════════════════════════╗")
    print("║        PROMETHEUS UPLINK SYSTEM        ║")
    print("╚════════════════════════════════════════╝")
    print(f"{RESET}")

def install_cloudflared():
    print(f"{YELLOW}⬇️  Downloading Cloudflare Tunnel engine...{RESET}")
    os.makedirs(USER_BIN_DIR, exist_ok=True)
    
    url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz"
    if os.uname().machine == 'arm64':
        url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-arm64.tgz"
    
    # Download to temp then move
    subprocess.run(f"curl -L {url} -o cf.tgz && tar -xzf cf.tgz && mv cloudflared '{CLOUDFLARED_BIN}' && rm cf.tgz", 
                  shell=True, cwd=USER_BIN_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    if os.path.exists(CLOUDFLARED_BIN):
        print(f"{GREEN}✅ Installed to {CLOUDFLARED_BIN}!{RESET}")
    else:
        print(f"{RED}❌ Install Failed.{RESET}")
        wait_exit(1)

def wait_exit(code=0):
    input("\nPress Enter to exit...")
    sys.exit(code)

def main():
    try:
        global CLOUDFLARED_BIN
        clear_screen()
        print_banner()

        # 0. Global Exception Handler for PyInstaller
        # ...

        # 1. Check Dependencies
        if not os.path.exists(CLOUDFLARED_BIN):
            # Try finding in path
            if shutil.which('cloudflared'):
                CLOUDFLARED_BIN = shutil.which('cloudflared')
            else:
                install_cloudflared()

        # 2. Start Python Server (Threaded)
        print("🐍 Starting Core Server...", end="\r")
        server_thread = threading.Thread(target=server.run_server, daemon=True)
        server_thread.start()
        time.sleep(1) # Wait for server init
        print(f"{GREEN}✓ Core Server Running       {RESET}")

        # 3. Start Cloudflare Tunnel
        print("☁️  Requesting Secure Link...", end="\r")
        
        # Capture stderr for URL
        cf_process = subprocess.Popen(
            [CLOUDFLARED_BIN, "tunnel", "--url", "http://localhost:3000"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            encoding='utf-8',
            bufsize=1,
            universal_newlines=True
        )

        public_url = None
        url_pattern = re.compile(r'https://[a-zA-Z0-9-]+\.trycloudflare\.com')

        try:
            while True:
                line = cf_process.stdout.readline()
                if not line: break
                
                match = url_pattern.search(line)
                if match:
                    public_url = match.group(0)
                    break
            
            if public_url:
                clear_screen()
                print_banner()
                print(f"\n{GREEN}🚀 SYSTEM ONLINE{RESET}")
                print(f"{YELLOW}Scan this QR code from ANY device:{RESET}\n")
                
                qr = qrcode.QRCode(border=2)
                qr.add_data(public_url)
                qr.make(fit=True)
                qr.print_ascii(invert=True)
                
                print(f"\n{BOLD}Link: {CYAN}{public_url}{RESET}")
                print("\n" + "="*42)
                print(f"{YELLOW}Press [CTRL+C] to Exit{RESET}")

                cf_process.wait()
            else:
                print(f"{RED}❌ Could not generate URL.{RESET}")
                print("Output:")
                print(cf_process.stdout.read())
                wait_exit(1)

        except KeyboardInterrupt:
            print(f"\n\n{YELLOW}🛑 Shutting down...{RESET}")
        finally:
            cf_process.terminate()
            print("Bye!")
            
    except Exception as e:
        print(f"\n{RED}🔥 CRITICAL ERROR: {str(e)}{RESET}")
        import traceback
        traceback.print_exc()
        wait_exit(1)

if __name__ == "__main__":
    main()
