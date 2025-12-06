
# --- Final Export ---
# Deduplicate by URL
unique_experiments = {e['url']: e for e in experiments}.values()
final_list = list(unique_experiments)

print(f"Total Unique Experiments: {len(final_list)}")

# Generate JS file content
js_content = "const experiments = " + json.dumps(final_list, indent=4, ensure_ascii=False) + ";"

with open('assets/js/experiments.js', 'w') as f:
    f.write(js_content)
