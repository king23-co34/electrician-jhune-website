// Updated mobile menu toggle functionality to use 'open' class instead of 'hidden'

function toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');

    mobileMenu.classList.toggle('open'); // Change line 25
    // Other code...

    if (mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('hidden'); // Change line 32
    } else {
        mobileMenu.classList.add('hidden');
    }
}