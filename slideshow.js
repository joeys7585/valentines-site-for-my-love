// Slideshow Data (loaded from JSON)
let images = [];
let currentSlide = 0;

// DOM Elements
const slidesContainer = document.getElementById('slides');
const dotsContainer = document.getElementById('dots');
const captionEl = document.getElementById('caption');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Load Images from JSON
async function loadImages() {
    try {
        const response = await fetch('images.json');
        images = await response.json();

        if (images.length === 0) {
            showNoImagesMessage();
            return;
        }

        createSlides();
        createDots();
        showSlide(0);
        startAutoPlay();
    } catch (error) {
        console.error('Error loading images:', error);
        showNoImagesMessage();
    }
}

// Show message when no images
function showNoImagesMessage() {
    slidesContainer.innerHTML = `
        <div class="no-images">
            <h3>💝 Add Your Photos!</h3>
            <p>
                To add your couple photos, create an <code>images.json</code> file with your images.<br><br>
                Place your photos in an <code>images</code> folder and update the JSON file!
            </p>
        </div>
    `;
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
}

// Create slide elements
function createSlides() {
    slidesContainer.innerHTML = images.map((img, index) => `
        <div class="slide">
            <img src="${img.src}" alt="${img.caption || 'Our memory ' + (index + 1)}" 
                 onerror="this.src='https://via.placeholder.com/700x450/ffd1dc/c2185b?text=Our+Memory+${index + 1}'">
        </div>
    `).join('');
}

// Create dot indicators
function createDots() {
    dotsContainer.innerHTML = images.map((_, index) => `
        <span class="dot" data-index="${index}"></span>
    `).join('');

    // Add click handlers to dots
    document.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', () => {
            showSlide(parseInt(dot.dataset.index));
        });
    });
}

// Show specific slide
function showSlide(index) {
    // Handle wrapping
    if (index >= images.length) index = 0;
    if (index < 0) index = images.length - 1;

    currentSlide = index;

    // Move slides
    slidesContainer.style.transform = `translateX(-${index * 100}%)`;

    // Update dots
    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

    // Update caption
    captionEl.textContent = images[index].caption || '';
    captionEl.style.animation = 'none';
    captionEl.offsetHeight; // Trigger reflow
    captionEl.style.animation = 'fadeIn 0.5s ease';
}

// Navigation
function nextSlide() {
    showSlide(currentSlide + 1);
}

function prevSlide() {
    showSlide(currentSlide - 1);
}

// Auto-play
let autoPlayInterval;

function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 4000);
}

function stopAutoPlay() {
    clearInterval(autoPlayInterval);
}

// Resume auto-play after user interaction
function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
}

// Event Listeners
prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoPlay();
});

nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoPlay();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        prevSlide();
        resetAutoPlay();
    } else if (e.key === 'ArrowRight') {
        nextSlide();
        resetAutoPlay();
    }
});

// Touch/swipe support
let touchStartX = 0;
let touchEndX = 0;

slidesContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

slidesContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
        if (diff > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
        resetAutoPlay();
    }
}

// Start loading images
loadImages();
