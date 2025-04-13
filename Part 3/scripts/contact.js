// Wait for teh DOM to fully load before running the script
document.addEventListener("DOMContentLoaded", () => {
    // Get references to the contact form and the success message container
    const form = document.getElementById("contact-form");
    const successMessage = document.getElementById("contact-success");

    // Add a listener to handle form submission
    form.addEventListener("submit", function (e) {
        // Prevent the default form submission
        e.preventDefault();

        // Get the values entered by the user and remove any extra whitespace
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        // Check if any field is empty; if so, alert the user and stop submission
        if (!name || !email || !message) {
            alert("Please fill out all fields.");
            return;
        }

        // If all fields are filled, simulate a successgul form submission
        successMessage.style.display = "block";
        form.reset(); // Clear the form fields
    });
});