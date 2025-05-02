let db;
const DB_NAME = 'TeaShopDB';
const DB_VERSION = 1;
const JSON_FILE_PATH = 'assets/data/initial.json';

// open the database
const dbReq = indexedDB.open(DB_NAME, DB_VERSION);

dbReq.onupgradeneeded = function(event) {
    db = event.target.result;

    console.log("Upgrading or creating database...");

    // Create object stores with autoIncrement id
    if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains('orders')) {
        db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
    }

    event.target.transaction.oncomplete = function() {
        console.log("Object stores created, populating...");
        populateDB(); // populate only once after upgrade
    };
};

dbReq.onsuccess = function(event) {
    db = event.target.result;
    console.log("Database opened successfully!");
};

dbReq.onerror = function(event) {
    console.error("Database error:", event.target.errorCode);
};


// this function populates the object stores from the initial.json file
// this function populates the object stores from the initial.json file
async function populateDB() {
    try {
        const responseProduct = await fetch('http://127.0.0.1:5000/getProducts');
        const dataProduct = await responseProduct.json();

        const responseUser = await fetch('http://127.0.0.1:5000/getUsers');
        const dataUser = await responseUser.json();

        const responseOrder = await fetch('http://127.0.0.1:5000/getOrders');
        const dataOrder = await responseOrder.json();

        const tx = db.transaction(['products', 'users', 'orders'], 'readwrite');
        const productStore = tx.objectStore('products');
        const userStore = tx.objectStore('users');
        const orderStore = tx.objectStore('orders');

        // Optional: Clear existing data
        await Promise.all([
            productStore.clear(),
            userStore.clear(),
            orderStore.clear()
        ]);

        // Insert fresh data
        if (Array.isArray(dataProduct)) {
            dataProduct.forEach(product => {
                productStore.put(product); // put = add or update
            });
        }
        if (Array.isArray(dataUser)) {
            dataUser.forEach(user => {
                userStore.put(user);
            });
        }
        if (Array.isArray(dataOrder)) {
            dataOrder.forEach(order => {
                orderStore.put(order);
            });
        }

        tx.oncomplete = () => console.log('Database populated!');
        tx.onerror = event => console.error('Transaction error:', event.target.error);
    } catch (error) {
        console.error("Failed to populate database:", error);
    }
}

function add_new_object(new_item_object, objectStoreName) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(objectStoreName, 'readwrite');
        const store = tx.objectStore(objectStoreName);
        const request = store.add(new_item_object);

        request.onsuccess = () => {
            console.log('Stored new object!');
            resolve();
        };
        request.onerror = (event) => {
            console.error('Error storing new object:', event.target.errorCode);
            reject(event.target.errorCode);
        };

        if(objectStoreName === 'products'){
            fetch("http://127.0.0.1:5000/addNewProduct", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(new_item_object),
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => console.error('Error storing product:', error));
        }

        else if(objectStoreName === 'users'){
            fetch("http://127.0.0.1:5000/addNewUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(new_item_object),
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => console.error('Error storing user:', error));
        }

        else if(objectStoreName === 'orders'){
            fetch("http://127.0.0.1:5000/addNewOrder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(new_item_object),
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => console.error('Error storing order:', error));
        }
    });
	
}


//deletes an object form an object store
function delete_object(objectID, objectStoreName){

    //creating transaction and getting object store
    const tx = db.transaction(objectStoreName, 'readwrite');
    const store = tx.objectStore(objectStoreName);

    //delete object from DB
    store.delete(objectID);

    //success and error handling
    tx.oncomplete = function() {console.log('item number ' + objectID + ' removed')}
    tx.onerror = function(event) {
        alert('error deleteing product' + event.target.errorCode);
    }

    if(objectStoreName === 'products'){

        fetch("http://127.0.0.1:5000/deleteProduct", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ productID: objectID })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => console.error('Error storing order:', error));
    }
}

//updates object in an object store
function updateObject(updatedObject, objectStoreName) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(objectStoreName, 'readwrite');
        const store = tx.objectStore(objectStoreName);
        const request = store.put(updatedObject);

        request.onsuccess = () => {
            console.log('Item updated successfully');
        };

        request.onerror = (event) => {
            console.error('Error updating item:', event.target.errorCode);
            reject(event.target.errorCode);
        };

        tx.oncomplete = () => resolve(); // resolve when transaction is done
        tx.onerror = (event) => reject(event.target.errorCode);

        if(objectStoreName === 'products'){

            fetch("http://127.0.0.1:5000/updateProduct", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedObject),
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => console.error('Error storing product:', error));
        }

        else if(objectStoreName === 'users'){

            fetch("http://127.0.0.1:5000/updateUser", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedObject),
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => console.error('Error storing user:', error));
        }

        else if(objectStoreName === 'orders'){

            fetch("http://127.0.0.1:5000/updateOrder", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedObject),
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => console.error('Error storing order:', error));
        }
    });

}


//must put "await" keyword in front of this method when using it
//This method searches and returns a particular object by the ID
function searchForObject(objectID, objectStoreName){

    return new Promise((resolve, reject) => { 

        //create transaction
        const tx = db.transaction(objectStoreName, 'readonly');

        //get object store
        const store = tx.objectStore(objectStoreName);

        //create request
        const request = store.get(objectID); 
    
        //handles succesful request
        request.onsuccess = () => resolve(request.result);
        
        //hanldes error for the request
        request.onerror = () => reject(request.error); 
      });
}

//checks to see if an object store is empty
function isEmpty(object_store){
    return new Promise((resolve, reject) => {
        //Create a read-only transaction
        const tx = db.transaction(object_store, 'readonly');
        
        //Get the object store reference
        const store = tx.objectStore(object_store);
        
        //Create a count request
        const request = store.count();
    
        //Handle successful count
        request.onsuccess = () => resolve(request.result === 0) // Returns true if count > 0
        
        //Handle errors
        request.onerror = () => reject(request.error);
      });
}

function loadAllFromStore(storeName) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}