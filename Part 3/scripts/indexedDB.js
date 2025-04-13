let db;

//open a database request
let dbReq = indexedDB.open('TeaShopDB', 1);

//on upgrade checks to see if there is a different version
dbReq.onupgradeneeded = function(event) {
  // Set the db variable to our database so we can use it 
  db = event.target.result;

  //create an object store named 'products' that uses "id" attribute as the key
  db.createObjectStore('products', {keyPath: "id"});
  // create user object store with userName attribute as key
  db.createObjectStore('users', {keyPath: "userName"})
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

    if(!productsEmpty && !usersEmpty){

        //if its not then display this message and do nothing
        console.log("This object stores are not empty");
        return;
    }
    //if it is empty then fetch the JSON file and populate the 'products' object store
    fetch('assets/data/initial.json')
    .then((response) => response.json())
    .then((products) => {

        let tx = db.transaction(['products', 'users'], 'readwrite');
        let productStore = tx.objectStore('products');
        let userStore = tx.objectStore('users');

        // ensure that object store need to be populated, and JSON data exists and is an array
        if (productsEmpty && Array.isArray(data.products)) {
            data.products.forEach(product => productStore.add(product));
        }
        // ensure that object store need to be populated, and JSON data exists and is an array
        if (usersEmpty && Array.isArray(data.users)) {
            data.users.forEach(user => userStore.add(user));
        }

        tx.oncomplete = function() { console.log('stored products!') }
        tx.onerror = function(event) {
            alert('error storing products ' + event.target.errorCode);
        }
    });
}

//when this method is used the keyword 'await' MUST be in front of it
//loads all of the items from the object store 'products'
function load_products(){
    return new Promise((resolve, reject) => { 

        //creaing transaction and getting object store
        const tx = db.transaction('products', 'readonly');
        const store = tx.objectStore('products');

        //fetching all items from the DB from the object store 'products'
        const request = store.getAll();
    
        //succeess and error handling
        request.onsuccess = () => resolve(request.result); 
        request.onerror = () => reject(request.error); 
      });
}

//adds a new object to DB
function add_new_object(new_item_object, objectStoreName){

    //creating transaction and getting object store
    const tx = db.transaction(objectStoreName, 'readwrite');
    const store = tx.objectStore(objectStoreName);

    //adds new object to DB
    store.add(new_item_object);

    //success and error handling
    tx.oncomplete = function() { console.log('stored new product!') }
    tx.onerror = function(event) {
        alert('error storing new product ' + event.target.errorCode);
  }
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
function updateObject(updatedObject, objectStoreName){

    //creating transaction and getting object store
    const tx = db.transaction(objectStoreName, 'readwrite');
    const store = tx.objectStore(objectStoreName);

    //update object store
    store.put(updatedObject);

    //error and success handling
    tx.oncomplete = function() {console.log('item updated')}
    tx.onerror = function(event) {
        alert('error updating product' + event.target.errorCode);
    }
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



