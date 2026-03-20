import glob
import os

count = 0
for htmlpath in glob.iglob('**/*.html', recursive=True):
    depth = htmlpath.count('/')
    prefix = '../' * depth if depth > 0 else ''
    script_path = f"{prefix}assets/js/titan-ai-assistant.js"
    
    try:
        with open(htmlpath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if 'titan-ai-assistant.js' not in content:
            tag = f'\n<!-- TITAN AI ASSISTANT -->\n<script src="{script_path}"></script>\n'
            # Insert before </body>
            if '</body>' in content:
                content = content.replace('</body>', tag + '</body>')
                
                with open(htmlpath, 'w', encoding='utf-8') as f:
                    f.write(content)
                count += 1
    except Exception as e:
        print(f"Skipped {htmlpath} due to error: {e}")

print(f"Injected AI Assistant into {count} HTML files.")
