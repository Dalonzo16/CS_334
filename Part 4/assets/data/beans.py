import sqlite3
import json

# Load the data from JSON
with open("initial.json") as f:
    data = json.load(f)

# Connect to SQLite database
conn = sqlite3.connect("teaShop.sqlite")
cursor = conn.cursor()

# Create tables
cursor.execute("""
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    price REAL,
    description TEXT,
    image TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    address TEXT,
    items TEXT, -- JSON string
    orderDate TEXT
)
""")


# Insert products
for product in data["products"]:
    cursor.execute("""
        INSERT INTO products (name, category, price, description, image)
        VALUES (?, ?, ?, ?, ?)
    """, (product["name"], product["category"], float(product["price"]), product["description"], product["image"]))

# Insert users
for user in data["users"]:
    cursor.execute("""
        INSERT INTO users (email, password, role)
        VALUES (?, ?, ?)
    """, (user["email"], user["password"], user["role"]))

# Insert orders and items
for order in data["orders"]:
    items_json = json.dumps(order["items"])
    cursor.execute("""
    INSERT INTO orders (email, address, items, orderDate)
    VALUES (?, ?, ?, ?)
    """, (order["email"], order["address"], items_json, order["orderDate"]))


# Commit and close
conn.commit()
conn.close()
print("SQLite database created successfully.")
