from flask import Flask, request, jsonify
import csv
import os

app = Flask(__name__)

CSV_FILE_PATH = '../assets/data/products.csv'


def read_csv():
    """Read all products from the CSV file."""
    products = []
    try:
        with open(CSV_FILE_PATH, 'r') as file:
            # Specify the delimiter as '|'
            reader = csv.DictReader(file, delimiter='|')
            for row in reader:
                # Debugging: Print each row as it is read
                # print("Read row:", row)
                
                # Check for None or empty fields and handle them
                cleaned_row = {key: (value if value is not None and value != '' else 'Unknown') for key, value in row.items()}
                products.append(cleaned_row)
                
    except FileNotFoundError:
        print("CSV file not found")
    return products


def write_csv(products):
    """Write the products back to the CSV file."""
    with open(CSV_FILE_PATH, mode='w', newline='') as file:
        fieldnames = ['id', 'name', 'category', 'price', 'description', 'image']
        writer = csv.DictWriter(file, fieldnames=fieldnames, delimiter='|')
        writer.writeheader()
        for product in products:
            writer.writerow(product)


@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        products = read_csv()
        
        cleaned_products = []
        for product in products:
            cleaned_product = {key: (value if value is not None else '') for key, value in product.items()}
            cleaned_products.append(cleaned_product)

        return jsonify(cleaned_products)

    except Exception as e:
        print(f"Error while getting products: {e}")
        return jsonify({"error": "Failed to load products"}), 500



@app.route('/api/products', methods=['POST'])
def add_product():
    """Add a new product to the CSV."""
    new_product = request.json
    products = read_csv()

    # Generate a new ID (increment the last one or start at 1)
    new_product_id = max([int(product['id']) for product in products], default=0) + 1
    new_product['id'] = str(new_product_id)

    products.append(new_product)
    write_csv(products)

    return jsonify({'message': 'Product added successfully', 'product': new_product}), 201


@app.route('/api/products', methods=['PUT'])
def update_product():
    """Update an existing product."""
    updated_product = request.json
    products = read_csv()

    # Find the product and update it
    for product in products:
        if product['id'] == updated_product['id']:
            product.update(updated_product)
            write_csv(products)
            return jsonify({'message': 'Product updated successfully', 'product': product})

    return jsonify({'message': 'Product not found'}), 404


@app.route('/api/products', methods=['DELETE'])
def delete_product():
    """Delete a product."""
    product_id = request.args.get('id')
    products = read_csv()

    # Filter out the product to delete
    products = [product for product in products if product['id'] != product_id]
    write_csv(products)

    return jsonify({'message': 'Product deleted successfully'})


if __name__ == '__main__':
    app.run(debug=True)
