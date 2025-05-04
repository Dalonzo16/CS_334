let db;
const DB_NAME = 'TeaShopDB';
const DB_VERSION = 1;
const JSON_FILE_PATH = 'assets/data/initial.json';

// open the database
const dbReq = indexedDB.open(DB_NAME, DB_VERSION);

dbReq.onupgradeneeded = function(event) {
    db = event.target.result;

    console.log("Upgrading or creating database...");

    if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id', autoIncrement: false });
    }
    if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id', autoIncrement: false });
    }
    if (!db.objectStoreNames.contains('orders')) {
        db.createObjectStore('orders', { keyPath: 'id', autoIncrement: false });
    }

    event.target.transaction.oncomplete = function() {
        console.log("Object stores created, populating...");
        dbReady.then(() => populateDB()); // ensure db is available
    };
};


let dbReady = new Promise((resolve, reject) => {
    dbReq.onsuccess = function(event) {
        db = event.target.result;
        console.log("Database opened successfully!");
        resolve(db); // resolve only when DB is open
    };
    dbReq.onerror = function(event) {
        console.error("Database error:", event.target.errorCode);
        reject(event.target.errorCode);
    };
});



// this function populates the object stores from the initial.json file
// this function populates the object stores from the initial.json file
async function populateDB() {
    try {
        const responseProduct = await fetch('https://Group1.pythonanywhere.com/getProducts');
        const dataProduct = await responseProduct.json();

        const responseUser = await fetch('https://Group1.pythonanywhere.com/getUsers');
        const dataUser = await responseUser.json();

        const responseOrder = await fetch('https://Group1.pythonanywhere.com/getOrders');
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

async function add_new_object(newItemObject, objectStoreName) {
    let url = '';
    if (objectStoreName === 'products') url = '/addNewProduct';
    if (objectStoreName === 'users') url = '/addNewUser';
    if (objectStoreName === 'orders') url = '/addNewOrder';

    try {
        const response = await fetch(`https://Group1.pythonanywhere.com${url}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newItemObject),
        });

        const data = await response.json();

        await dbReady;

        if (objectStoreName === 'users') {
            await refreshIndexedDB('users'); // reset & sync users store
            return;
        }

        // Default behavior for products/orders — just add
        const tx = db.transaction(objectStoreName, 'readwrite');
        const store = tx.objectStore(objectStoreName);
        const request = store.add(data);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                console.log('Stored new object!');
                resolve();
            };
            request.onerror = (event) => {
                console.error('Error storing new object:', event.target.errorCode);
                reject(event.target.errorCode);
            };
        });

    } catch (error) {
        console.error('Error adding new object:', error);
    }
}

async function refreshIndexedDB(objectStoreName) {
    await dbReady;

    const tx = db.transaction(objectStoreName, 'readwrite');
    const store = tx.objectStore(objectStoreName);
    store.clear();

    tx.oncomplete = async () => {
        let url = '';
        if (objectStoreName === 'users') url = '/getUsers';
        if (objectStoreName === 'products') url = '/getProducts';
        if (objectStoreName === 'orders') url = '/getOrders';

        try {
            const res = await fetch(`https://Group1.pythonanywhere.com${url}`);
            const data = await res.json();

            const tx2 = db.transaction(objectStoreName, 'readwrite');
            const store2 = tx2.objectStore(objectStoreName);
            for (const item of data) {
                store2.put(item);
            }

            tx2.oncomplete = () => {
                console.log(`${objectStoreName} refreshed`);
            };
        } catch (err) {
            console.error(`Failed to refresh ${objectStoreName}:`, err);
        }
    };
}



//deletes an object form an object store
async function delete_object(objectID, objectStoreName) {
    await dbReady;

    const tx = db.transaction(objectStoreName, 'readwrite');
    const store = tx.objectStore(objectStoreName);

    store.delete(objectID);

    tx.oncomplete = () => {
        console.log(`Item ${objectID} removed`);
    };
    tx.onerror = event => {
        console.error('Error deleting object:', event.target.errorCode);
    };

    let url = '';
    if (objectStoreName === 'products') url = '/deleteProduct';
    if (objectStoreName === 'users') url = '/deleteUser';
    if (objectStoreName === 'orders') url = '/deleteOrder';

    try {
        await fetch(`https://Group1.pythonanywhere.com${url}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({id: objectID}),
        });
    } catch (error) {
        console.error('Error adding new object:', error);
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

            fetch("https://Group1.pythonanywhere.com/updateProduct", {
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

            fetch("https://Group1.pythonanywhere.com/updateUser", {
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

            fetch("https://Group1.pythonanywhere.com/updateOrder", {
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