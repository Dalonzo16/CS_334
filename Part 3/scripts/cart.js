// Load cart from the local storage
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

// Save cart to the local storage
function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Add product to cart by ID
function addToCart(productId) {
    // console.log("Product object: ", product);
    let cart = getCart();

    // Check if item already exists - increase quantity
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({id: productId, quantity: 1}); // Places one item into the cart
        // console.log("Added to cart: ", product.name, "price: ", product.price);
        // cart.push({
        //     name: product.name,
        //     price: parseFloat(product.price),
        //     image: product.image,
        //     quantity: 1}); // Places one item into the cart
    }

    saveCart(cart);
    updateCartCount();
    // showCartPopup(product);

    // Show popup with product details
    // fetchProductInfo(productId, product => {
    //     showCartPopup(product);
    // })
}

// Get total number of items in cart
function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Update the cart count on the cart icon
function updateCartCount() {
    const count = document.getElementById("cart-count");
    if(count) {
        count.textContent = getCartItemCount();
    }
}

// Get product info from IndexedDB by ID
// function fetchProductInfo(productId, callback) {
//     const tx = db.transaction("products", "readonly");
//     const store = tx.objectStore("products");
//     const request = store.get(productId);

//     request.onsuccess = function() {
//         callback(request.result);
//     };
// }

// Show the cart popup with product info
// function showCartPopup(product) {
//     const popup = document.getElementById("cart-popup");
//     const cart = getCart();
//     const cartItem = cart.find(item => item.id === product.id);

//     if(!popup || !cartItem)
//         return;
//     const imagePath = "../assets/images/" + product.image;
//     console.log("Popup product image path: ", imagePath);

//     if(product.image) {
//         document.getElementById("popup-image").src = imagePath;
//     } else {
//         console.log("Image not found for product: ", product.name);
//         document.getElementById("popup-image".src) = "assets/images/default.png";
//     }

//     console.log("Popup product image: ", product.image);
//     document.getElementById("popup-image").src = "assets/images/" + product.image;
//     document.getElementById("popup-name").textContent = product.name;
//     document.getElementById("popup-quantity").textContent = `Quantity: ${cartItem.quantity}`;
//     document.getElementById("popup-price").textContent = `Price: $${product.price}`;

//     popup.classList.remove("hidden");
//     popup.style.display = "block";
// }

// // Hide the cart popup
// function hideCartPopup() {
//     const popup = document.getElementById("cart-popup");
//     if (popup)
//         popup.style.display = "none";
// }

// // Setup popup nehavior when DOM is ready
// document.addEventListener("DOMContentLoaded", () => {
//     updateCartCount();

//     const closeBtn = document.querySelector(".close-popup");
//     const continueBtn = document.getElementById("continue-shopping");
//     const checkoutBtn = document.getElementById("go-to-checkout");

//     if (closeBtn) {
//         closeBtn.addEventListener("click", () => {
//             document.getElementById("cart-popup").style.display = "none";
//         });
//         // closeBtn.addEventListener("click", hideCartPopup)
//     }
//     if (continueBtn) {
//         // continueBtn.addEventListener("click", hideCartPopup);
//         continueBtn.addEventListener("click", () => {
//             document.getElementById("cart-popup").style.display = "none";
//         });
//     }
//     if (checkoutBtn) {
//         checkoutBtn.addEventListener("click", () => {
//             window.location.href = "checkout.html";
//         });
//     }
// });

// Update count when page loads
document.addEventListener("DOMContentLoaded", updateCartCount);