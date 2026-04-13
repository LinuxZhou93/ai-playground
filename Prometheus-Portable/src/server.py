import http.server
import socketserver
import subprocess
import json
import os
import socket
import mimetypes
import base64
import time # Needed for sleep
import ctypes
import ctypes.util

# [PERFORMANCE] CoreGraphics C-Bindings (Zero Latency)
# This bypasses the need for 'swift' or 'osascript' subprocesses which cause massive lag.
cg = ctypes.cdll.LoadLibrary(ctypes.util.find_library("CoreGraphics"))

# Types & Constants
CGEventRef = ctypes.c_void_p
CGEventSourceRef = ctypes.c_void_p
CGMouseButton = ctypes.c_uint32
CGEventType = ctypes.c_uint32
CGEventTapLocation = ctypes.c_uint32

kCGEventLeftMouseDown = 1
kCGEventLeftMouseUp = 2
kCGEventScrollWheel = 22
kCGMouseButtonLeft = 0
kCGHIDEventTap = 0 # kCGHIDEventTap
kCGSessionEventTap = 1

# Struct for CGPoint (x, y) - CGFloat is double on 64bit
class CGPoint(ctypes.Structure):
    _fields_ = [("x", ctypes.c_double), ("y", ctypes.c_double)]

# Function Signatures
cg.CGEventCreateMouseEvent.argtypes = [CGEventSourceRef, CGEventType, CGPoint, CGMouseButton]
cg.CGEventCreateMouseEvent.restype = CGEventRef

# CGEventCreateScrollWheelEvent2(source, units, wheelCount, wheel1, wheel2, wheel3)
# units: kCGScrollEventUnitPixel (0) or kCGScrollEventUnitLine (1)
cg.CGEventCreateScrollWheelEvent2.argtypes = [CGEventSourceRef, ctypes.c_uint32, ctypes.c_uint32, ctypes.c_int32, ctypes.c_int32, ctypes.c_int32]
cg.CGEventCreateScrollWheelEvent2.restype = CGEventRef

cg.CGEventPost.argtypes = [CGEventTapLocation, CGEventRef]
cg.CGEventPost.restype = None

cg.CGEventSetIntegerValueField.argtypes = [CGEventRef, ctypes.c_uint32, ctypes.c_int64]
cg.CGEventSetIntegerValueField.restype = None

def native_click(x, y):
    pt = CGPoint(float(x), float(y))
    # Down
    e1 = cg.CGEventCreateMouseEvent(None, kCGEventLeftMouseDown, pt, kCGMouseButtonLeft)
    cg.CGEventPost(kCGHIDEventTap, e1)
    # Up
    e2 = cg.CGEventCreateMouseEvent(None, kCGEventLeftMouseUp, pt, kCGMouseButtonLeft)
    cg.CGEventPost(kCGHIDEventTap, e2)

def native_double_click(x, y):
    """Execute a native double-click at the specified coordinates"""
    pt = CGPoint(float(x), float(y))
    
    # Create double-click event with click count = 2
    # Reference: https://developer.apple.com/documentation/coregraphics/1456527-cgeventsetintegervaluefield
    kCGMouseEventClickState = 1
    
    # First click (count=1)
    e1_down = cg.CGEventCreateMouseEvent(None, kCGEventLeftMouseDown, pt, kCGMouseButtonLeft)
    cg.CGEventSetIntegerValueField(e1_down, kCGMouseEventClickState, 1)
    cg.CGEventPost(kCGHIDEventTap, e1_down)
    
    e1_up = cg.CGEventCreateMouseEvent(None, kCGEventLeftMouseUp, pt, kCGMouseButtonLeft)
    cg.CGEventSetIntegerValueField(e1_up, kCGMouseEventClickState, 1)
    cg.CGEventPost(kCGHIDEventTap, e1_up)
    
    # Second click (count=2) - This is the key!
    e2_down = cg.CGEventCreateMouseEvent(None, kCGEventLeftMouseDown, pt, kCGMouseButtonLeft)
    cg.CGEventSetIntegerValueField(e2_down, kCGMouseEventClickState, 2)
    cg.CGEventPost(kCGHIDEventTap, e2_down)
    
    e2_up = cg.CGEventCreateMouseEvent(None, kCGEventLeftMouseUp, pt, kCGMouseButtonLeft)
    cg.CGEventSetIntegerValueField(e2_up, kCGMouseEventClickState, 2)
    cg.CGEventPost(kCGHIDEventTap, e2_up)

def native_scroll(dy, dx=0):
    # dy: positive = scroll up (wheel up)
    # ScrollWheelEvent2 args: source, units (1=line), wheelCount, wheel1(Y), wheel2(X), wheel3
    e = cg.CGEventCreateScrollWheelEvent2(None, 1, 2, int(dy), int(dx), 0)
    cg.CGEventPost(kCGHIDEventTap, e)

USE_PYNPUT = False # Disabled in favor of Native ctypes

PORT = 3000
# Ensure we get the absolute path to public dir
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')

print(f"Server Root: {BASE_DIR}")
print(f"Public Dir: {PUBLIC_DIR}")

class PrometheusHandler(http.server.BaseHTTPRequestHandler):
    def check_auth(self):
        # [SECURITY] Auth disabled by user request
        return True

    def send_auth_request(self):
        self.send_response(401)
        self.send_header('WWW-Authenticate', 'Basic realm="Prometheus Uplink"')
        self.end_headers()
        self.wfile.write(b'Unauthorized')

    def do_GET(self):
        if not self.check_auth():
            return

        # 1. Handle API
        if self.path.startswith('/api/status'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            status = {
                'status': 'online',
                'system': os.name,
                'cwd': os.getcwd(),
                'version': '2.0-Agentic'
            }
            self.wfile.write(json.dumps(status).encode())
            return

        if self.path.startswith('/api/view'):
            # Legacy single-shot view (redirect to stream or keep for compatibility)
            # Keeping for compatibility but users should use stream
            tmp_path = '/tmp/prometheus_view.jpg'
            subprocess.run(['screencapture', '-x', '-t', 'jpg', tmp_path], check=False)
            if os.path.exists(tmp_path):
                subprocess.run(['sips', '--resampleWidth', '1024', '-s', 'formatOptions', '50', tmp_path], 
                             check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                with open(tmp_path, 'rb') as f:
                    content = f.read()
                    self.send_response(200)
                    self.send_header('Content-type', 'image/jpeg')
                    self.send_header('Cache-Control', 'no-cache') 
                    self.end_headers()
                    self.wfile.write(content)
            else:
                self.send_error(500, "Screenshot failed")
            return

        # [LOW-LATENCY] Native Sync Mode (Return to Original Speed)
        if self.path.startswith('/api/stream'):
            if not self.check_auth(): return 

            self.send_response(200)
            self.send_header('Content-type', 'multipart/x-mixed-replace; boundary=frame')
            # Critical: Tell proxies NOT to buffer the stream
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            self.send_header('X-Accel-Buffering', 'no')
            self.end_headers()

            import threading
            tmp_path = f'/tmp/prom_{threading.get_ident()}.jpg'

            try:
                while True:
                    start_time = time.time()
                    
                    # 1. Use Native Screencapture (As per user's original fast version)
                    # Use lower quality (50) and smaller width (1024) for instant transmission
                    subprocess.run(['screencapture', '-x', '-t', 'jpg', tmp_path], check=False)
                    
                    if os.path.exists(tmp_path):
                        # Optimize image for the tunnel
                        subprocess.run(['sips', '--resampleWidth', '1024', '-s', 'formatOptions', 'low', tmp_path], 
                                     check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                        
                        with open(tmp_path, 'rb') as f:
                            content = f.read()
                        
                        # 2. Push Frame
                        self.wfile.write(b'--frame\r\n')
                        self.send_header('Content-Type', 'image/jpeg')
                        self.send_header('Content-Length', str(len(content)))
                        self.end_headers()
                        self.wfile.write(content)
                        self.wfile.write(b'\r\n')
                        
                        # Clean up
                        os.remove(tmp_path)

                        # 3. Dynamic FPS Control: Wait just enough to keep the tunnel clear
                        # Target 10 FPS = 0.1s total time.
                        elapsed = time.time() - start_time
                        wait = max(0.01, 0.1 - elapsed)
                        time.sleep(wait)
                    else:
                        time.sleep(0.5)
            except (BrokenPipeError, ConnectionResetError):
                pass
            except Exception as e:
                print(f"Sync error: {e}")
            finally:
                if os.path.exists(tmp_path): os.remove(tmp_path)
            return

        # 2. Handle Static Files
        try:
            # Clean path
            path = self.path.split('?')[0]
            if path == '/':
                path = '/index.html'
            
            # Prevent directory traversal
            path = path.lstrip('/')
            
            # Construct full system path
            file_path = os.path.join(PUBLIC_DIR, path)
            
            # Verify file is within PUBLIC_DIR
            if not os.path.abspath(file_path).startswith(PUBLIC_DIR):
                self.send_error(403, "Forbidden")
                return

            if os.path.exists(file_path) and os.path.isfile(file_path):
                # Guess mimetype
                mime_type, _ = mimetypes.guess_type(file_path)
                if mime_type is None:
                    mime_type = 'application/octet-stream'
                
                # Serve file
                with open(file_path, 'rb') as f:
                    content = f.read()
                    self.send_response(200)
                    self.send_header('Content-type', mime_type)
                    self.send_header('Content-Length', str(len(content)))
                    self.end_headers()
                    self.wfile.write(content)
            else:
                with open('/tmp/server_debug.log', 'a') as debug_f:
                    debug_f.write(f"404 Error:\n")
                    debug_f.write(f"  Public Dir: {PUBLIC_DIR}\n")
                    debug_f.write(f"  Request Path: {path}\n")
                    debug_f.write(f"  Full Path: {file_path}\n")
                    debug_f.write(f"  Exists: {os.path.exists(file_path)}\n")
                    debug_f.write(f"  IsFile: {os.path.isfile(file_path)}\n")
                    debug_f.write(f"  Abs Public: {os.path.abspath(PUBLIC_DIR)}\n")
                    debug_f.write(f"  Abs File: {os.path.abspath(file_path)}\n\n")
                
                self.send_error(404, f"File Not Found: {path}")

        except Exception as e:
            with open('/tmp/server_debug.log', 'a') as debug_f:
                debug_f.write(f"500 Error: {str(e)}\n")
            self.send_error(500, f"Internal Server Error: {str(e)}")

    def do_POST(self):
        if not self.check_auth():
            return

        if self.path == '/api/cmd':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode())
                command = data.get('command')
                
                print(f"[CMD] Executing: {command}")
                
                # Execute command in the PROJECT ROOT (not mobile-uplink subdir)
                # We assume mobile-uplink is a subdir of the workspace
                project_root = os.path.dirname(BASE_DIR)
                
                result = subprocess.run(
                    command, 
                    shell=True, 
                    cwd=project_root,
                    capture_output=True, 
                    text=True
                )
                
                response = {
                    'output': result.stdout,
                    'error': result.stderr,
                    'status': 'success' if result.returncode == 0 else 'error'
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())

        elif self.path == '/api/type':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode())
                text = data.get('text')
                
                print(f"[TYPE] Injecting: {text}")
                
                # AppleScript to type text into the active window
                # Using Bundle ID is more robust than name
                script = f'''
                try
                    set the clipboard to "{text}"
                    delay 0.1
                    tell application "System Events"
                        keystroke "v" using command down
                        delay 0.1
                        key code 36
                    end tell
                    return "success"
                on error errMsg
                    return "error: " & errMsg
                end try
                '''
                
                # Run and capture output
                proc = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)
                
                print(f"[TYPE] Result: {proc.stdout.strip()}")
                if proc.stderr:
                    print(f"[TYPE] Stderr: {proc.stderr.strip()}")

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'status': 'sent',
                    'debug_stdout': proc.stdout,
                    'debug_stderr': proc.stderr
                }).encode())
                
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())

        elif self.path == '/api/click':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode())
                rel_x = float(data.get('x'))
                rel_y = float(data.get('y'))
                
                # Get screen resolution via AppleScript
                res_script = 'tell application "Finder" to get bounds of window of desktop'
                res = subprocess.run(['osascript', '-e', res_script], capture_output=True, text=True).stdout.strip()
                # res format: 0, 0, 1920, 1080
                parts = res.split(', ')
                if len(parts) == 4:
                    screen_w = int(parts[2])
                    screen_h = int(parts[3])
                    
                    # Calculate target pixels
                    target_x = int(rel_x * screen_w)
                    target_y = int(rel_y * screen_h)
                    
                    print(f"[CLICK] at {target_x}, {target_y}")
                    
                    print(f"[CLICK] at {target_x}, {target_y}")
                    
                    try:
                        native_click(target_x, target_y)
                    except Exception as e:
                        print(f"Native Click Failed: {e}")
                        # Final Fallback (Unlikely needed)
                        pass
                    
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'status': 'clicked'}).encode())
                else:
                    raise Exception("Could not detect screen resolution")
                    
            except Exception as e:
                print(f"Click Error: {e}")
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())

        elif self.path == '/api/scroll':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode())
                direction = data.get('direction')
                
                # Map direction to key codes
                # Up: 126, Down: 125, Left: 123, Right: 124
                # Note: "Slide Up" (finger moves up) usually means content moves down (Scroll Down) -> Key Down (125)
                # But let's stick to logical names from frontend. 
                # Frontend will send "down" if it wants to scroll down.
                
                # Native Scroll Implementation
                try:
                    delta_y = 0
                    delta_x = 0
                    amount = 2  # Sensitivity
                    
                    if direction == 'up':
                        delta_y = amount
                    elif direction == 'down':
                        delta_y = -amount
                    elif direction == 'left':
                        delta_x = amount
                    elif direction == 'right':
                        delta_x = -amount
                        
                    native_scroll(delta_y, delta_x)
                    
                except Exception as e:
                    print(f"Scroll Error: {e}")
                
                self.send_response(200)
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'scrolled'}).encode())

            except Exception as e:
                print(f"Scroll Error: {e}")
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())

        elif self.path == '/api/doubleclick':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode())
                rel_x = float(data.get('x'))
                rel_y = float(data.get('y'))
                
                # Get screen resolution
                res_script = 'tell application "Finder" to get bounds of window of desktop'
                res = subprocess.run(['osascript', '-e', res_script], capture_output=True, text=True).stdout.strip()
                parts = res.split(', ')
                if len(parts) == 4:
                    screen_w = int(parts[2])
                    screen_h = int(parts[3])
                    
                    target_x = int(rel_x * screen_w)
                    target_y = int(rel_y * screen_h)
                    
                    print(f"[DOUBLE CLICK] at {target_x}, {target_y}")
                    
                    try:
                        native_double_click(target_x, target_y)
                    except Exception as e:
                        print(f"Native Double Click Failed: {e}")
                    
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'status': 'double-clicked'}).encode())
                else:
                    raise Exception("Could not detect screen resolution")
                    
            except Exception as e:
                print(f"Double Click Error: {e}")
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

Handler = PrometheusHandler

def run_server():
    print(f"\n🚀 Prometheus Uplink Online (Python Fixed)")
    print(f"📂 Serving from: {PUBLIC_DIR}")
    print(f"📱 Connect via Phone: http://{get_ip()}:{PORT}")
    print(f"💻 Local Access: http://localhost:{PORT}\n")

    # Use ThreadingTCPServer to handle multiple connections (Stream + Click)
    class ThreadingHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
        allow_reuse_address = True
        daemon_threads = True

    with ThreadingHTTPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down...")

if __name__ == "__main__":
    run_server()
