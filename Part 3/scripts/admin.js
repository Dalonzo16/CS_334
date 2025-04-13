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

function loadEditForm(product) {
    // find the row of the item where the button was clicked
    const row = [...productList.children].find(
        tr => tr.querySelector(".edit-btn")?.dataset.id === String(product.id)
    );

    if (!row) return;

    // replace text with input fields
    row.innerHTML = `
        <td>${product.id}</td>
        <td><input type="text" value="${product.name}"></td>
        <td><input type="text" value="${product.category}"></td>
        <td><input type="number" step="0.01" value="${product.price}"></td>
        <td><textarea>${product.description}</textarea></td>
        <td><input type="text" value="${product.image}"></td>
        <td>
            <button class="cancel-btn">Cancel</button>
            <button class="confirm-btn">Confirm</button>
        </td>
    `;

    // add event listeners
    row.querySelector(".cancel-btn").addEventListener("click", () => {
        // reset the row to its original non-editable state
        resetRow(product);
    });

    row.querySelector(".confirm-btn").addEventListener("click", () => {
        const updatedProduct = {
            id: product.id,
            name: row.querySelector('input[type="text"]:nth-of-type(1)').value.trim(),
            category: row.querySelector('input[type="text"]:nth-of-type(2)').value.trim(),
            price: parseFloat(row.querySelector('input[type="number"]').value),
            description: row.querySelector('textarea').value.trim(),
            image: row.querySelector('input[type="text"]:nth-of-type(3)').value.trim()
        };
        // Save changes
        saveProduct(updatedProduct);
    });
}

load_admin_products();