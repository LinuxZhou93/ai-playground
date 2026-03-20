import re
import glob
from bs4 import BeautifulSoup
import emoji

def parse_module(i):
    hub_file = f"hub-auto-{i}.html"
    try:
        with open(hub_file, "r", encoding='utf-8') as f:
            html = f.read()
    except Exception as e:
        return None
        
    soup = BeautifulSoup(html, "html.parser")
    
    # Extract topic from H1
    h1 = soup.find("h1")
    topic = " ".join(h1.stripped_strings) if h1 else f"Module {i}"
    topic = topic.replace("\n", "").strip()

    # Find the icon. It's usually a large emoji in a div before H1.
    icon = "⚙️"
    for div in soup.find_all("div"):
        text = div.get_text(strip=True)
        if len(text) <= 5 and any(char in emoji.EMOJI_DATA for char in text):
            # some might have spaces
            icon = "".join(c for c in text if c in emoji.EMOJI_DATA)
            if icon: break
            
    # Extract desc (p tag after h1)
    desc = "No description"
    if h1:
        p = h1.find_next("p")
        if p:
            desc = " ".join(p.stripped_strings)

    # Extract sub pages
    subs = []
    # If using the new template (like 61-64), h3 are present inside the grid.
    # If using old template, they might be inside 'glass-card' or 'rounded-2xl'.
    # In older templates (21-40), they are h3 tags inside 'glass-card' or 'bg-theme/90' etc.
    h3s = soup.find_all("h3")
    for h3 in h3s[:3]: # take the first 3
        sub_title = " ".join(h3.stripped_strings)
        p = h3.find_next("p")
        sub_desc = " ".join(p.stripped_strings) if p else ""
        subs.append({"title": sub_title, "desc": sub_desc})
        
    while len(subs) < 3:
        subs.append({"title": f"Sub {len(subs)+1}", "desc": "Desc"})
        
    # Attempt to extract color theme from html if possible
    # We can just randomly assign colors later.
    return {
        "id": i,
        "topic": topic,
        "icon": icon,
        "desc": desc,
        "subs": subs
    }

for i in [21, 30, 40, 50, 60, 64]:
    print(parse_module(i))
