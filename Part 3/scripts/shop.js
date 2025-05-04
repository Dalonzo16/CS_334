let selectedCategory = "all";
let selectedPrice = "all";

// Main function to load and display filtered products
async function displayProducts() {
    const shopContainer = document.querySelector(".shop-products");
    shopContainer.innerHTML = ""; // Clear existing items

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
    //**********************************************/
        
        //load products 'await' key word must be used here
        let products = await load_products();

        // Debugging
        console.log(products);

        // Filter products by selected category and price
        products = products.filter(product => {
            // ignore malformed products
            if(!product.id)
                return false;

            // Match selected category (or "all")
            const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;

            // Match selected price range
            let matchesPrice = true;
            if(selectedPrice === "low") {
                matchesPrice = product.price < 10;
            } else if(selectedPrice === "mid") {
                matchesPrice = product.price >= 10 && product.price <= 20;
            } else if (selectedPrice === "high") {
                matchesPrice = product.price > 20;
            }

            return matchesCategory && matchesPrice;
        });

        // If no products match filters, a message is displayed
        if (products.length === 0) {
            shopContainer.innerHTML = "<p class='no-products-message'>No products found matching your filters.</p>";
            return;
        }

        // Render each product that passed the filters
        products.forEach(product => {
            const productHTML = `
                <div class="product">
                    <img src="${"assets/images/"+product.image}" alt="${product.name}">
                    <p class="type">${product.category}</p>
                    <h3>${product.name}</h3>
                    <p>$${product.price}</p>
                    <p class="description">${product.description}</p>
                    <button onclick="addToCart(${product.id})">Add to Cart</button>
                </div>
            `;
            shopContainer.innerHTML += productHTML;
        });

    }

    catch (error) {
        console.error('Error displaying products:', error);
    }
}

// Setup filter even listeners and initial product load
document.addEventListener("DOMContentLoaded", () => {
    const categorySelect = document.getElementById("category");
    const priceSelect = document.getElementById("price");

    // When the category filter changes, re-render products
    categorySelect.addEventListener("change", () => {
        selectedCategory = categorySelect.value;
        displayProducts();
    });

    // When the price filter changes, re-render products
    priceSelect.addEventListener("change", () => {
        selectedPrice = priceSelect.value;
        displayProducts();
    });

    // Initial product load on page load
    displayProducts();
});