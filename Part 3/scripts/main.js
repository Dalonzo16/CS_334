
// Global Store
const store = {
    userId: localStorage.getItem("userId") || null,
    userPassword: localStorage.getItem("userPassword") || null,  // Not secure
    cart: JSON.parse(localStorage.getItem("cart")) || []
};

// Save store data persistently
function saveStore() {
    localStorage.setItem("userId", store.userId);
    localStorage.setItem("userPassword", store.userPassword);
    localStorage.setItem("cart", JSON.stringify(store.cart));
}

// Set user credentials (Login)
function setUser(userId, userPassword) {
    store.userId = userId;
    store.userPassword = userPassword;
    saveStore();
}

// Logout user (Clear credentials)
function logout() {
    store.userId = null;
    store.userPassword = null;
    saveStore();
}


// Function to add an item to the cart
function addToCart(productId) {
    // Check if the product is already in the cart
    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {
        // If the product is already in the cart, increment the quantity
        existingProduct.quantity += 1;
    } else {
        // If the product is not in the cart, add it with quantity 1
        cart.push({ id: productId, quantity: 1 });
    }

    // Update cart in localStorage and update cart count in UI
    updateCartStorage();
}

// Function to update cart in localStorage
function updateCartStorage() {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
        // Display the total number of items in the cart
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Remove an item from the cart
function removeFromCart(itemId) {
    store.cart = store.cart.filter(id => id !== itemId);
    saveStore();
}

// Clear cart
function clearCart() {
    store.cart = [];
    saveStore();
}

let cart = JSON.parse(localStorage.getItem("cart")) || [];


updateCartCount()
// Export store functions to be used in other scripts
window.appStore = {
    store,
    setUser,
    logout,
    addToCart,
    removeFromCart,
    clearCart
};
