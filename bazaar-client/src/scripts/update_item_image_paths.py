import os
import json
import re

# Paths
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../'))
ITEMS_JSON = os.path.join(WORKSPACE_ROOT, 'bazaar-server/data/items.json')
ASSETS_DIR = 'assets/items'
ASSETS_ABS = os.path.join(WORKSPACE_ROOT, 'bazaar-client', 'public', 'assets/items')

# Use the same safe filename logic as before
def safe_filename(name):
    return re.sub(r'[^\w\-\.]', '_', name)

def get_local_image_path(name, url):
    ext = os.path.splitext(url)[-1].split('?')[0]
    return f"{ASSETS_DIR}/{safe_filename(name)}{ext}"

def main():
    with open(ITEMS_JSON, 'r', encoding='utf-8') as f:
        items = json.load(f)

    for item in items:
        # Support both key styles
        name = item.get('name') or item.get('Items')
        url = item.get('image') or item.get('Image')
        if name and url:
            local_path = get_local_image_path(name, url)
            if 'Image' in item:
                item['Image'] = local_path
            if 'image' in item:
                item['image'] = local_path
    # Write back to file (backup first)
    backup = ITEMS_JSON + '.bak'
    if not os.path.exists(backup):
        os.rename(ITEMS_JSON, backup)
    with open(ITEMS_JSON, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    print(f"Updated image paths in {ITEMS_JSON}. Backup saved as {backup}.")

if __name__ == '__main__':
    main()
