#!/bin/bash
# Update item images, image paths, and items.db for deployment
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

# 1. Download item images
python3 bazaar-client/src/scripts/download_item_images.py

# 2. Update image paths in items.json
python3 bazaar-client/src/scripts/update_item_image_paths.py

# 3. Update items.db from items.json
python3 bazaar-client/src/scripts/items_json_to_db.py

echo "[update_assets_and_db.sh] All item images, image paths, and items.db updated."
