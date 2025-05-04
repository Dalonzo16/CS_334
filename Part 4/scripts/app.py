from flask import Flask, render_template, request, jsonify
import sqlite3
from flask_cors import CORS
from flask_mail import Mail, Message


app = Flask(__name__)
CORS(app)

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = 'teaco34567@gmail.com'
app.config['MAIL_PASSWORD'] = 'wdeb uqka wrzm wioi'
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
mail = Mail(app)

__dataBaseName__ =  "/home/bassturtle4/Documents/GitHub/CS_334/Part 4/assets/data/teaShop.sqlite"

def connectToDatabase() :
    """This method tries to connect to the teaShop Database file. Terminates program on failure

    Returns:
        Cursor: the cursor for database communication
    """
    try:
        connection = sqlite3.connect(__dataBaseName__)
        print(f"Successfully connected to {__dataBaseName__}")
        return connection # return the cursor for further database interaction

    except Exception as e:
        print(f"ERROR: Database connection unsuccessful. Reason: {e}")

# ------------------------ Product Functions ------------------------
@app.route('/getProducts', methods=['GET'])
def get_products():
    try:
        products = []
        conn = connectToDatabase()
        cur = conn.cursor()
        
        cur.execute("SELECT * FROM products")
        results = cur.fetchall()
        conn.commit()
        conn.close()

        for result in results:
            new_row = {'id' : result[0], 'name' : result[1], 'category': result[2], 'price' : result[3], 'description' : result[4], 'image' : result[5]}
            products.append(new_row)

        return jsonify(products)

    except Exception as e:
        print(f"Error while getting products: {e}")
        return jsonify({"error": "Failed to load products"}), 500
    

@app.route('/addNewProduct', methods=['POST'])
def add_new_product():
    try:
        newProduct = request.json
        print(newProduct)

        conn = connectToDatabase()
        cur = conn.cursor()
        
        # Insert the new product
        cur.execute("""
            INSERT INTO products(name, category, price, description, image) 
            VALUES(?, ?, ?, ?, ?)
        """, (
            newProduct['name'], 
            newProduct['category'], 
            newProduct['price'], 
            newProduct['description'], 
            newProduct['image']
        ))
        
        conn.commit()

        # Get the inserted product using the auto-incremented ID
        newId = cur.lastrowid
        cur.execute("SELECT * FROM products WHERE id = ?", (newId,))
        addedProduct = cur.fetchone()

        conn.close()

        # Convert to dict if needed
        productDict = {
            "id": addedProduct[0],
            "name": addedProduct[1],
            "category": addedProduct[2],
            "price": addedProduct[3],
            "description": addedProduct[4],
            "image": addedProduct[5]
        }

        return jsonify(productDict), 201

    except Exception as e:
        print(f"Error while adding new product: {e}")
        return jsonify({"error": "Failed to add new product"}), 500


@app.route('/updateProduct', methods=['PUT'])
def update_product():
    try:
        updated_product = request.json

        conn = connectToDatabase()
        cur = conn.cursor()

        cur.execute("UPDATE products SET name = ?, category = ?, price = ?, description = ?, image = ? WHERE id = ?" , 
                    (updated_product['name'], updated_product['category'], updated_product['price'], updated_product['description'], 
                     updated_product['image'], updated_product['id']))
        
        conn.commit()
        conn.close()

    except Exception as e:
        print(f"Error while updating product: {e}")
        return jsonify({"error": "Failed to update product"}), 500
    
    return jsonify("updated product in sqlite")

@app.route('/deleteProduct', methods=['DELETE'])
def delete_product():
    try:
        deletion_product = request.json

        print(deletion_product['productID'])

        conn = connectToDatabase()
        cur = conn.cursor()

        cur.execute("DELETE FROM products WHERE id = ?", (deletion_product['id'],))

        conn.commit()
        conn.close()

    except Exception as e:
        print(f"Error while deleting product: {e}")
        return jsonify({"error": "Failed to delete product"}), 500
    
    return jsonify("deleted product in sqlite")

# ------------------------ User Functions ------------------------
@app.route('/getUsers', methods=['GET'])
def get_users():
    try:
        users = []
        conn = connectToDatabase()
        cur = conn.cursor()

        cur.execute("SELECT * FROM users")
        results = cur.fetchall()
        conn.commit()
        conn.close()

        for result in results:
            new_row = {'id' : result[0], 'email' : result[1], 'password': result[2], 'role' : result[3]}
            users.append(new_row)

        return jsonify(users)

    except Exception as e:
        print(f"Error while getting users: {e}")
        return jsonify({"error": "Failed to load users"}), 500
    
@app.route('/addNewUser', methods=['POST'])
def add_new_user():

    try:
        newUser = request.json

        conn = connectToDatabase()
        cur = conn.cursor()
        
        cur.execute("INSERT INTO users(email, password, role) VALUES(?, ?, ?)", 
                    (newUser['email'], newUser['password'], newUser['role']))
        
        conn.commit()
        conn.close()

    except Exception as e:
        print(f"Error while adding new user: {e}")
        return jsonify({"error": "Failed to add new user"}), 500

    return jsonify("new user added")


@app.route('/updateUser', methods=['PUT'])
def update_user():
    try:
        updated_user = request.json

        conn = connectToDatabase()
        cur = conn.cursor()

        cur.execute("UPDATE users SET email = ?, password = ?, role = ? WHERE id = ?",
                    (updated_user['email'], updated_user['password'], updated_user['role'], updated_user['id']))
        
        conn.commit()
        conn.close()

    except Exception as e:
        print(f"Error while updating user: {e}")
        return jsonify({"error": "Failed to update user"}), 500
    
    return jsonify("updated user in sqlite")

@app.route('/deleteUser', methods=['DELETE'])
def delete_user():
    try:
        data = request.json
        user_id = data.get('id')

        if user_id is None:
            return jsonify({"error": "User ID is required"}), 400

        conn = connectToDatabase()
        cur = conn.cursor()
        cur.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
        conn.close()

        return jsonify({"message": f"User with ID {user_id} deleted successfully"}), 200

    except Exception as e:
        print(f"Error while deleting user: {e}")
        return jsonify({"error": "Failed to delete user"}), 500


# ------------------------ Order Functions ------------------------
@app.route('/getOrders')
def get_orders():

    try:
        orders = []
        conn = connectToDatabase()
        cur = conn.cursor()

        cur.execute("SELECT * FROM orders")
        results = cur.fetchall()
        conn.commit()
        conn.close()

        for result in results:
            new_row = {'id' : result[0], 'email' : result[1], 'address': result[2], 'items' : result[3], 'orderDate': result[4]}
            orders.append(new_row)

        return jsonify(orders)

    except Exception as e:
        print(f"Error while getting orders: {e}")
        return jsonify({"error": "Failed to load orders"}), 500
    

@app.route('/addNewOrder', methods=['POST'])
def add_new_order():

    try:
        newOrder = request.json

        conn = connectToDatabase()
        cur = conn.cursor()
        
        cur.execute("INSERT INTO orders(email, address, items, orderDate) VALUES(?, ?, ?, ?)", 
                    (newOrder['email'], newOrder['address'], str(newOrder['items']), newOrder['orderDate']))
        
        conn.commit()
        # Get the inserted product using the auto-incremented ID
        newId = cur.lastrowid
        cur.execute("SELECT * FROM orders WHERE id = ?", (newId,))
        addedOrder = cur.fetchone()

        conn.close()

        # Convert to dict if needed
        orderDict = {
            "id": addedOrder[0],
            "email": addedOrder[1],
            "address": addedOrder[2],
            "items": addedOrder[3],
            "orderDate": addedOrder[4]
        }

        return jsonify(orderDict), 201

    except Exception as e:
        print(f"Error while adding new order: {e}")
        return jsonify({"error": "Failed to add new order"}), 500

    return jsonify("new order added")

@app.route('/updateOrder', methods=['PUT'])
def update_order():
    try:
        updated_order = request.json

        conn = connectToDatabase()
        cur = conn.cursor()

        cur.execute("UPDATE orders SET email = ?, address = ?, items = ?, orderDate = ? WHERE id = ?",
                    (updated_order['email'], updated_order['address'], str(updated_order['items']), updated_order['orderDate'], updated_order['id']))
        
        conn.commit()
        conn.close()

    except Exception as e:
        print(f"Error while updating order: {e}")
        return jsonify({"error": "Failed to update order"}), 500
    
    return jsonify("updated order in sqlite")

@app.route('/deleteOrder', methods=['DELETE'])
def delete_order():
    try:
        deletion_order = request.json

        conn = connectToDatabase()
        cur = conn.cursor()

        cur.execute("DELETE FROM orders WHERE id = ?", (deletion_order['id'],))

        conn.commit()
        conn.close()

    except Exception as e:
        print(f"Error while deleting order: {e}")
        return jsonify({"error": "Failed to delete order"}), 500
    
    return jsonify("deleted order in sqlite")

# ------------------------ Email Function ------------------------
@app.route('/sendEmail', methods=['POST'])
def send_email():
    orderDetails = request.json


    msg = Message("Thank you for your order.", sender = 'teaco34567@gmail.com', recipients=[orderDetails['email']])

    items_list = "\n".join(
    [f"- Product ID: {item['productId']:<5} Quantity: {item['quantity']}" 
     for item in orderDetails['items']])

    msg.body = f"""Thank you for your order!

Your order details:
{items_list}

Order Total: ${float(orderDetails['total']):.2f}

Please contact us if you have any questions about your order.

Thank you for shopping with us!
    """
    mail.send(msg)
    return jsonify("Email has been sent")



if __name__ == '__main__':
    app.run(debug=True)

