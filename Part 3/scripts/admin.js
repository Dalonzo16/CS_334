const addProductForm = document.querySelector("#add-product-form");
const productList = document.querySelector(".product-list tbody");

async function load_admin_products(){


     //IMPORTANT! this block of the try statement MUST be in your method if you are usint the DB CRUD operations 
    try {
        // Wait for database to be ready
        await new Promise(resolve => {
            if (db) return resolve();
            const checkDB = setInterval(() => {
                if (db) {
                    clearInterval(checkDB);
                    resolve();
                }
            }, 100);
        });
        /*************************************/


        //load the products from DB 'await' keyword must be used here
        let products = await load_products();
        

        //load products to html
        products.forEach(product => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>$${product.price}</td>
                <td>${product.description}</td>
                <td><img src="${"assets/images/"+product.image}" alt="${product.image}"></td>
                <td>
                    <button class="edit-btn" data-id="${product.id}">Edit</button>
                    <button class="delete-btn" data-id="${product.id}">Delete</button>
                </td>
            `;
            productList.appendChild(row);

            // Add event listeners for the Edit and Delete buttons
            row.querySelector(".edit-btn").addEventListener("click", function() {
                loadEditForm(product);
            });
            row.querySelector(".delete-btn").addEventListener("click", function() {
                deleteProduct(product.id);
            });
        });
    }
    catch (error) {
        console.error('Error displaying products:', error);
    }
}

load_admin_products();