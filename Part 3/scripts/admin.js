document.addEventListener("DOMContentLoaded", function() {
    const addProductForm = document.querySelector("#add-product-form");
    const productList = document.querySelector(".product-list tbody");

    // Fetch all products when the admin page loads
    function loadProducts() {
        fetch("http://127.0.0.1:5000/api/products")
            .then(response => response.json())
            .then(products => {
                productList.innerHTML = ''; // Clear the current list
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
            })
            .catch(error => console.error('Error fetching products:', error));
    }

    // Load the edit form with the current product details
    function loadEditForm(product) {
        document.querySelector("#product-id").value = product.id;
        document.querySelector("#product-name").value = product.name;
        document.querySelector("#product-category").value = product.category;
        document.querySelector("#product-price").value = product.price;
        document.querySelector("#product-description").value = product.description;
        document.querySelector("#product-image").value = product.image;

        document.querySelector("#add-product-btn").style.display = 'none';
        document.querySelector("#update-product-btn").style.display = 'inline-block';
    }

    // Submit form to add a new product or update an existing product
    addProductForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const productId = document.querySelector("#product-id").value;
        const newProduct = {
            name: document.querySelector("#product-name").value,
            category: document.querySelector("#product-category").value,
            price: document.querySelector("#product-price").value,
            description: document.querySelector("#product-description").value,
            image: document.querySelector("#product-image").value,
        };

        // Determine if it's an update or a new product
        if (productId) {
            // Update existing product
            newProduct.id = productId;
            updateProduct(newProduct);
        } else {
            // Add new product
            addProduct(newProduct);
        }
    });

    // Add a new product to the backend
    function addProduct(product) {
        fetch("http://127.0.0.1:5000/api/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(product),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Product added:', data);
            loadProducts(); // Reload products after adding
            resetForm(); // Reset form for next input
        })
        .catch(error => console.error('Error adding product:', error));
    }

    // Update an existing product in the backend
    function updateProduct(product) {
        fetch("http://127.0.0.1:5000/api/products", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(product),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Product updated:', data);
            loadProducts(); // Reload products after update
            resetForm(); // Reset form for next input
        })
        .catch(error => console.error('Error updating product:', error));
    }

    // Delete a product from the backend
    function deleteProduct(productId) {
        fetch(`http://127.0.0.1:5000/api/products?id=${productId}`, {
            method: "DELETE",
        })
        .then(response => response.json())
        .then(data => {
            console.log('Product deleted:', data);
            loadProducts(); // Reload products after deletion
        })
        .catch(error => console.error('Error deleting product:', error));
    }

    // Reset the form fields
    function resetForm() {
        addProductForm.reset();
        document.querySelector("#product-id").value = '';
        document.querySelector("#add-product-btn").style.display = 'inline-block';
        document.querySelector("#update-product-btn").style.display = 'none';
    }

    // Initialize the page by loading existing products
    loadProducts();
});
