import sqlite3, base64, blackboxprotobuf, json, os, time, copy
from datetime import datetime

brain_dir = "/Users/linuxzhou/.gemini/antigravity/brain"
conv_dir = "/Users/linuxzhou/.gemini/antigravity/conversations"
DB_PATH = "/Users/linuxzhou/Library/Application Support/Antigravity/User/globalStorage/state.vscdb"
FIXED_DB = "/Users/linuxzhou/Desktop/state.vscdb.fixed"
WORKSPACE_URI = b"file:///Users/linuxzhou/Desktop/github/ai-playground"

def get_uuids_sorted():
    uuids = [u for u in os.listdir(brain_dir) if not u.startswith('.')]
    uuids_with_time = []
    for u in uuids:
        pb_path = os.path.join(conv_dir, f"{u}.pb")
        mtime = os.path.getmtime(pb_path) if os.path.exists(pb_path) else 0
        uuids_with_time.append((u, mtime))
    uuids_with_time.sort(key=lambda x: x[1], reverse=True)
    return [u[0] for u in uuids_with_time]

def get_template():
    conn = sqlite3.connect(FIXED_DB)
    c = conn.cursor()
    c.execute("SELECT value FROM ItemTable WHERE key = 'antigravityUnifiedStateSync.trajectorySummaries'")
    row = c.fetchone()
    conn.close()
    val_str = json.loads(row[0]) if row[0].startswith('"') else row[0]
    decoded = base64.b64decode(val_str)
    msg, typedef = blackboxprotobuf.decode_message(decoded)
    # 取列表中第一个作为模板
    template_item = msg.get('1', [])[0]
    
    inner_b64 = template_item['2']['1']
    inner_decoded = base64.b64decode(inner_b64)
    inner_msg, inner_typedef = blackboxprotobuf.decode_message(inner_decoded)
    return inner_msg, inner_typedef

def create_summary_protobuf(uuid, title, timestamp, template_inner_msg, inner_typedef):
    inner_msg = copy.deepcopy(template_inner_msg)
    # Update title
    inner_msg['1'] = title.encode('utf-8')
    if '15' in inner_msg and '1' in inner_msg['15']:
        inner_msg['15']['1'] = title.encode('utf-8')
        
    # Update exact references from /Users/zhoulin to /Users/linuxzhou
    def fix_path(b: bytes):
        if isinstance(b, bytes):
            return b.replace(b'/Users/zhoulin/', b'/Users/linuxzhou/')
        return b
        
    inner_msg['9']['1'] = fix_path(inner_msg['9']['1'])
    inner_msg['9']['2'] = fix_path(inner_msg['9']['2'])
    inner_msg['17']['1']['1'] = fix_path(inner_msg['17']['1']['1'])
    inner_msg['17']['1']['2'] = fix_path(inner_msg['17']['1']['2'])
    inner_msg['17']['7'] = fix_path(inner_msg['17']['7'])
    
    # Update UUID
    inner_msg['4'] = uuid.encode('utf-8')
    inner_msg['17']['3'] = uuid.encode('utf-8')
    
    # Update Timestamps
    ts_sec = int(timestamp)
    if '3' in inner_msg:
        inner_msg['3']['1'] = ts_sec
    if '7' in inner_msg:
        inner_msg['7']['1'] = ts_sec
    if '10' in inner_msg:
        inner_msg['10']['1'] = ts_sec
    if '15' in inner_msg and '7' in inner_msg['15']:
        inner_msg['15']['7']['1'] = ts_sec
    if '17' in inner_msg and '2' in inner_msg['17']:
        inner_msg['17']['2']['1'] = ts_sec
        
    inner_encoded = blackboxprotobuf.encode_message(inner_msg, inner_typedef)
    inner_b64 = base64.b64encode(inner_encoded)
    
    return {
        '1': uuid.encode('utf-8'),
        '2': {
            '1': inner_b64
        }
    }

def main():
    uuids = get_uuids_sorted()
    template_inner_msg, inner_typedef = get_template()
    
    data_list = []
    for idx, u in enumerate(uuids):
        pb_path = os.path.join(conv_dir, f"{u}.pb")
        mtime = os.path.getmtime(pb_path) if os.path.exists(pb_path) else time.time()
        dt = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d %H:%M')
        title = f"Project Session - {dt}"
        data_list.append(create_summary_protobuf(u, title, mtime, template_inner_msg, inner_typedef))

    top_msg = {'1': data_list}
    # typed def
    top_typedef = {
        '1': {
            'type': 'message',
            'name': '',
            'message_typedef': {
                '1': {'type': 'bytes', 'name': ''},
                '2': {
                    'type': 'message',
                    'name': '',
                    'message_typedef': {
                        '1': {'type': 'bytes', 'name': ''}
                    }
                }
            }
        }
    }
    top_encoded = blackboxprotobuf.encode_message(top_msg, top_typedef)
    top_b64 = base64.b64encode(top_encoded).decode('utf-8')
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("UPDATE ItemTable SET value = ? WHERE key = 'antigravityUnifiedStateSync.trajectorySummaries'", (json.dumps(top_b64),))
    conn.commit()
    conn.close()
    print("Fixed trajectorySummaries written.")

if __name__ == '__main__':
    main()
