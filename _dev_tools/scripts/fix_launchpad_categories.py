import re
with open('assets/js/launchpad.js', 'r') as f:
    text = f.read()
# Replace all discovery categories for hub-auto items
text = re.sub(r"link: 'hub-auto-(\d+)\.html',\s*color:\s*'([^']*)',\s*category:\s*'discovery'", 
              r"link: 'hub-auto-\1.html', color: '\2', category: 'academic'", text)
with open('assets/js/launchpad.js', 'w') as f:
    f.write(text)
print("Categories fixed in launchpad.js")
