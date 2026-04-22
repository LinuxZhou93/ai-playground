#!/usr/bin/env python3
"""
下载Cloudflared PKG安装包到桌面
"""
import urllib.request
import os

desktop = os.path.expanduser("~/Desktop")
pkg_file = os.path.join(desktop, "cloudflared-installer.pkg")

print("📥 正在下载Cloudflared安装包到桌面...")
print("这可能需要几分钟,请稍候...")

try:
    # 使用直接的下载链接
    url = "https://github.com/cloudflare/cloudflared/releases/download/2024.12.2/cloudflared-darwin-amd64.pkg"
    
    def show_progress(block_num, block_size, total_size):
        downloaded = block_num * block_size
        percent = min(100, downloaded * 100 / total_size)
        print(f"\r进度: {percent:.1f}% ({downloaded/1024/1024:.1f}MB / {total_size/1024/1024:.1f}MB)", end='')
    
    urllib.request.urlretrieve(url, pkg_file, show_progress)
    print("\n✅ 下载完成!")
    print(f"📦 安装包位置: {pkg_file}")
    print("\n请双击桌面上的 'cloudflared-installer.pkg' 文件进行安装")
    
except Exception as e:
    print(f"\n❌ 下载失败: {e}")
    print("\n请手动下载:")
    print("1. 访问: https://github.com/cloudflare/cloudflared/releases/latest")
    print("2. 下载: cloudflared-darwin-amd64.pkg")
    print("3. 双击安装")
