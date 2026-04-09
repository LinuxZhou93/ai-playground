import os
import yaml
import json
import urllib.request
import re

# Configurations
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COURSE_DIR = os.path.join(BASE_DIR, 'public', 'resources', 'hf-course', 'chapters', 'zh-CN')
TOCTREE_PATH = os.path.join(COURSE_DIR, '_toctree.yml')

# Supabase Configurations
SUPABASE_URL = 'https://znmbkxmnwuurzhevfxtq.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1MDQsImV4cCI6MjA4MDE1NTUwNH0.y0m9rnug3WduVyuKZLL25PBA4C2Ys0_WSgMrzokSh5g'
TABLE_NAME = 'courses'

def extract_summary(md_path):
    if not os.path.exists(md_path):
        return ""
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove YAML frontmatter if exists
    content = re.sub(r'^---.*?---\n', '', content, flags=re.DOTALL)
    # Remove MDX imports/tags
    content = re.sub(r'<[^>]+>', '', content)
    # Extract first paragraph or so that consists of pure text
    lines = content.split('\n')
    summary_lines = []
    for line in lines:
        line = line.strip()
        if line and not line.startswith('#') and not line.startswith('<') and not line.startswith('-') and not line.startswith('*'):
            summary_lines.append(line)
            if len(summary_lines) >= 2:
                break
    
    summary = " ".join(summary_lines)
    # limit to 200 chars
    return summary[:200] + '...' if len(summary) > 200 else summary

def main():
    if not os.path.exists(TOCTREE_PATH):
        print(f"Error: {TOCTREE_PATH} not found.")
        return

    with open(TOCTREE_PATH, 'r', encoding='utf-8') as f:
        toc_data = yaml.safe_load(f)
    
    courses_to_insert = []
    base_id = 1000

    for idx, chapter in enumerate(toc_data):
        title = chapter.get('title', '')
        # Ignore installation and non-course chapters if needed, but let's include all.
        sections = chapter.get('sections', [])
        
        # Check first section for summary
        summary = ""
        if sections and 'local' in sections[0]:
            first_sec_local = sections[0]['local']
            md_path1 = os.path.join(COURSE_DIR, first_sec_local + '.mdx')
            md_path2 = os.path.join(COURSE_DIR, first_sec_local + '.md')
            if os.path.exists(md_path1):
                summary = extract_summary(md_path1)
            elif os.path.exists(md_path2):
                summary = extract_summary(md_path2)
        
        if not summary:
            subtitle = chapter.get('subtitle', '')
            if subtitle:
                summary = subtitle
            else:
                summary = f"HuggingFace {title} 实战课程，带你深入了解相关技术。"

        course_obj = {
            # Let Supabase auto-generate ID if it's serial, unless we need to force it.
            # actually we can just pass an object without ID if table allows auto generation
            "title": f"HuggingFace: {title}",
            "description": summary,
            "difficulty": "intermediate" if idx > 3 else "beginner",
            "lesson_count": len(sections),
            "student_count": 500,
            "rating": 5.0,
            "thumbnail_url": 'assets/images/huggingface-logo.png', # default placeholder
            "is_published": True
        }
        courses_to_insert.append(course_obj)
        base_id += 1
    
    print(f"Extracted {len(courses_to_insert)} courses.")
    out_path = os.path.join(BASE_DIR, 'public', 'assets', 'data', 'hf_courses.json')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(courses_to_insert, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(courses_to_insert)} courses to {out_path}")

if __name__ == '__main__':
    main()
