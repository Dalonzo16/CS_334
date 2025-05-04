// Array of image file paths for the slideshow
let images = [
    "assets/images/tea_background3.png",
    "assets/images/tea_background1.png",
    "assets/images/tea_background4.png"
];

let index = 0;

// Getting the image to change the source dynamically
const image = document.getElementById("info-image");

// Function to change the background image every 10 seconds
function nextImage() {
    // Set the image source to the current image in the array
    image.src = images[index];
    index++;

    // If the index is equal to or greater than the length of the images array,
    // reset it to 0
    if(index >= images.length) {
        index = 0;
    }

    // Setting a timeout to call the nextImage function again after 10 seconds
    setTimeout(nextImage, 6000);
}

// Starting the slideshow when the page loads
window.onload = nextImage();

// Management Pages
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.management-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionId).classList.add('active');
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./scripts/service-worker.js')
      .then(() => console.log('Service Worker Registered'))
      .catch(err => console.error('Service Worker registration failed:', err));
  }
  