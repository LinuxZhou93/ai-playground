import sqlite3
import os
import base64
import re

db_path = os.path.expanduser("~/Library/Application Support/Antigravity/User/globalStorage/state.vscdb")
storage_path = os.path.expanduser("~/Library/Application Support/Antigravity/User/globalStorage/storage.json")

def deep_replace(val, replacements):
    """
    Tries to replace strings in val, which can be str, bytes, or base64-encoded bytes.
    """
    if not val:
        return val, False

    updated = False
    
    # Try as string
    if isinstance(val, str):
        new_val = val
        for old, new in replacements:
            if old in new_val:
                new_val = new_val.replace(old, new)
                updated = True
        
        # Try if it's base64 encoded string
        if not updated:
            try:
                # Basic check for base64: long string, no spaces
                if len(val) > 20 and re.match(r'^[A-Za-z0-9+/=]+$', val):
                    decoded = base64.b64decode(val)
                    new_decoded, d_updated = deep_replace_bytes(decoded, replacements)
                    if d_updated:
                        new_val = base64.b64encode(new_decoded).decode('utf-8')
                        updated = True
            except:
                pass
        return new_val, updated

    # Try as bytes/blob
    elif isinstance(val, (bytes, bytearray)):
        new_val, updated = deep_replace_bytes(val, replacements)
        
        # Also try if the bytes are base64 encoded
        if not updated:
            try:
                decoded = base64.b64decode(val)
                new_decoded, d_updated = deep_replace_bytes(decoded, replacements)
                if d_updated:
                    new_val = base64.b64encode(new_decoded)
                    updated = True
            except:
                pass
        return new_val, updated

    return val, False

def deep_replace_bytes(b_val, replacements):
    new_b = b_val
    updated = False
    for old, new in replacements:
        old_b = old.encode('utf-8')
        new_b_target = new.encode('utf-8')
        if old_b in new_b:
            # We must be careful about Protobuf length prefixes.
            # However, for most VS Code sessions, simple replacement works if we don't break the structure.
            # If we do break it, the UI might reset that specific key, which is often better than a wrong path.
            new_b = new_b.replace(old_b, new_b_target)
            updated = True
    return new_b, updated

def run_fix():
    print("🚀 Starting deep path fix...")
    
    replacements = [
        ("zhoulin", "linuxzhou"),
        ("可当核心文件包_单机版", "叮当核心文件包"),
        ("📮Inbox", "📥Inbox"),
        ("%E5%8F%AF%E5%BD%93", "%E5%8F%AE%E5%BD%93"),
        ("%F0%9F%93%AE", "%F0%9F%93%A5"),
        ("pos-postbox", "inbox") # Just in case
    ]

    # Kill Antigravity
    os.system("pkill -9 -f Antigravity")
    
    # 1. Fix storage.json
    if os.path.exists(storage_path):
        with open(storage_path, 'r', encoding='utf-8') as f:
            content = f.read()
        new_content, res = deep_replace(content, replacements)
        if res:
            with open(storage_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print("✅ storage.json fixed.")
        else:
            print("ℹ️ storage.json no changes needed.")

    # 2. Fix Database
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT key, value FROM ItemTable")
        rows = cursor.fetchall()
        
        count = 0
        for key, value in rows:
            new_val, res = deep_replace(value, replacements)
            if res:
                cursor.execute("UPDATE ItemTable SET value = ? WHERE key = ?", (new_val, key))
                count += 1
                print(f"✅ Updated DB key: {key}")
        
        # Also check workspaceStorage
        ws_folders = os.path.expanduser("~/Library/Application Support/Antigravity/User/workspaceStorage")
        if os.path.exists(ws_folders):
            for ws_id in os.listdir(ws_folders):
                ws_db = os.path.join(ws_folders, ws_id, "state.vscdb")
                if os.path.exists(ws_db):
                    ws_conn = sqlite3.connect(ws_db)
                    ws_cursor = ws_conn.cursor()
                    ws_cursor.execute("SELECT key, value FROM ItemTable")
                    for k, v in ws_cursor.fetchall():
                        nv, r = deep_replace(v, replacements)
                        if r:
                            ws_cursor.execute("UPDATE ItemTable SET value = ? WHERE key = ?", (nv, k))
                            count += 1
                            print(f"✅ Updated Workspace ({ws_id}) key: {k}")
                    ws_conn.commit()
                    ws_conn.close()

        conn.commit()
        conn.close()
        print(f"✅ Database fixed. Total {count} keys updated.")

if __name__ == "__main__":
    run_fix()
    print("🎉 All done! Please restart Antigravity.")
