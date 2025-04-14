let db;
const DB_NAME = 'TeaShopDB';
const DB_VERSION = 1;
const JSON_FILE_PATH = 'assets/data/initial.json';

//open a database request
let dbReq = indexedDB.open(DB_NAME, DB_VERSION);

//on upgrade checks to see if there is a different version
dbReq.onupgradeneeded = function(event) {
    // Set the db variable to our database so we can use it 
    db = event.target.result;

    db.createObjectStore('products', {
        keyPath: 'id',
        autoIncrement: true
    });
    db.createObjectStore('users', {
        keyPath: 'id',
        autoIncrement: true
    });
    db.createObjectStore('orders', {
        keyPath: 'id',
        autoIncrement: true
    });
}

//if DB is opened successfully then initialize the db variable and populate the DB
dbReq.onsuccess = function(event) {
    db = event.target.result;
    populateDB(); 
}

//this function populates the object store 'products' from JSON file
async function populateDB(){

    //check if the object store 'products' is empty
    const productsEmpty = await isEmpty('products');
    const usersEmpty = await isEmpty('users')
    const ordersEmpty = await isEmpty('orders')

    if(!productsEmpty && !usersEmpty && !ordersEmpty){

        //if its not then display this message and do nothing
        console.log("This object stores are not empty");
        return;
    }
    try {
        //if it is empty then fetch the JSON file and populate the 'products' object store
        const response = await fetch(JSON_FILE_PATH);
        const data = await response.json()
    
        let tx = db.transaction(['products', 'users', 'orders'], 'readwrite');
        let productStore = tx.objectStore('products');
        let userStore = tx.objectStore('users');
        let orderStore = tx.objectStore('orders');

        // ensure that object store need to be populated, and JSON data exists and is an array
        if (productsEmpty && Array.isArray(data.products)) {
            data.products.forEach(product => productStore.add(product).onsuccess = () => {
                console.log(`Added product: ${product.name}`)
            });
        }
        // ensure that object store need to be populated, and JSON data exists and is an array
        if (usersEmpty && Array.isArray(data.users)) {
            data.users.forEach(user => userStore.add(user).onsuccess = () => {
                console.log(`Added user: ${user.name}`)
            });
        }
        // ensure that object store need to be populated, and JSON data exists and is an array
        if (ordersEmpty && Array.isArray(data.orders)) {
            data.orders.forEach(order => orderStore.add(order).onsuccess = () => {
                console.log(`Added order: ${order.id}`)
            });
        }

        tx.oncomplete = function() { console.log('populated the database!') }
        tx.onerror = function(event) {
            alert('error populating the database ' + event.target.errorCode);
        }
    } catch (error) {
        console.error("Failed to fetch and populate DB:", error);
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