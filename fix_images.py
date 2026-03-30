import re
import random

with open('zhengzhong.html', 'r') as f:
    html = f.read()

# Default beautiful tech/agriculture Unsplash images
replacements = {
    'global_map': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80',
    'museum': 'https://images.unsplash.com/photo-1582560469796-7a7605db08ea?auto=format&fit=crop&q=80',
    'ancient_scroll': 'https://images.unsplash.com/photo-1532153955177-f59af40d6472?auto=format&fit=crop&q=80',
    'sensor': 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?auto=format&fit=crop&q=80',
    'dna': 'https://images.unsplash.com/photo-1614935151651-0bea6508abb0?auto=format&fit=crop&q=80',
    'powder': 'https://images.unsplash.com/photo-1510461876527-3df5a6fcc5bf?auto=format&fit=crop&q=80', # spice/powder
    'capsule': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80',
    'product': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80',
    'expert': 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80',
    'dashboard': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80',
    'live_streaming': 'https://images.unsplash.com/photo-1598550880863-4e8aa3d0ddb4?auto=format&fit=crop&q=80',
    'blockchain': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80',
    'rural': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80',
    'brand': 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?auto=format&fit=crop&q=80',
    'default': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80'
}

def replacer(match):
    full_path = match.group(0)
    img_name = match.group(1).lower()
    
    selected_url = replacements['default']
    for key, url in replacements.items():
        if key in img_name:
            selected_url = url
            break
            
    # return the quote and the new url
    return f"{match.group(0).split('/Users')[0]}{selected_url}"

# The regex matches strings starting with /Users/zhoulin/.gemini... ending with .png inside quotes
pattern = r"/Users/zhoulin/\.gemini/[^\"'\s]+?/([^/\"']+?\.png)"

new_html = re.sub(pattern, lambda m: replacements.get(next((k for k in replacements if k in m.group(1).lower()), 'default')), html)

# Wait, re.sub string replacement:
def specific_replacer(match):
    original = match.group(0)
    filename = match.group(1).lower()
    url = replacements['default']
    for k, v in replacements.items():
        if k in filename:
            url = v
            break
    return url

new_html = re.sub(pattern, specific_replacer, html)

with open('zhengzhong.html', 'w') as f:
    f.write(new_html)
print("Done replacing gemini brain images in zhengzhong.html")
