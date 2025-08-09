import os
import json
import requests
import re


# Get workspace root (assume script is always in bazaar-client/src/scripts/)
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../'))
ITEMS_JSON = os.path.join(WORKSPACE_ROOT, 'bazaar-server/data/items.json')
OUTPUT_DIR = os.path.join(WORKSPACE_ROOT, 'bazaar-client/public/assets/items')

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

def safe_filename(name):
    # Replace spaces and unsafe chars with underscores, keep alphanum and dash/underscore/period
    return re.sub(r'[^\w\-\.]', '_', name)

def main():
    with open(ITEMS_JSON, 'r', encoding='utf-8') as f:
        items = json.load(f)

    for item in items:
        # Support both key styles
        name = item.get('name') or item.get('Items')
        url = item.get('image') or item.get('Image')
        if not name or not url:
            print(f"Skipping item with missing name or image: {item}")
            continue
        filename = safe_filename(name) + os.path.splitext(url)[-1].split('?')[0]
        out_path = os.path.join(OUTPUT_DIR, filename)
        if os.path.exists(out_path):
            print(f"Exists, skipping: {filename}")
            continue
        try:
            resp = requests.get(url, timeout=10)
            resp.raise_for_status()
            with open(out_path, 'wb') as out:
                out.write(resp.content)
            print(f"Downloaded: {filename}")
        except Exception as e:
            print(f"Failed to download {url} as {filename}: {e}")

if __name__ == '__main__':
    main()
