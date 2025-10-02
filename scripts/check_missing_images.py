#!/usr/bin/env python3
"""
Script to check for missing item images and download them from Brighter Shores Wiki
This script runs outside Docker containers to have proper file system access
"""

import os
import json
import requests
import re
from urllib.parse import urljoin
import time

# Paths
WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ITEMS_JSON = os.path.join(WORKSPACE_ROOT, 'server/data/items.json')
PUBLIC_IMAGES_DIR = os.path.join(WORKSPACE_ROOT, 'bazaar-client/public/assets/items')
BUILD_IMAGES_DIR = os.path.join(WORKSPACE_ROOT, 'bazaar-client/build/assets/items')

def safe_filename(name):
    """Convert item name to safe filename"""
    return re.sub(r'[^\w\-\.]', '_', name)

def download_image(item_name, image_path, dest_dir):
    """Download image from wiki to destination directory"""
    try:
        # Convert to wiki media URL format
        # From: "/assets/items/Fire_Beetle.png"
        # To: "https://brightershoreswiki.org/w/Special:Redirect/file/Fire_Beetle.png"
        if image_path.startswith('/assets/items/'):
            filename = image_path.replace('/assets/items/', '')
            wiki_url = f"https://brightershoreswiki.org/w/Special:Redirect/file/{filename}"
        elif image_path.startswith('/'):
            # Try alternative wiki format
            filename = image_path.split('/')[-1]
            wiki_url = f"https://brightershoreswiki.org/w/Special:Redirect/file/{filename}"
        else:
            wiki_url = image_path
        
        # Generate filename
        filename = safe_filename(item_name) + '.png'
        dest_path = os.path.join(dest_dir, filename)
        
        # Skip if already exists
        if os.path.exists(dest_path):
            return False, f"exists: {filename}"
        
        print(f"Downloading: {item_name} -> {filename}")
        
        # Download image
        response = requests.get(wiki_url, timeout=10)
        response.raise_for_status()
        
        # Save to public directory
        with open(dest_path, 'wb') as f:
            f.write(response.content)
        
        # Also save to build directory for immediate nginx serving
        build_dir = '/home/proniss/bazaar-dev/bazaar-client/build/assets/items'
        os.makedirs(build_dir, exist_ok=True)
        build_path = os.path.join(build_dir, filename)
        with open(build_path, 'wb') as f:
            f.write(response.content)
        
        return True, f"downloaded: {filename}"
        
    except Exception as e:
        return False, f"failed {item_name}: {str(e)}"

def check_existing_image(item_name, dest_dir):
    """Check if image exists with current or old naming patterns"""
    filename = safe_filename(item_name) + '.png'
    path = os.path.join(dest_dir, filename)
    
    # Check current naming
    if os.path.exists(path):
        return True, path
    
    # Check old "Potent" naming
    old_item_name = item_name.replace("Potion", "Potent Potion")
    old_filename = safe_filename(old_item_name) + '.png'
    old_path = os.path.join(dest_dir, old_filename)
    
    if os.path.exists(old_path):
        # Copy to new naming
        try:
            with open(old_path, 'rb') as src, open(path, 'wb') as dst:
                dst.write(src.read())
            print(f"Updated naming: {old_filename} -> {filename}")
            return True, path
        except Exception as e:
            print(f"Failed to update {old_filename}: {e}")
            return True, old_path  # At least the old one exists
    
    return False, path

def main():
    print("🔍 Checking for missing item images...")
    
    # Ensure directories exist
    os.makedirs(PUBLIC_IMAGES_DIR, exist_ok=True)
    os.makedirs(BUILD_IMAGES_DIR, exist_ok=True)
    
    # Load items data
    if not os.path.exists(ITEMS_JSON):
        print(f"❌ Items data not found at {ITEMS_JSON}")
        print("💡 Run the scrape script first to generate items.json")
        return
    
    with open(ITEMS_JSON, 'r', encoding='utf-8') as f:
        items_data = json.load(f)
    
    print(f"📊 Found {len(items_data)} items in database")
    
    # Analyze images
    existing_count = 0
    missing_count = 0
    updated_count = 0
    missing_items = []
    
    print("\n🔍 Analyzing existing images...")
    
    for item in items_data:
        item_name = item.get('Items', '')
        image_path = item.get('Image', '')
        
        if not item_name or not image_path:
            continue
        
        # Check if image exists in public directory
        exists, path = check_existing_image(item_name, PUBLIC_IMAGES_DIR)
        
        if exists:
            existing_count += 1
            if "Updated naming" in str(path):
                updated_count += 1
        else:
            missing_count += 1
            missing_items.append((item_name, image_path))
    
    print(f"\n📈 Image Analysis Results:")
    print(f"   ✅ Existing images: {existing_count}")
    print(f"   🔄 Updated naming: {updated_count}")
    print(f"   ❌ Missing images: {missing_count}")
    
    if missing_count == 0:
        print("\n🎉 All images are present!")
        return
    
    # Show some examples of missing items
    print(f"\n📋 Examples of missing items:")
    for item_name, _ in missing_items[:10]:
        print(f"   - {item_name}")
    if len(missing_items) > 10:
        print(f"   ... and {len(missing_items) - 10} more")
    
    # Ask if user wants to download
    download_all = input(f"\n💾 Download all {missing_count} missing images? (y/N): ").strip().lower()
    
    if download_all not in ['y', 'yes']:
        print("ℹ️  Skipping download. Run script again with 'y' to download.")
        return
    
    print(f"\n⬇️  Downloading {missing_count} missing images...")
    
    downloaded_count = 0
    failed_count = 0
    
    for i, (item_name, image_path) in enumerate(missing_items):
        # Download to public directory
        success, message = download_image(item_name, image_path, PUBLIC_IMAGES_DIR)
        
        if success:
            downloaded_count += 1
            # Also copy to build directory
            filename = safe_filename(item_name) + '.png'
            public_path = os.path.join(PUBLIC_IMAGES_DIR, filename)
            build_path = os.path.join(BUILD_IMAGES_DIR, filename)
            
            try:
                with open(public_path, 'rb') as src, open(build_path, 'wb') as dst:
                    dst.write(src.read())
            except Exception as e:
                print(f"⚠️  Failed to copy to build directory: {e}")
        else:
            failed_count += 1
            if "failed" in message:
                print(f"❌ {message}")
        
        # Progress indicator
        if (i + 1) % 10 == 0:
            print(f"   Progress: {i + 1}/{len(missing_items)} ({((i + 1) / len(missing_items) * 100):.1f}%)")
        
        # Small delay to be nice to the server
        time.sleep(0.1)
    
    print(f"\n✅ Download Summary:")
    print(f"   📥 Successfully downloaded: {downloaded_count}")
    print(f"   ❌ Failed downloads: {failed_count}")
    print(f"   💾 Total images now: {existing_count + downloaded_count}")
    
    if downloaded_count > 0:
        print(f"\n🔄 Restart nginx to serve new images:")
        print(f"   cd {WORKSPACE_ROOT}")
        print(f"   docker-compose -f docker-compose.dev.yml restart nginx")

if __name__ == '__main__':
    main()
