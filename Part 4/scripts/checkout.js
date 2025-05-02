let total = 0;
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


	// format card number input
	document.getElementById("card-number").addEventListener("input", function(e) {
		let value = e.target.value.replace(/\D/g, ""); // remove non-digits
		value = value.substring(0, 16); // limit to 16 digits (real digits, no spaces)
		let formatted = value.match(/.{1,4}/g); // split into groups of 4
		e.target.value = formatted ? formatted.join(" ") : "";
	});

	// Handle checkout form submission
	const checkoutForm = document.getElementById("checkout-form");
	checkoutForm.addEventListener("submit", async(e) => {
		e.preventDefault(); // Prevent actual form submission

		// Get and validate form field values
		const name = document.getElementById("full-name").value.trim();
		const email = document.getElementById("email").value.trim();
		const address = document.getElementById("address").value.trim();
		const payment = document.getElementById("payment").value;
		const cardNumber = document.getElementById("card-number").value.trim();

		const cleanCardNumber = cardNumber.replace(/\s/g, ""); // remove spaces
		if (!name || !email || !address || !payment || !/^\d{16}$/.test(cleanCardNumber)) {
			alert("Please fill out all fields correctly.");
			return;
		}

		
		await placeOrder(cart, email, address); // save order to DB
		alert("Thank you for your order!");
		orderSummary.innerHTML = "<h2>Your order has been placed successfully!</h2>"; // Show success message
		checkoutForm.reset(); // Reset the checkout form
		localStorage.removeItem("cart"); // Clear cart from localStorage
	});
});

async function placeOrder(cart, email, address) {
    if (!db) {
        console.error("Database not ready.");
        return;
    }


	// get and format the current date
	const now = new Date();
    const formattedDate = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;

    // Prepare order object
    const order = {
        email: email,
		address: address,
        items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity
        })),
        orderDate: formattedDate
    };


    try {
        // Save order to the "orders" object store
        await add_new_object(order, "orders");
        console.log("Order placed successfully:", order);
    } catch (error) {
        console.error("Error placing order:", error);
    }

	send_confimration_email(order.email, order.items, total);
}

async function send_confimration_email(email, items, total){

	const orderDetails = {
		email: email,
		items: items,
		total: total,
	}


	await fetch("https://Group1.pythonanywhere.com/sendEmail", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(orderDetails),
	})
	.then(response => response.json())
	.then(data => {
		console.log(data);
	})
	.catch(error => console.error('Error sending email:', error));
	
	
}

