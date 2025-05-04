let allUsers = new Map();

async function loadUsers() {
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

        const users = await loadAllFromStore('users');
        users.forEach(user => {
            allUsers.set(user.email, user.password);
        });

        console.log("Loaded users:", ...allUsers); // Debugging
    } catch (error) {
        console.error("Failed to load users:", error);
    }
}

function checkCredentials() {
    const inputEmailElement = document.getElementById("username");
    const inputPasswordElement = document.getElementById("password");

    const inputEmail = inputEmailElement.value.trim();
    const inputPassword = inputPasswordElement.value.trim();

    if (allUsers.has(inputEmail)) { // if email correct
        if (allUsers.get(inputEmail) === inputPassword) { // if password correct
            window.location.href = "management.html"; // successful login
        } else {
            alert("Incorrect password.");
            inputPasswordElement.value = ""; // clear password field
        }
    } else {
        alert("Email not found.");
        inputEmailElement.value = "";  // clear email
        inputPasswordElement.value = "";  // clear password
    }
}

// Load users when page is ready
document.addEventListener("DOMContentLoaded", () => {
    loadUsers();
});