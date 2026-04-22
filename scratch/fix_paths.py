import sqlite3
import json
import os
import re
import base64

db_path = os.path.expanduser("~/Library/Application Support/Antigravity/User/globalStorage/state.vscdb")
storage_path = os.path.expanduser("~/Library/Application Support/Antigravity/User/globalStorage/storage.json")

def fix_db():
    print(f"Checking DB: {db_path}")
    if not os.path.exists(db_path):
        print("DB not found")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    replacements = [
        ("zhoulin", "linuxzhou"),
        ("可当核心文件包_单机版", "叮当核心文件包"),
        ("📮Inbox", "📥Inbox"),
        ("%E5%8F%AF%E5%BD%93", "%E5%8F%AE%E5%BD%93"),
        ("%F0%9F%93%AE", "%F0%9F%93%A5")
    ]
    
    cursor.execute("SELECT key, value FROM ItemTable")
    rows = cursor.fetchall()
    
    updated_count = 0
    for key, value in rows:
        if not value:
            continue
            
        new_value = value
        
        # Try both raw bytes and base64 decoded bytes
        is_updated = False
        
        # 1. Try raw bytes replacement (might work for some keys)
        for old_str, new_str in replacements:
            old_bytes = old_str.encode('utf-8')
            new_bytes = new_str.encode('utf-8')
            if isinstance(new_value, bytes) and old_bytes in new_value:
                new_value = new_value.replace(old_bytes, new_bytes)
                is_updated = True
            elif isinstance(new_value, str) and old_str in new_value:
                new_value = new_value.replace(old_str, new_str)
                is_updated = True

        # 2. Try Base64 transition (common for sidebarWorkspaces)
        try:
            # Check if it looks like Base64
            if isinstance(value, (bytes, str)):
                decoded = base64.b64decode(value)
                # If decoded data contains 'zhoulin', it is definitely encoded
                if b"zhoulin" in decoded or b"%E5%8F%AF" in decoded:
                    new_decoded = decoded
                    for old_str, new_str in replacements:
                        new_decoded = new_decoded.replace(old_str.encode('utf-8'), new_str.encode('utf-8'))
                    
                    if new_decoded != decoded:
                        new_value = base64.b64encode(new_decoded)
                        is_updated = True
        except:
            pass

        if is_updated:
            cursor.execute("UPDATE ItemTable SET value = ? WHERE key = ?", (new_value, key))
            updated_count += 1
            print(f"Updated key: {key}")
            
    conn.commit()
    conn.close()
    print(f"DB updated: {updated_count} rows changed.")

def fix_storage_json():
    print(f"Checking storage.json: {storage_path}")
    if not os.path.exists(storage_path):
        print("storage.json not found")
        return
        
    with open(storage_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    replacements = [
        ("zhoulin", "linuxzhou"),
        ("可当核心文件包_单机版", "叮当核心文件包"),
        ("📮Inbox", "📥Inbox"),
        ("%E5%8F%AF%E5%BD%93", "%E5%8F%AE%E5%BD%93"),
        ("%F0%9F%93%AE", "%F0%9F%93%A5")
    ]
    
    new_content = content
    for old, new in replacements:
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(storage_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("storage.json updated.")
    else:
        print("No changes needed in storage.json.")

if __name__ == "__main__":
    # Kill process first
    os.system("pkill -9 -f Antigravity")
    fix_db()
    fix_storage_json()
    print("All fixes completed.")
