document.querySelectorAll('.desct-mode').forEach(function(element) {
    element.addEventListener('animationend', function(event) {
        if (event.animationName === 'hideElement') {
            element.closest('.game-mode-element').querySelector('.chalenge').classList.add('show');
        }
    });

    element.closest('.game-mode-element').addEventListener('mouseleave', function() {
        this.querySelector('.chalenge').classList.remove('show');
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const carousel = document.querySelector('.card-container');
    const cards = Array.from(carousel.children);
    let currentIndex = 0;

    setInterval(() => {
        rotateCarousel();
    }, 3000);

    function rotateCarousel() {
        currentIndex = (currentIndex + 1) % cards.length;

        cards.forEach((card, index) => {
            const newIndex = (index - currentIndex + cards.length) % cards.length;
            card.style.transform = `rotateY(${newIndex * 72}deg) translateZ(400px)`;
            card.style.opacity = 1;

            if (newIndex === 0) {
                card.style.zIndex = 3;
                card.querySelector('.card__header').classList.remove('hidden');
                card.querySelector('.card__body').classList.remove('hidden');
                card.querySelector('.card__footer').classList.remove('hidden');
            } else {
                card.style.zIndex = newIndex === 1 || newIndex === 4 ? 2 : 1;
                card.querySelector('.card__header').classList.add('hidden');
                card.querySelector('.card__body').classList.add('hidden');
                card.querySelector('.card__footer').classList.add('hidden');
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const fadeElements = document.querySelectorAll('.fade-in');

    function checkVisibility() {
        fadeElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                element.classList.add('visible');
            }
        });
    }

    window.addEventListener('scroll', checkVisibility);
    window.addEventListener('resize', checkVisibility);
    checkVisibility();
});
