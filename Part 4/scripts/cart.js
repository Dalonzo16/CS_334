// Load cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

// Save cart to the local storage
function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Add product to cart by ID
function addToCart(productId) {
    let cart = getCart();

    // Check if item already exists
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        // If item exists, incremement the quantity
        existingItem.quantity += 1;
    } else {
        // If it doesn't exist, add it with quantity 1
        cart.push({id: productId, quantity: 1});
    }

    // Save the updated cart and refresh the cart count display
    saveCart(cart);
    updateCartCount();
}

// Calculate the total number of items in the cart
function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Update the cart count displayed on the cart icon
function updateCartCount() {
    const count = document.getElementById("cart-count");
    if(count) {
        count.textContent = getCartItemCount();
    }
}

// When the page finishes loading, display the current cart item count
document.addEventListener("DOMContentLoaded", updateCartCount);