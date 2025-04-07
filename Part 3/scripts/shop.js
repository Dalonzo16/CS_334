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

        //populate html from DB
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

    catch (error) {
        console.error('Error displaying products:', error);
    }
}


displayProducts();




