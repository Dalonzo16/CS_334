document.addEventListener("DOMContentLoaded", () => {
	// Retrieve cart data from localStorage or initialize an empty cart
	const cart = JSON.parse(localStorage.getItem("cart")) || [];
	console.log(cart); // Debugging

	// Get references to DOM elements
	const orderSummary = document.getElementById("order-summary");
	const emptyCartMessage = document.querySelector(".empty-cart-message");

	const waitForDB = new Promise(resolve => {
		if (db) return resolve();
		const checkDB = setInterval(() => {
			if (db) {
				clearInterval(checkDB);
				resolve();
			}
		}, 100);
	});

	waitForDB
		.then(() => loadAllFromStore("products"))
		.then((products) => {
			console.log(products); // Debugging

			// If the cart is empty, show a message and stop rendering
			if (cart.length === 0) {
				emptyCartMessage.style.display = "block";
				return;
			}

			let total = 0; // Track the overall cart total

			// Loop through each item in the cart
			cart.forEach((cartItem) => {
				// Find the matching product from the loaded 'products' array
				const product = products.find((p) => Number(p.id) === cartItem.id);

				// Debugging
				console.log("cartItem.id:", cartItem.id, "type:", typeof cartItem.id);
				console.log("product:", product ? product : "No product found");

				// If the product is found, display it in the cart summary
				if (product) {
					const itemTotal = parseFloat(product.price) * cartItem.quantity;
					total += itemTotal;

					// Create a div for this cart item
					const itemDiv = document.createElement("div");
					itemDiv.classList.add("cart-item");

					// Populate the item div with product info
					itemDiv.innerHTML = `
						<img src="assets/images/${product.image}" alt="${product.name}" style="width:100px;">
						<div>
							<h3>${product.name}</h3>
							<p>${product.description}</p>
							<p>Quantity: ${cartItem.quantity}</p>
							<p>Price: $${product.price}</p>
							<p><strong>Subtotal: $${itemTotal.toFixed(2)}</strong></p>
							<button class="remove-btn" data-id="${cartItem.id}">Remove</button>
						</div>
					`;

					// Add the item div to the order summary
					orderSummary.appendChild(itemDiv);
				}
			});

			// Create and display the total price section
			const totalDiv = document.createElement("div");
			totalDiv.classList.add("cart-total");
			totalDiv.innerHTML = `<h2>Total: $${total.toFixed(2)}</h2>`;
			orderSummary.appendChild(totalDiv);

			// Add event listeners to all "Remove" buttons
			document.querySelectorAll(".remove-btn").forEach((button) => {
				button.addEventListener("click", (e) => {
					const idToRemove = Number(e.target.getAttribute("data-id"));

					// Filter out the removed item and update localStorage
					const updatedCart = cart.filter(item => item.id !== idToRemove);
					localStorage.setItem("cart", JSON.stringify(updatedCart));

					// Reload the page to reflect changes
					location.reload();
				});
			});
		})
		.catch((error) => {
			// Handle error if loading from IndexedDB fails
			console.error("Error loading products from IndexedDB:", error);
			orderSummary.innerHTML = "<p>Something went wrong. Please try again later.</p>";
		});

	// Handle checkout form submission
	const checkoutForm = document.getElementById("checkout-form");
	checkoutForm.addEventListener("submit", (e) => {
		e.preventDefault(); // Prevent actual form submission

		// Get and validate form field values
		const name = document.getElementById("full-name").value.trim();
		const email = document.getElementById("email").value.trim();
		const address = document.getElementById("address").value.trim();
		const payment = document.getElementById("payment").value;
		const cardNumber = document.getElementById("card-number").value.trim();

		if (!name || !email || !address || !payment || !/^\d{16}$/.test(cardNumber)) {
			alert("Please fill out all fields correctly.");
			return;
		}

		// Simulate successful order submission
		alert("Thank you for your order!");

		// Clear cart from localStorage
		localStorage.removeItem("cart");

		// Show a success message in place of the cart summary
		orderSummary.innerHTML = "<h2>Your order has been placed successfully!</h2>";

		// Reset the checkout form
		checkoutForm.reset();
	});
});
