// Reference the "Add User" form and the table body (adjust selectors if your HTML differs)
const addUserForm = document.querySelector("#add-user-form");
const userList = document.querySelector(".user-list tbody");
let currentlyEditingId = null;

// Load and display all users from IndexedDB
async function load_admin_users() {
    try {
        // Wait for DB to be ready
        await new Promise(resolve => {
            if (db) return resolve();
            const checkDB = setInterval(() => {
                if (db) {
                    clearInterval(checkDB);
                    resolve();
                }
            }, 100);
        });

        // Fetch all users from the store
        let users = await loadAllFromStore("users");

        // Sort by ID
        users.sort((a, b) => Number(a.id) - Number(b.id));

        // Clear existing rows
        userList.innerHTML = "";

        // Render each user in display mode
        users.forEach(user => {
            const row = renderUserRow(user);
            userList.appendChild(row);
        });
    }
    catch (error) {
        console.error("Error displaying users:", error);
    }
}

// create a read-only row for a given user
function renderUserRow(user) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.email}</td>
        <td>${user.password}</td>
        <td>${user.role}</td>
        <td>
            <button class="edit-btn" data-id="${user.id}">Edit</button>
            <button class="delete-btn" data-id="${user.id}">Delete</button>
        </td>
    `;

    // Attach edit and delete handlers
    row.querySelector(".edit-btn").addEventListener("click", () => loadEditForm(user));
    row.querySelector(".delete-btn").addEventListener("click", () => {
        if (confirm("Delete this user?")) {
            delete_object(user.id, "users");
            load_admin_users(); // Refresh table
        }
    });

    return row;
}

// Switch a row into edit mode
function loadEditForm(user) {
    if (currentlyEditingId) {
        alert("Finish editing the current row first.");
        return;
    }
    currentlyEditingId = user.id;

    // Disable all other edit/delete buttons
    document.querySelectorAll(".edit-btn, .delete-btn").forEach(btn => {
        if (btn.dataset.id !== String(user.id)) {
            btn.disabled = true;
        }
    });

    // Find the row corresponding to this user
    const row = [...userList.children].find(
        tr => tr.querySelector(".edit-btn")?.dataset.id === String(user.id)
    );
    if (!row) return;

    // Replace row content with editable fields
    row.innerHTML = `
        <td>${user.id}</td>
        <td><input type="email" class="edit-email" value="${user.email}"></td>
        <td><input type="text" class="edit-password" value="${user.password}"></td>
        <td><input type="text" class="edit-role" value="${user.role}"></td>
        <td>
            <button class="cancel-btn">Cancel</button>
            <button class="confirm-btn">Confirm</button>
        </td>
    `;

    // Cancel reverts to original read-only row
    row.querySelector(".cancel-btn").addEventListener("click", async () => {
        const original = await searchForObject(user.id, "users");
        const freshRow = renderUserRow(original);
        userList.replaceChild(freshRow, row);
        restoreEditButtons();
        currentlyEditingId = null;
    });

    // Confirm saves changes and returns row to display mode
    row.querySelector(".confirm-btn").addEventListener("click", async () => {
        const updatedUser = {
            id: user.id,
            email: row.querySelector(".edit-email").value.trim(),
            password: row.querySelector(".edit-password").value.trim(),
            role: row.querySelector(".edit-role").value.trim()
        };

        await updateObject(updatedUser, "users");

        const freshRow = renderUserRow(updatedUser);
        userList.replaceChild(freshRow, row);
        restoreEditButtons();
        currentlyEditingId = null;
    });
}

// In case we need to reset a row after editing without finalizing
async function resetRow(user) {
    const currentUser = await searchForObject(user.id, "users");
    if (!currentUser) {
        console.error("User not found in database.");
        return;
    }

    const row = [...userList.children].find(
        tr => tr.querySelector(".cancel-btn, .confirm-btn, .edit-btn")?.dataset.id === String(user.id)
    );
    if (!row) return;

    const freshRow = renderUserRow(currentUser);
    userList.replaceChild(freshRow, row);
}

// Listen for form submission to add a new user
addUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = {
        email: document.querySelector("#user-email").value.trim(),
        password: document.querySelector("#user-password").value.trim(),
        role: document.querySelector("#user-role").value.trim()
    };

    await add_new_object(user, "users"); // Let IndexedDB auto-assign the ID
    addUserForm.reset();                // Clear form
    load_admin_users();                 // Reload table
});

// Re-enable any disabled edit/delete buttons
function restoreEditButtons() {
    document.querySelectorAll(".edit-btn, .delete-btn").forEach(btn => {
        btn.disabled = false;
    });
}

// Load the user list when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    load_admin_users();
});
