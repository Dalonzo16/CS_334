document.addEventListener("DOMContentLoaded", () => {
    const productGrid = document.querySelector(".shop-products");
    const cartCount = document.getElementById("cart-count");

    // Fetch CSV file and process data
    fetch("assets/data/products.csv") //WILL BE SWAPPED WITH DATABASE
        .then(response => response.text())
        .then(data => {
            const products = parseCSV(data);
            displayProducts(products);
        })
        .catch(error => console.error("Error loading products:", error));

    // Parse CSV text into an array of objects
    function parseCSV(data) {
        const lines = data.split("\n").slice(1); // Skip the header row
        return lines.map(line => {
            const [id, name, category, price, description, image] = line.split("|");
            return { id, name, category, price, description, image };
        });
    }

    // Generate HTML for products
    function displayProducts(products) {
        const shopContainer = document.querySelector(".shop-products");
        shopContainer.innerHTML = ""; // Clear existing items
    
        products.forEach(product => {
            if (!product.id) return;
    
            const productHTML = `
                <div class="product">
                    <img src="${"assets/images/"+product.image}" alt="${product.name}">
                    <p class="type">${product.category} Tea</p>
                    <h3>${product.name}</h3>
                    <p>$${product.price}</p>
                    <p class="description">${product.description}</p>
                    <button onclick="addToCart(${product.id})">Add to Cart</button>
                </div>
            `;
            shopContainer.innerHTML += productHTML;
        });
    }

    // Capitalize first letter of a string
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function addToCart(productId) {
        // Ensure cart is using the global variable
        if (!cart.includes(productId)) {
            cart.push(productId);
            updateCartStorage();
            alert("Item added to cart!"); // Optional feedback
        } else {
            alert("Item is already in the cart.");
        }
    }

    updateCartCount();
});
