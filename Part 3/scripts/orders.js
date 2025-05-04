const orderTableBody = document.querySelector("#order-table-body");
let currentlyEditingId = null;

async function load_admin_orders() {
	try {
		await new Promise(resolve => {
			if (db) return resolve();
			const checkDB = setInterval(() => {
				if (db) {
					clearInterval(checkDB);
					resolve();
				}
			}, 100);
		});

		// Load all orders from the orders store
		let orders = await loadAllFromStore("orders");

		// Sort by ID so they are displayed in ascending order
		orders.sort((a, b) => Number(a.id) - Number(b.id));

		// Clear previous rows
		orderTableBody.innerHTML = "";

		// Render each order as a table row
		orders.forEach(order => {
			const row = renderOrderRow(order);
			orderTableBody.appendChild(row);
		});
	} catch (error) {
		console.error("Error displaying orders:", error);
	}
}

// Create and return a table row element for a given order in read-only mode
function renderOrderRow(order) {
	const row = document.createElement("tr");
	row.innerHTML = `
		<td>${order.id}</td>
		<td>${order.email}</td>
		<td>${order.address}</td>
		<td>${JSON.stringify(order.items)}</td>
		<td>${order.orderDate}</td>
		<td>
			<button class="edit-btn" data-id="${order.id}">Edit</button>
			<button class="delete-btn" data-id="${order.id}">Delete</button>
		</td>
	`;

	// Set up Edit and Delete handlers
	row.querySelector(".edit-btn").addEventListener("click", () => loadEditForm(order));
	row.querySelector(".delete-btn").addEventListener("click", () => {
		if (confirm("Delete this order?")) {
			delete_object(order.id, "orders");
			load_admin_orders();
		}
	});

	return row;
}

// Switch a row to edit
function loadEditForm(order) {
	if (currentlyEditingId) {
		alert("Finish editing the current row first.");
		return;
	}
	currentlyEditingId = order.id;

	// Disable all other edit/delete buttons to prevent multiple edits at once
	document.querySelectorAll(".edit-btn, .delete-btn").forEach(btn => {
		if (btn.dataset.id !== String(order.id)) {
			btn.disabled = true;
		}
	});

	// Find the row that matches our order
	const row = [...orderTableBody.children].find(
		tr => tr.querySelector(".edit-btn")?.dataset.id === String(order.id)
	);
	if (!row) return;

	row.innerHTML = `
		<td>${order.id}</td>
		<td><input type="email" class="edit-email" value="${order.email}"></td>
		<td><input type="address" class="edit-address" value="${order.address}"></td>
		<td><textarea class="edit-items">${JSON.stringify(order.items)}</textarea></td>
		<td><input type="date" class="edit-date" value="${order.orderDate}"></td>
		<td>
			<button class="cancel-btn">Cancel</button>
			<button class="confirm-btn">Confirm</button>
		</td>
	`;

	// Cancel button reverts to display mode
	row.querySelector(".cancel-btn").addEventListener("click", async () => {
		const original = await searchForObject(order.id, "orders");
		const freshRow = renderOrderRow(original);
		orderTableBody.replaceChild(freshRow, row);
		restoreEditButtons();
		currentlyEditingId = null;
	});

	// Confirm button saves changes, updates DB, returns row to display mode
	row.querySelector(".confirm-btn").addEventListener("click", async () => {
		// Attempt to parse the items as JSON
		let parsedItems;
		try {
			parsedItems = JSON.parse(row.querySelector(".edit-items").value);
		} catch (err) {
			alert("Items must be valid JSON (e.g., [{\"productId\":16,\"quantity\":2}]).");
			return;
		}

		const updatedOrder = {
			id: order.id,
			email: row.querySelector(".edit-email").value.trim(),
			address:row.querySelector(".edit-address").value.trim(),
			items: parsedItems,
			orderDate: row.querySelector(".edit-date").value
		};

		await updateObject(updatedOrder, "orders");

		const freshRow = renderOrderRow(updatedOrder);
		orderTableBody.replaceChild(freshRow, row);
		restoreEditButtons();
		currentlyEditingId = null;
	});
}

// reset a row to read-only using the current DB record
async function resetRow(order) {
	const currentOrder = await searchForObject(order.id, "orders");
	if (!currentOrder) {
		console.error("Order not found in database.");
		return;
	}

	const row = [...orderTableBody.children].find(
		tr => tr.querySelector(".cancel-btn, .confirm-btn, .edit-btn")?.dataset.id === String(order.id)
	);
	if (!row) return;

	const freshRow = renderOrderRow(currentOrder);
	orderTableBody.replaceChild(freshRow, row);
}


// enable any disabled edit delete buttons
function restoreEditButtons() {
	document.querySelectorAll(".edit-btn, .delete-btn").forEach(btn => {
		btn.disabled = false;
	});
}

// On DOM load, fetch all orders
document.addEventListener("DOMContentLoaded", () => {
	load_admin_orders();
});

function confirmLogout() {
    if (confirm("Are you sure you want to logout?")) {
        window.location.href = "main.html"; // return to main html
    }
}