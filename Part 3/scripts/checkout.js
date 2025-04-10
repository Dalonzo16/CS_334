// Retrieve cart data from localStorage
function getCartItems() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

// Calculate the total price
function calculateTotal() {
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });
    return total.toFixed(2);
}

// Display the cart items and total price
function displayCart() {
    const cart = getCartItems();
    const cartSummary = document.getElementById('cart-summary');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartCount = document.getElementById('cart-count');

    if (cart.length === 0) {
        cartSummary.style.display = 'none';
        emptyCartMessage.style.display = 'block';
    } else {
        
    }
}