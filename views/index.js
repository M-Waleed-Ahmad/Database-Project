// Event Listener for sliding action in 1st section
var slides = document.querySelectorAll('.slide');
var currentSlide = 0;
var slideInterval = setInterval(nextSlide, 4000); 
function showSlide(index) {
    slides[currentSlide].classList.remove('active'); 
    slides[index].classList.add('active'); 
    currentSlide = index; 
}

function nextSlide() {
    var nextIndex = (currentSlide + 1) % slides.length; 
    showSlide(nextIndex); 
}

// Event Listener for toggling search button
document.getElementById('icon').addEventListener('click', function() {
    var searchBox = document.getElementById('box');
    if (searchBox.classList.contains('show')) {
        searchBox.classList.remove('show'); 
        document.getElementById('box').disabled = true;
    } else {
        searchBox.classList.add('show');
        document.getElementById('box').disabled = false; 

    }
 

});

// Event listener for listing services 

const slider = document.querySelector('.slider');
const prevBtn = document.getElementById('next');
const nextBtn = document.getElementById('prev');

prevBtn.addEventListener('click', () => {
    slide('left');
});

nextBtn.addEventListener('click', () => {
    slide('right');
});

function slide(direction) {
    const slideWidth = slider.getBoundingClientRect().width;
    const offset = direction === 'left' ? slideWidth : -slideWidth;

    slider.style.transition = 'none';
    slider.style.transform = `translateX(${offset}px)`;

    if (direction === 'left') {
        slider.prepend(slider.lastElementChild);
    } else {
        slider.appendChild(slider.firstElementChild);
    }

    void slider.offsetWidth;

    slider.style.transition = 'transform 1.5s ease-in-out';
    slider.style.transform = 'translateX(0)';
}
// Event Listener for adding more medical fields