// Main Application
// Handles navigation, sticky CTA, and general interactions

class MainApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupStickyElements();
        this.setupNavigation();
        this.setupContactButtons();
        this.trackPageMetrics();
    }

    setupMobileMenu() {
        const menuBtn = document.getElementById('menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        if (!menuBtn || !mobileMenu) return;

        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('hidden');
        });

        // Close menu when clicking a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('active');
                mobileMenu.classList.add('hidden');
            });
        });
    }

    setupStickyElements() {
        const stickyCtaBar = document.getElementById('sticky-cta');
        const quoteSection = document.getElementById('quote');

        if (!stickyCtaBar || !quoteSection) return;

        window.addEventListener('scroll', () => {
            const quoteRect = quoteSection.getBoundingClientRect();
            
            // Show sticky CTA when quote section is not visible
            if (quoteRect.top > window.innerHeight) {
                stickyCtaBar.classList.remove('hidden');
            } else {
                stickyCtaBar.classList.add('hidden');
            }
        }, { passive: true });
    }

    setupNavigation() {
        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Update active nav item based on scroll
        this.updateActiveNavItem();
        window.addEventListener('scroll', () => {
            this.updateActiveNavItem();
        }, { passive: true });
    }

    updateActiveNavItem() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('nav a[href^="#"]');

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('text-orange-500', 'font-bold');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('text-orange-500', 'font-bold');
            }
        });
    }

    setupContactButtons() {
        // Ensure contact buttons work
        const phoneBtn = document.querySelector('a[href="tel:+16478967610"]');
        const whatsappBtn = document.querySelector('a[href*="wa.me"]');
        const emailBtn = document.querySelector('a[href^="mailto:"]');

        if (phoneBtn) {
            phoneBtn.addEventListener('click', () => {
                console.log('Call button clicked');
            });
        }

        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', () => {
                console.log('WhatsApp button clicked');
            });
        }

        if (emailBtn) {
            emailBtn.addEventListener('click', () => {
                console.log('Email button clicked');
            });
        }
    }

    trackPageMetrics() {
        // Track page performance
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', () => {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                console.log('Page load time:', pageLoadTime + 'ms');
            });
        }

        // Track section views
        const observerOptions = {
            threshold: 0.5
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    console.log('Viewed section:', sectionId);
                    
                    // Track in analytics (if integrated)
                    if (window.gtag) {
                        gtag('event', 'page_section_view', {
                            section: sectionId
                        });
                    }
                }
            });
        }, observerOptions);

        document.querySelectorAll('section[id]').forEach(section => {
            sectionObserver.observe(section);
        });
    }

    // Utility: Get form submissions
    getSubmissions() {
        return JSON.parse(localStorage.getItem('quote_submissions') || '[]');
    }

    // Utility: Clear submissions
    clearSubmissions() {
        localStorage.removeItem('quote_submissions');
        console.log('Submissions cleared');
    }

    // Utility: Export submissions as CSV
    exportSubmissions() {
        const submissions = this.getSubmissions();
        if (submissions.length === 0) {
            console.log('No submissions to export');
            return;
        }

        const headers = ['Name', 'Phone', 'Email', 'Service', 'Description', 'Timestamp'];
        const rows = submissions.map(s => [
            s.name,
            s.phone,
            s.email,
            s.service,
            s.description,
            s.timestamp
        ]);

        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'form_submissions.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

// Initialize app
const app = new MainApp();

// Make app globally accessible for debugging
window.ElectricianApp = {
    app,
    formManager,
    animations,
    toast,
    getSubmissions: () => app.getSubmissions(),
    clearSubmissions: () => app.clearSubmissions(),
    exportSubmissions: () => app.exportSubmissions()
};

console.log('Electrician Jhune Website Ready!');
console.log('Commands: window.ElectricianApp.getSubmissions(), .clearSubmissions(), .exportSubmissions()');