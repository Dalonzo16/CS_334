// Login

if(!localStorage.getItem("managerUsername")) {
    localStorage.setItem("managerUsername", "admin");
    localStorage.setItem("managerPassword", "password");
}

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector(".login-box form");
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const storedUsername = localStorage.getItem("managerUsername");
        const storedPassword = localStorage.getItem("managerPassword");

        if (username === storedUsername && password === storedPassword) {
            window.location.href = "management.html"; // Redirect on success
        } else {
            alert("Invalud username or password. Please try again.");
        }
    });
});