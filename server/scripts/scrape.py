import requests
import pandas as pd
import glob
import json
import os
import sqlite3
import re
from urllib.parse import quote

####### URL's to download the .csv files from and saving the files as parts########
url_1 = ('https://brightershoreswiki.org/w/Special:Ask/format%3Dcsv/link%3Dall/headers%3Dshow/searchlabel%3DCSV/class%3Dsortable-20wikitable-20smwtable/prefix%3Dnone/sort%3DProfession-20Level-20A/order%3Dasc/offset%3D0/limit%3D500/-5B-5BInfobox::Item-5D-5D/-3F/-3FImage-23-2D/-3FEpisode/-3FVariant-20of/-3FProfession-20A/-3FProfession-20Level-20A/-3FProfession-20B/-3FProfession-20Level-20B/-3FTradeable/mainlabel%3D/prettyprint%3Dtrue/unescape%3Dtrue')
filename1 = 'itemsPart1.csv'
url_2 = ('https://brightershoreswiki.org/w/Special:Ask/format%3Dcsv/link%3Dall/headers%3Dshow/searchlabel%3DCSV/class%3Dsortable-20wikitable-20smwtable/prefix%3Dnone/sort%3DProfession-20Level-20A/order%3Dasc/offset%3D500/limit%3D500/-5B-5BInfobox::Item-5D-5D/-3F/-3FImage-23-2D/-3FEpisode/-3FVariant-20of/-3FProfession-20A/-3FProfession-20Level-20A/-3FProfession-20B/-3FProfession-20Level-20B/-3FTradeable/mainlabel%3D/prettyprint%3Dtrue/unescape%3Dtrue')
filename2 = 'itemsPart2.csv'
url_3 = ('https://brightershoreswiki.org/w/Special:Ask/format%3Dcsv/link%3Dall/headers%3Dshow/searchlabel%3DCSV/class%3Dsortable-20wikitable-20smwtable/prefix%3Dnone/sort%3DProfession-20Level-20A/order%3Dasc/offset%3D1000/limit%3D500/-5B-5BInfobox::Item-5D-5D/-3F/-3FImage-23-2D/-3FEpisode/-3FVariant-20of/-3FProfession-20A/-3FProfession-20Level-20A/-3FProfession-20B/-3FProfession-20Level-20B/-3FTradeable/mainlabel%3D/prettyprint%3Dtrue/unescape%3Dtrue')
filename3 = 'itemsPart3.csv'
url_4 = ('https://brightershoreswiki.org/w/Special:Ask/format%3Dcsv/link%3Dall/headers%3Dshow/searchlabel%3DCSV/class%3Dsortable-20wikitable-20smwtable/prefix%3Dnone/sort%3DProfession-20Level-20A/order%3Dasc/offset%3D1500/limit%3D500/-5B-5BInfobox::Item-5D-5D/-3F/-3FImage-23-2D/-3FEpisode/-3FVariant-20of/-3FProfession-20A/-3FProfession-20Level-20A/-3FProfession-20B/-3FProfession-20Level-20B/-3FTradeable/mainlabel%3D/prettyprint%3Dtrue/unescape%3Dtrue')
filename4 = 'itemsPart4.csv'
url_5 = ('https://brightershoreswiki.org/w/Special:Ask/format%3Dcsv/link%3Dall/headers%3Dshow/searchlabel%3DCSV/class%3Dsortable-20wikitable-20smwtable/prefix%3Dnone/sort%3DProfession-20Level-20A/order%3Dasc/offset%3D2000/limit%3D500/-5B-5BInfobox::Item-5D-5D/-3F/-3FImage-23-2D/-3FEpisode/-3FVariant-20of/-3FProfession-20A/-3FProfession-20Level-20A/-3FProfession-20B/-3FProfession-20Level-20B/-3FTradeable/mainlabel%3D/prettyprint%3Dtrue/unescape%3Dtrue')
filename5 = 'itemsPart5.csv'

### Download the CSV files and save them ###
print(f"[{pd.Timestamp.now()}] Starting automated data scraping...")
query_parameters = {"downloadformat": "csv"}
response = requests.get(url_1, params=query_parameters)
if response.status_code == 200:
    with open(filename1, 'wb') as f:
        f.write(response.content)

response = requests.get(url_2, params=query_parameters)
if response.status_code == 200:
    with open(filename2, 'wb') as f:
        f.write(response.content)

response = requests.get(url_3, params=query_parameters)
if response.status_code == 200:
    with open(filename3, 'wb') as f:
        f.write(response.content)

response = requests.get(url_4, params=query_parameters)
if response.status_code == 200:
    with open(filename4, 'wb') as f:
        f.write(response.content)

response = requests.get(url_5, params=query_parameters)
if response.status_code == 200:
    with open(filename5, 'wb') as f:
        f.write(response.content)

### merge the CSV files into one for easier data clean up ###
print("Merging CSV files...")
csv_files = glob.glob('*.csv')
dfs = []
for filename in csv_files:
    df = pd.read_csv(filename, encoding='utf-8')
    dfs.append(df)
combined_df = pd.concat(dfs, ignore_index=True)
combined_df.to_csv('items_combined.csv', index=False, encoding='utf-8')

### Open and clean the merged .csv ###
print("Cleaning data...")
filename6 = 'items_combined.csv'
df = pd.read_csv(filename6, usecols=['Unnamed: 0', 'Image', 'Episode', 'Variant of', 'Profession A', 'Profession Level A', 'Profession B', 'Profession Level B', 'Tradeable'], encoding='utf-8')
df.rename(columns={'Unnamed: 0': 'Items'}, inplace=True) #replace empty column name with 'Items'

# Clean and encode image URLs properly
def clean_image_url(image_name):
    if pd.isna(image_name):
        return image_name
    # Remove 'File:' prefix if present
    clean_name = str(image_name).replace('File:', '')
    # Replace spaces with underscores
    clean_name = clean_name.replace(' ', '_')
    # URL encode the filename (this handles %, spaces, and other special characters)
    encoded_name = quote(clean_name, safe='')
    # Construct the full URL
    return f'/assets/items/{clean_name}'

df['Image'] = df['Image'].apply(clean_image_url)

## Fill NaN values with 'None' or 'unknown' for better readability
df['Episode'] = df['Episode'].fillna('None')
df['Variant of'] = df['Variant of'].fillna('None')
df['Profession A'] = df['Profession A'].fillna('None')
df['Profession Level A'] = df['Profession Level A'].fillna('None')
df['Profession B'] = df['Profession B'].fillna('None')
df['Profession Level B'] = df['Profession Level B'].fillna('None')
df['Tradeable'] = df['Tradeable'].fillna('unknown')

# Remove any row where Tradeable is False (boolean or string)
df = df[~((df['Tradeable'] == False) | (df['Tradeable'] == 'False'))]

# Remove any row where any string field contains '(Legacy)'
def contains_legacy(row):
    for val in row.values:
        if isinstance(val, str) and '(Legacy)' in val:
            return True
    return False

df = df[~df.apply(contains_legacy, axis=1)]

# Remove decimals from Profession Level A and Profession Level B
for col in ['Profession Level A', 'Profession Level B']:
    def strip_decimal(val):
        try:
            # Only process if not None or 'None'
            if pd.isna(val) or val == 'None':
                return 'None'
            # Convert to int if possible
            return str(int(float(val)))
        except Exception:
            return str(val)
    df[col] = df[col].apply(strip_decimal)

# Normalize professions: set to 'Combat' if Hammermage, Cryoknight, or Guardian
combat_aliases = {"Hammermage", "Cryoknight", "Guardian"}
for col in ["Profession A", "Profession B"]:
    df[col] = df[col].apply(lambda x: "Combat" if str(x) in combat_aliases else x)

df.to_csv('items_combined.csv', index=False, encoding='utf-8')

### Convert the cleaned CSV to JSON ###
print("Converting CSV to JSON...")
try:
    # In Docker container, we're running from /app/scripts/
    # Server data folder is at /app/data/
    server_json_path = '/app/data/items.json'
    
    # Convert DataFrame to JSON
    df_json = df.to_json(orient='records', indent=2)
    
    # Save to server data folder (this will be used by the API)
    with open(server_json_path, 'w', encoding='utf-8') as json_file:
        json_file.write(df_json)
    print(f"✅ JSON file updated in server: {server_json_path}")
    
    print("JSON file updated successfully!")
    
except Exception as e:
    print(f"❌ Error creating JSON file: {e}")
    exit(1)

print(f"[{pd.Timestamp.now()}] Data processing complete!")
print(f"Updated items.json with {len(df)} items")

### Clean up: Delete all CSV files ###
print("Cleaning up CSV files...")
csv_files_to_delete = glob.glob('*.csv')
for csv_file in csv_files_to_delete:
    try:
        os.remove(csv_file)
        print(f"Deleted: {csv_file}")
    except FileNotFoundError:
        print(f"File not found: {csv_file}")
    except PermissionError:
        print(f"Permission denied: {csv_file}")
    except Exception as e:
        print(f"Error deleting {csv_file}: {e}")


# Convert JSON to SQLite database
import sqlite3

print("Converting JSON to SQLite database...")
try:
    # Read the JSON file
    with open(server_json_path, 'r', encoding='utf-8') as f:
        items = json.load(f)

    # Define SQLite DB path (in same /app/data/ folder)
    sqlite_db_path = '/app/data/items.db'
    conn = sqlite3.connect(sqlite_db_path)
    c = conn.cursor()

    # Drop table if exists and create new one
    c.execute('DROP TABLE IF EXISTS items')
    c.execute('''
        CREATE TABLE items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            Items TEXT,
            Image TEXT,
            Episode TEXT,
            [Variant of] TEXT,
            [Profession A] TEXT,
            [Profession Level A] TEXT,
            [Profession B] TEXT,
            [Profession Level B] TEXT,
            Tradeable TEXT
        )
    ''')

    # Insert items
    for item in items:
        c.execute('''
            INSERT INTO items (Items, Image, Episode, [Variant of], [Profession A], [Profession Level A], [Profession B], [Profession Level B], Tradeable)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            item.get('Items'),
            item.get('Image'),
            item.get('Episode'),
            item.get('Variant of'),
            item.get('Profession A'),
            item.get('Profession Level A'),
            item.get('Profession B'),
            item.get('Profession Level B'),
            item.get('Tradeable')
        ))
    conn.commit()
    conn.close()
    print(f"✅ SQLite database created at: {sqlite_db_path}")
except Exception as e:
    print(f"❌ Error creating SQLite database: {e}")

# Update marketplace database to fix outdated item names
print("Updating marketplace database with current item names...")
try:
    # Connect to marketplace database
    marketplace_db_path = '/app/data/marketplace.db'
    if os.path.exists(marketplace_db_path):
        marketplace_conn = sqlite3.connect(marketplace_db_path)
        marketplace_cursor = marketplace_conn.cursor()
        
        # Fix common item name changes
        # 1. Remove "Potent " from potion names (e.g., "Potent Potion" -> "Potion")
        marketplace_cursor.execute('''
            UPDATE listings 
            SET item = REPLACE(item, "Potent Potion", "Potion") 
            WHERE item LIKE "%Potent Potion%"
        ''')
        potent_updates = marketplace_cursor.rowcount
        
        # 2. Add more item name fixes here as needed
        # marketplace_cursor.execute('''
        #     UPDATE listings 
        #     SET item = REPLACE(item, "old_name", "new_name") 
        #     WHERE item LIKE "%old_name%"
        # ''')
        
        marketplace_conn.commit()
        marketplace_conn.close()
        
        if potent_updates > 0:
            print(f"✅ Updated {potent_updates} marketplace listings with old 'Potent' naming")
        else:
            print("✅ No marketplace item names needed updating")
    else:
        print("ℹ️  Marketplace database not found, skipping item name updates")
        
except Exception as e:
    print(f"⚠️  Error updating marketplace item names: {e}")

# Check for missing item images (logging only)
print("Checking for new items that may need images...")
try:
    # Load current items data
    with open('/app/data/items.json', 'r', encoding='utf-8') as f:
        items_data = json.load(f)
    
    # Get list of all current item names
    current_items = set()
    new_items = []
    
    for item in items_data:
        item_name = item.get('Items', '')
        if item_name:
            current_items.add(item_name)
            # Check for new Infernae items (example of new items to highlight)
            if 'Infernae' in item_name:
                new_items.append(item_name)
    
    if new_items:
        print(f"ℹ️  Found {len(new_items)} items with 'Infernae' that may need images:")
        for item in new_items[:5]:  # Show first 5
            print(f"   - {item}")
        if len(new_items) > 5:
            print(f"   ... and {len(new_items) - 5} more")
        print("💡 Consider running the image download script separately to get missing images")
    else:
        print("✅ No obviously new items detected")
        
except Exception as e:
    print(f"⚠️  Error checking for new items: {e}")

# Auto-download missing images
try:
    print(f"[{pd.Timestamp.now()}] Checking for missing images...")
    
    def safe_filename(name):
        """Convert item name to safe filename"""
        safe = re.sub(r'[^\w\s-]', '', name.strip())
        safe = re.sub(r'[-\s]+', '_', safe)
        safe = re.sub(r'^\+', '_', safe)  # Replace leading + with _
        return safe + '.png'
    
    def download_image(item_name, filename):
        """Download image from wiki"""
        try:
            # Use Special:Redirect/file/ format
            wiki_url = f"https://brightershoreswiki.org/wiki/Special:Redirect/file/{filename}"
            
            response = requests.get(wiki_url, timeout=10)
            if response.status_code == 200:
                # Use container path for items directory
                os.makedirs('/usr/share/nginx/html/assets/items', exist_ok=True)
                filepath = f'/usr/share/nginx/html/assets/items/{filename}'
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                return True
            return False
        except Exception:
            return False
    
    # Get all items from database using container path
    conn = sqlite3.connect('/app/data/items.db')
    cursor = conn.cursor()
    cursor.execute("SELECT Items FROM items")
    all_items = [row[0] for row in cursor.fetchall()]
    conn.close()
    
    # Check which images are missing using container path
    missing_images = []
    items_dir = '/usr/share/nginx/html/assets/items'
    
    for item_name in all_items:
        filename = safe_filename(item_name)
        filepath = os.path.join(items_dir, filename)
        
        if not os.path.exists(filepath):
            missing_images.append((item_name, filename))
    
    if missing_images:
        print(f"📥 Downloading {len(missing_images)} missing images...")
        downloaded = 0
        
        for item_name, filename in missing_images:
            if download_image(item_name, filename):
                downloaded += 1
                if downloaded % 10 == 0:
                    print(f"   Progress: {downloaded}/{len(missing_images)}")
        
        print(f"✅ Successfully downloaded {downloaded} new images")
        
        if downloaded > 0:
            print("ℹ️  New images added - nginx will serve them automatically")
    else:
        print("✅ All item images are present")
        
except Exception as e:
    print(f"⚠️  Error checking/downloading images: {e}")

print(f"[{pd.Timestamp.now()}] Automated scraping completed successfully!")
