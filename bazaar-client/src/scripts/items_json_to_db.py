import os
import json
import sqlite3

# Paths
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../'))
ITEMS_JSON = os.path.join(WORKSPACE_ROOT, 'bazaar-server/data/items.json')
ITEMS_DB = os.path.join(WORKSPACE_ROOT, 'bazaar-server/data/items.db')

# Load items from JSON
def load_items():
    with open(ITEMS_JSON, 'r', encoding='utf-8') as f:
        return json.load(f)

def create_table(cursor, sample_item):
    columns = []
    for key in sample_item.keys():
        columns.append(f'"{key}" TEXT')
    columns_sql = ', '.join(columns)
    cursor.execute(f'CREATE TABLE IF NOT EXISTS items ({columns_sql})')

def insert_items(cursor, items):
    if not items:
        return
    keys = list(items[0].keys())
    placeholders = ','.join(['?'] * len(keys))
    for item in items:
        values = [str(item.get(k, '')) for k in keys]
        cursor.execute(f'INSERT INTO items ({','.join('"'+k+'"' for k in keys)}) VALUES ({placeholders})', values)

def main():
    items = load_items()
    if not items:
        print('No items found in JSON.')
        return
    if os.path.exists(ITEMS_DB):
        os.remove(ITEMS_DB)
    conn = sqlite3.connect(ITEMS_DB)
    cursor = conn.cursor()
    create_table(cursor, items[0])
    insert_items(cursor, items)
    conn.commit()
    conn.close()
    print(f'Converted {len(items)} items to {ITEMS_DB}')

if __name__ == '__main__':
    main()
