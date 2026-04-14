import sys
import os
import subprocess
import time
import threading
import tkinter as tk
from tkinter import ttk, messagebox
import qrcode
from PIL import Image, ImageTk

# Configuration Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
CONFIG_FILE = os.path.join(PROJECT_ROOT, '.uplink_config')
NGROK_BIN = os.path.join(PROJECT_ROOT, 'ngrok')
SERVER_SCRIPT = os.path.join(BASE_DIR, 'server.py')

class PrometheusApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Prometheus Uplink (Lite)")
        self.root.geometry("400x550")
        self.root.resizable(False, False)
        
        self.server_process = None
        self.ngrok_process = None
        self.is_running = False
        
        # Styles
        style = ttk.Style()
        style.configure("TButton", padding=6, font=('Helvetica', 12))
        style.configure("TLabel", font=('Helvetica', 11))
        style.configure("Header.TLabel", font=('Helvetica', 16, 'bold'))
        
        # Notebook (Tabs)
        self.notebook = ttk.Notebook(root)
        self.notebook.pack(fill='both', expand=True, padx=10, pady=10)
        
        self.setup_dashboard()
        self.setup_settings()
        
        self.load_config()

    def setup_dashboard(self):
        frame = ttk.Frame(self.notebook)
        self.notebook.add(frame, text="   运行 (Run)   ")
        
        # Status
        self.status_var = tk.StringVar(value="⚫ 准备就绪")
        lbl_status = tk.Label(frame, textvariable=self.status_var, font=('Helvetica', 14, 'bold'), fg='#555')
        lbl_status.pack(pady=20)
        
        # QR Code Container
        self.qr_frame = tk.Frame(frame, bg="white", width=300, height=300, highlightbackground="#ccc", highlightthickness=2)
        self.qr_frame.pack_propagate(False)
        self.qr_frame.pack(pady=10)
        
        self.qr_label = tk.Label(self.qr_frame, bg="white", text="点击启动服务\n生成二维码")
        self.qr_label.pack(expand=True, fill='both')
        
        # Button
        self.btn_action = tk.Button(frame, text="启动服务 (Start)", bg='#007aff', fg='white', 
                                    font=('Helvetica', 14, 'bold'), command=self.toggle_service, borderless=1)
        # Note: bg/fg only works on tk.Button on Mac, not ttk.Button usually. 
        # But mac system python tk might be quirky. Let's use ttk for safety if needed, but tk.Button allows color.
        # We will keep tk.Button for now.
        self.btn_action.pack(pady=20, fill='x', padx=40)

    def setup_settings(self):
        frame = ttk.Frame(self.notebook)
        self.notebook.add(frame, text="   设置 (Config)   ")
        
        ttk.Label(frame, text="Ngrok Configuration", style="Header.TLabel").pack(pady=15)
        
        ttk.Label(frame, text="Authtoken:").pack(anchor='w', padx=20)
        self.entry_token = ttk.Entry(frame, show="•")
        self.entry_token.pack(fill='x', padx=20, pady=5)
        
        ttk.Label(frame, text="Static Domain:").pack(anchor='w', padx=20)
        self.entry_domain = ttk.Entry(frame)
        self.entry_domain.pack(fill='x', padx=20, pady=5)
        
        ttk.Button(frame, text="保存配置 (Save)", command=self.save_config).pack(pady=20)
        
        lbl_help = ttk.Label(frame, text="请从 dashboard.ngrok.com 获取。\n配置将保存在本地。", foreground="#888", justify='center')
        lbl_help.pack(pady=10)

    def load_config(self):
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r') as f:
                    for line in f:
                        if "NGROK_TOKEN" in line:
                            self.entry_token.insert(0, line.split('=')[1].strip().strip('"'))
                        if "NGROK_DOMAIN" in line:
                            self.entry_domain.insert(0, line.split('=')[1].strip().strip('"'))
            except:
                pass

    def save_config(self):
        token = self.entry_token.get().strip()
        domain = self.entry_domain.get().strip()
        if not token or not domain:
            messagebox.showwarning("提示", "两项内容都不能为空！")
            return False
            
        with open(CONFIG_FILE, 'w') as f:
            f.write(f'NGROK_TOKEN="{token}"\n')
            f.write(f'NGROK_DOMAIN="{domain}"\n')
        
        messagebox.showinfo("成功", "配置已保存！")
        return True

    def toggle_service(self):
        if self.is_running:
            self.stop_services()
        else:
            self.start_services()

    def start_services(self):
        token = self.entry_token.get().strip()
        domain = self.entry_domain.get().strip()
        
        if not token or not domain:
            messagebox.showwarning("配置缺失", "请先到'设置'页面填写配置！")
            self.notebook.select(1)
            return

        self.is_running = True
        self.btn_action.config(text="停止服务 (Stop)", bg='#ff3b30')
        self.status_var.set("🟡 启动中...")
        
        threading.Thread(target=self.run_background_tasks, args=(token, domain), daemon=True).start()

    def run_background_tasks(self, token, domain):
        # 1. Auth Ngrok
        subprocess.run([NGROK_BIN, "config", "add-authtoken", token], capture_output=True)
        
        # 2. Server
        self.server_process = subprocess.Popen(
            ["python3", SERVER_SCRIPT],
            cwd=BASE_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        
        # 3. Ngrok
        self.ngrok_process = subprocess.Popen(
            [NGROK_BIN, "http", "--domain=" + domain, "3000"],
            cwd=PROJECT_ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        
        time.sleep(3)
        
        if self.ngrok_process.poll() is None and self.server_process.poll() is None:
            url = f"https://{domain}"
            self.root.after(0, lambda: self.update_ui_running(url))
        else:
            self.stop_services(error="启动失败，请检查配置或日志")

    def update_ui_running(self, url):
        self.status_var.set("🟢 在线 (Online)")
        self.generate_qr(url)

    def stop_services(self, error=None):
        self.is_running = False
        if self.server_process:
            self.server_process.terminate()
            self.server_process = None
        if self.ngrok_process:
            self.ngrok_process.terminate()
            self.ngrok_process = None
            
        self.root.after(0, lambda: self.reset_ui(error))

    def reset_ui(self, error=None):
        self.btn_action.config(text="启动服务 (Start)", bg='#007aff')
        self.status_var.set("⚫ 已停止")
        # Clear QR
        self.qr_label.config(image='', text="点击启动服务\n生成二维码")
        if hasattr(self, 'tk_img'):
            del self.tk_img
            
        if error:
            messagebox.showerror("错误", error)

    def generate_qr(self, data):
        qr = qrcode.QRCode(box_size=8, border=2)
        qr.add_data(data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Resize for display
        img = img.resize((280, 280), Image.Resampling.LANCZOS)
        
        self.tk_img = ImageTk.PhotoImage(img)
        self.qr_label.config(image=self.tk_img, text="")

if __name__ == "__main__":
    root = tk.Tk()
    app = PrometheusApp(root)
    root.mainloop()
