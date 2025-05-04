const addProductForm = document.querySelector("#add-product-form");
const productList = document.querySelector(".product-list tbody");
let currentlyEditingId = null;

async function load_admin_products(){
    try {
        // wait for database to be ready
        await new Promise(resolve => {
            if (db) return resolve();
            const checkDB = setInterval(() => {
                if (db) {
                    clearInterval(checkDB);
                    resolve();
                }
            }, 100);
        });

        // Load all products from the store
        let products = await loadAllFromStore('products');

        products.sort((a, b) => Number(a.id) - Number(b.id)); // sort by id

        productList.innerHTML = ""; // clear previous rows

        // render each product in display mode
        products.forEach(product => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>$${parseFloat(product.price).toFixed(2)}</td>
                <td>${product.description}</td>
                <td><img src="assets/images/${product.image}" alt="${product.image}" style="max-width: 50px;"></td>
                <td>
                    <button class="edit-btn" data-id="${product.id}">Edit</button>
                    <button class="delete-btn" data-id="${product.id}">Delete</button>
                </td>
            `;
            productList.appendChild(row);

            // Attach event listeners for editing and deletion
            row.querySelector(".edit-btn").addEventListener("click", () => loadEditForm(product));
            row.querySelector(".delete-btn").addEventListener("click", () => {
                // Ensure you have a deleteProduct() or call delete_object() directly.
                if (confirm("Delete this product?")) {
                    delete_object(product.id, "products");
                    load_admin_products();  // reload list after deletion
                }
            });
        });
    }
    catch (error) {
        console.error('Error displaying products:', error);
    }
}

function renderProductRow(product) {
    // to reset a row to read mode e.g. after editing 
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>$${parseFloat(product.price).toFixed(2)}</td>
        <td>${product.description}</td>
        <td><img src="assets/images/${product.image}" alt="${product.image}" style="max-width: 50px;"></td>
        <td>
            <button class="edit-btn" data-id="${product.id}">Edit</button>
            <button class="delete-btn" data-id="${product.id}">Delete</button>
        </td>
    `;

    row.querySelector(".edit-btn").addEventListener("click", () => loadEditForm(product));
    row.querySelector(".delete-btn").addEventListener("click", () => {
        if (confirm("Delete this product?")) {
            delete_object(product.id, "products");
            load_admin_products();
        }
    });
    return row;
}

// switch row to edit mode
function loadEditForm(product) {
    if (currentlyEditingId) {
        alert("Finish editing the current row first.");
        return;
    }
    currentlyEditingId = product.id;

    // disable all other edit and delete buttons
    document.querySelectorAll(".edit-btn, .delete-btn").forEach(btn => {
        if (btn.dataset.id !== String(product.id)) {
            btn.disabled = true;
        }
    });

    const row = [...productList.children].find(
        tr => tr.querySelector(".edit-btn")?.dataset.id === String(product.id)
    );
    if (!row) return;

    row.innerHTML = `
        <td>${product.id}</td>
        <td><input type="text" class="edit-name" value="${product.name}"></td>
        <td><input type="text" class="edit-category" value="${product.category}"></td>
        <td><input type="number" class="edit-price" step="0.01" value="${product.price}"></td>
        <td><textarea class="edit-description">${product.description}</textarea></td>
        <td><input type="text" class="edit-image" value="${product.image}"></td>
        <td>
            <button class="cancel-btn">Cancel</button>
            <button class="confirm-btn">Confirm</button>
        </td>
    `;

    // cancel button reverts to display mode using resetRow()
    row.querySelector(".cancel-btn").addEventListener("click", async () => {
        const original = await searchForObject(product.id, "products");
        const freshRow = renderProductRow(original);
        productList.replaceChild(freshRow, row);
        restoreEditButtons();
        currentlyEditingId = null;
    });

    // confirm button saves changes and returns row to display mode
    row.querySelector(".confirm-btn").addEventListener("click", async () => {
        const updatedProduct = {
            id: product.id,
            name: row.querySelector(".edit-name").value.trim(),
            category: row.querySelector(".edit-category").value.trim(),
            price: parseFloat(row.querySelector(".edit-price").value),
            description: row.querySelector(".edit-description").value.trim(),
            image: row.querySelector(".edit-image").value.trim()
        };
    
        await updateObject(updatedProduct, "products");
        const freshRow = renderProductRow(updatedProduct);
        productList.replaceChild(freshRow, row);
        restoreEditButtons();
        currentlyEditingId = null;
    });
}

async function resetRow(product) {
    const currentProduct = await searchForObject(product.id, "products");
    if (!currentProduct) {
        console.error("Product not found in database.");
        return;
    }

    const row = [...productList.children].find(
        tr => tr.querySelector(".cancel-btn, .confirm-btn, .edit-btn")?.dataset.id === String(product.id)
    );
    if (!row) return;

    row.innerHTML = `
        <td>${currentProduct.id}</td>
        <td>${currentProduct.name}</td>
        <td>${currentProduct.category}</td>
        <td>$${parseFloat(currentProduct.price).toFixed(2)}</td>
        <td>${currentProduct.description}</td>
        <td><img src="assets/images/${currentProduct.image}" alt="${currentProduct.image}" style="max-width: 50px;"></td>
        <td>
            <button class="edit-btn" data-id="${currentProduct.id}">Edit</button>
            <button class="delete-btn" data-id="${currentProduct.id}">Delete</button>
        </td>
    `;

    row.querySelector(".edit-btn").addEventListener("click", () => loadEditForm(currentProduct));
    row.querySelector(".delete-btn").addEventListener("click", () => {
        if (confirm("Delete this product?")) {
            delete_object(currentProduct.id, "products");
            load_admin_products();
        }
    });
}

addProductForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const product = {
        name: document.querySelector("#product-name").value.trim(),
        category: document.querySelector("#product-category").value,
        price: parseFloat(document.querySelector("#product-price").value),
        description: document.querySelector("#product-description").value.trim(),
        image: document.querySelector("#product-image").value.trim()
    };

    await add_new_object(product, "products"); 
    addProductForm.reset();                    
    load_admin_products();
});

function restoreEditButtons() {
    document.querySelectorAll(".edit-btn, .delete-btn").forEach(btn => {
        btn.disabled = false;
    });
}

// load the product list when the DOM is ready.
document.addEventListener("DOMContentLoaded", () => {
    load_admin_products();
});

function confirmLogout() {
    if (confirm("Are you sure you want to logout?")) {
        window.location.href = "main.html"; // return to main html
    }
}