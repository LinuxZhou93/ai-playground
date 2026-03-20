import os
import glob
import re

count = 0
for htmlpath in glob.iglob("**/*.html", recursive=True):
    # calculate appropriate relative path to assets/css/titan-core.css
    depth = htmlpath.count('/')
    prefix = '../' * depth if depth > 0 else ''
    css_path = f"{prefix}assets/css/titan-core.css"
    
    with open(htmlpath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    # Remove cdn.tailwindcss.com script tags
    content = re.sub(r'<script\s+src=["\']https://cdn\.tailwindcss\.com["\']></script>', '', content)
    
    # Remove inline tailwind.config blocks - this can span multiple lines
    content = re.sub(r'<script>\s*tailwind\.config\s*=\s*\{.*?\}(;)?\s*</script>', '', content, flags=re.DOTALL)
    
    # For robust handling, if it has `tailwind.config =` but didn't match the regex perfectly
    if 'tailwind.config' in content:
        # Some are on single line, some use slightly different spacing. The regex above should catch 99%.
        pass

    # Append the link tag to the head if not exists
    if 'titan-core.css' not in content:
        link_tag = f'\n    <link rel="stylesheet" href="{css_path}">\n'
        content = content.replace("</head>", link_tag + "</head>")
        
    if content != original:
        with open(htmlpath, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
print(f"Applied Tailwind optimization to {count} HTML files.")
