import requests
import pandas as pd
import glob
import json
import os
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
print("Starting data scraping...")
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
    # For local assets, do not URL encode, just use the cleaned name
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
    # Get the directory where this script is located
    script_dir = os.path.dirname(__file__)
    
    # Define paths for both client and server data folders
    client_json_path = os.path.join(script_dir, 'items.json')
    
    # Navigate up to project root and then to server data folder
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(script_dir)))
    server_json_path = os.path.join(project_root, 'bazaar-server', 'data', 'items.json')
    
    # Ensure server data directory exists
    server_data_dir = os.path.dirname(server_json_path)
    os.makedirs(server_data_dir, exist_ok=True)
    
    # Convert DataFrame to JSON
    df_json = df.to_json(orient='records', indent=2)
    
    # Save to client data folder
    with open(client_json_path, 'w', encoding='utf-8') as json_file:
        json_file.write(df_json)
    print(f"✅ JSON file saved to client: {client_json_path}")
    
    # Save to server data folder
    with open(server_json_path, 'w', encoding='utf-8') as json_file:
        json_file.write(df_json)
    print(f"✅ JSON file saved to server: {server_json_path}")
    
    print("JSON files created successfully in both locations!")
    
except Exception as e:
    print(f"Error creating JSON file: {e}")
    exit(1)

print("Data processing complete!")
print(f"CSV file saved: items_combined.csv ({len(df)} rows)")
print(f"JSON files saved to both client and server ({len(df)} rows)")

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

print("CSV cleanup complete!")
