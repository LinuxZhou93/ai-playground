
# --- Correctly Appending Supplemental Experiments ---
print(f"Adding {len(shader_experiments)} Shaders...")
append_new_items(shader_experiments, 'Computer Science', category_covers['Computer Science'])

print(f"Adding {len(scratch_links)} Scratch games...")
append_new_items(scratch_links, 'Computer Science', category_covers['Computer Science'])

print(f"Adding {len(circuit_examples)} Specific Circuits...")
append_new_items(circuit_examples, 'Electronics', category_covers['Electronics'])

# --- Final Export ---
# Deduplicate by URL
unique_experiments = {e['url']: e for e in experiments}.values()
final_list = list(unique_experiments)

print(f"Total Unique Experiments: {len(final_list)}")

# Generate JS file content
js_content = "const experiments = " + json.dumps(final_list, indent=4, ensure_ascii=False) + ";"

with open('assets/js/experiments.js', 'w') as f:
    f.write(js_content)
