// Globale Lenis-Instanz
let lenis = null;

// Performance: Warte auf alle Libraries
function waitForLibraries(callback) {
    if (typeof gsap !== 'undefined' && 
        typeof ScrollTrigger !== 'undefined' && 
        typeof Lenis !== 'undefined') {
        callback();
        return;
    }
    
    let attempts = 0;
    const maxAttempts = 200;
    
    function check() {
        attempts++;
        if (typeof gsap !== 'undefined' && 
            typeof ScrollTrigger !== 'undefined' && 
            typeof Lenis !== 'undefined') {
            callback();
        } else if (attempts < maxAttempts) {
            requestAnimationFrame(check);
        }
    }
    requestAnimationFrame(check);
}

// Lenis Smooth Scrolling - Maximale Performance
function initLenis() {
    // Prüfe ob Smooth Scrolling gewünscht ist
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 769;
    
    // Lenis nur auf Desktop und wenn keine reduced-motion Präferenz
    if (prefersReducedMotion || isMobile) {
        return;
    }
    
    // GSAP Plugin registrieren BEVOR Lenis initialisiert wird
    gsap.registerPlugin(ScrollTrigger);
    
    // Lenis initialisieren mit optimalen Performance-Einstellungen
    lenis = new Lenis({
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });
    
    // Performance: ScrollTrigger mit Lenis synchronisieren
    lenis.on('scroll', (e) => {
        ScrollTrigger.update();
    });
    
    // Performance: GSAP Ticker für optimale Synchronisation
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    
    // Performance: Deaktiviere Lag Smoothing
    gsap.ticker.lagSmoothing(0);
    
    // ScrollTrigger nach Lenis initialisieren
    ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value) {
            if (arguments.length) {
                lenis.scrollTo(value, { immediate: true });
            }
            return lenis.scroll;
        },
        getBoundingClientRect() {
            return {
                top: 0,
                left: 0,
                width: window.innerWidth,
                height: window.innerHeight
            };
        },
        pinType: document.body.style.transform ? "transform" : "fixed"
    });
    
    // Cleanup
    window.addEventListener('beforeunload', () => {
        if (lenis) {
            lenis.destroy();
        }
    });
}

function initAnimations() {
    // ScrollTrigger bereits in initLenis registriert, aber sicherheitshalber nochmal
    if (!ScrollTrigger.isInitted) {
        gsap.registerPlugin(ScrollTrigger);
    }

    // Text Animation
    const textElement = document.querySelector(".text-p");
    if (textElement) {
        // Mobile Detection
        const isMobile = window.innerWidth < 769;
        
        const rootStyles = getComputedStyle(document.documentElement);
        const colorBlack = rootStyles.getPropertyValue('--color-black').trim();
        const colorTextInactive = rootStyles.getPropertyValue('--color-text-inactive').trim();
        
        const words = textElement.textContent.split(" ");
        textElement.innerHTML = words.map(word => `<span style="color:${colorTextInactive};">${word}</span>`).join(" ");

        const wordSpans = document.querySelectorAll(".text-p span");
        const totalWords = wordSpans.length;

        gsap.to({ progress: 0 }, {
            progress: 1,
            ease: "none",
            scrollTrigger: {
                trigger: ".text",
                start: isMobile ? "top 90%" : "top 90%",  // Früher auf Desktop
                end: isMobile ? "bottom 90%" : "bottom 120%",
                scrub: 1,
                onUpdate: (self) => {
                    wordSpans.forEach((span, index) => {
                        const slowFactor = 1;
                        const wordProgress = (self.progress * totalWords * slowFactor - index);
                        if (wordProgress >= 0) {
                            span.style.color = colorBlack;
                        } else {
                            span.style.color = colorTextInactive;
                        }
                    });
                }
            }
        });
    }

    // Kundenkommen Text Color Swap Animation
    const kundenkommenP = document.querySelector(".kundenkommen-p");
    const teamList = document.querySelector(".team-list");

    if (kundenkommenP && teamList) {
        ScrollTrigger.create({
            trigger: teamList,
            start: "top -50%",
            end: "bottom 50%",
            onEnter: () => {
                kundenkommenP.classList.add("swapped");
            },
            onLeave: () => {
                kundenkommenP.classList.remove("swapped");
            },
            onEnterBack: () => {
                kundenkommenP.classList.add("swapped");
            },
            onLeaveBack: () => {
                kundenkommenP.classList.remove("swapped");
            }
        });
    }

    // Header nach oben scrollen wenn Footer aufgedeckt wird
    const header = document.querySelector("header");
    const footerElement = document.querySelector(".footer");
    if (header && footerElement) {
        gsap.to(header, {
            y: -200,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".footer",
                start: "top bottom",
                end: "bottom bottom",
                scrub: 1
            }
        });
    }
    // Burger Menu Toggle
    const burgerBtn = document.querySelector('.burger-btn');
    const footer = document.querySelector('.footer');
    const mobileNav = document.querySelector('.mobile-nav');

    if (burgerBtn && mobileNav) {
        burgerBtn.addEventListener('click', () => {
            const isOpen = burgerBtn.classList.contains('active');
            
            burgerBtn.classList.toggle('active');
            mobileNav.classList.toggle('is-open');
            mobileNav.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
            burgerBtn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
            
            if (footer) footer.classList.toggle('is-hidden');
            document.body.classList.toggle('menu-open');
            
            if (lenis) {
                if (!isOpen) {
                    lenis.stop();
                } else {
                    lenis.start();
                }
            }
        }, { passive: true });
        
        // Schließe Mobile Nav beim Klick auf einen Link
        const mobileNavLinks = mobileNav.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                burgerBtn.classList.remove('active');
                mobileNav.classList.remove('is-open');
                mobileNav.setAttribute('aria-hidden', 'true');
                burgerBtn.setAttribute('aria-expanded', 'false');
                
                if (footer) footer.classList.remove('is-hidden');
                document.body.classList.remove('menu-open');
                
                if (lenis) {
                    lenis.start();
                }
            }, { passive: true });
        });
    }
    
    // FAQ Accordion: Schließe andere Items wenn eines geöffnet wird
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.open) {
                        otherItem.open = false;
                    }
                });
            }
        });
    });
    
    // Gründe Section Animation
    initGruendeAnimation();
    
    // ScrollTrigger Refresh nach allen Animationen
    ScrollTrigger.refresh();
    
    // Smooth Scroll für alle Anchor-Links mit Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#top') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                if (lenis) {
                    // Smooth Scroll mit Lenis (performant)
                    lenis.scrollTo(target, {
                        offset: 0,
                        duration: 1.2,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                    });
                } else {
                    // Fallback: normales Smooth Scrolling
                    target.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }
            }
        }, { passive: false });
    });
}

// Gründe Section Scroll Animation
function initGruendeAnimation() {
    const descItems = document.querySelectorAll('.gruende-desc-item');
    const titles = document.querySelectorAll('.gruende-item-title');
    const descs = document.querySelectorAll('.gruende-item-desc');
    
    if (!descItems.length || !titles.length) return;
    
    // Mobile Detection - no animation on mobile
    const isMobile = window.innerWidth < 769;
    if (isMobile) return;
    
    // Helper to deactivate all
    function deactivateAll() {
        titles.forEach(t => t.classList.remove('is-active'));
        descs.forEach(d => d.classList.remove('is-active'));
    }
    
    descItems.forEach((descItem) => {
        const index = descItem.dataset.index;
        const desc = descItem.querySelector('.gruende-item-desc');
        const title = document.querySelector(`.gruende-item-title[data-index="${index}"]`);
        
        if (!title || !desc) return;
        
        // ScrollTrigger for each description
        ScrollTrigger.create({
            trigger: descItem,
            start: 'top 50%',
            end: 'bottom 50%',
            onEnter: () => {
                deactivateAll();
                title.classList.add('is-active');
                desc.classList.add('is-active');
            },
            onLeave: () => {
                title.classList.remove('is-active');
                desc.classList.remove('is-active');
            },
            onEnterBack: () => {
                deactivateAll();
                title.classList.add('is-active');
                desc.classList.add('is-active');
            },
            onLeaveBack: () => {
                title.classList.remove('is-active');
                desc.classList.remove('is-active');
            }
        });
    });
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    // Fragebogen-Seite braucht keine externen Libraries
    if (document.body.classList.contains('fragebogen-page')) {
        initFragebogen();
        initFragebogenMobileNav();
        return;
    }
    
    // Andere Seiten warten auf Libraries
    waitForLibraries(() => {
        initLenis();
        initAnimations();
    });
});

// Simplified mobile nav for fragebogen (no GSAP needed)
function initFragebogenMobileNav() {
    const burgerBtn = document.querySelector('.burger-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (!burgerBtn || !mobileNav) return;
    
    burgerBtn.addEventListener('click', () => {
        const isOpen = burgerBtn.classList.contains('active');
        burgerBtn.classList.toggle('active');
        mobileNav.classList.toggle('is-open');
        mobileNav.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
        burgerBtn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        document.body.classList.toggle('menu-open');
    }, { passive: true });
    
    // Close on link click
    mobileNav.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            burgerBtn.classList.remove('active');
            mobileNav.classList.remove('is-open');
            mobileNav.setAttribute('aria-hidden', 'true');
            burgerBtn.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
        }, { passive: true });
    });
}

// ========================================
// Fragebogen Functionality
// ========================================

function initFragebogen() {
    const totalSteps = 5;
    let currentStep = 1;
    
    // DOM Elements
    const questionContainers = document.querySelectorAll('.question-container[data-step]');
    const successContainer = document.querySelector('.question-container[data-step="success"]');
    const backBtn = document.querySelector('.nav-btn--back');
    const nextBtn = document.querySelector('.nav-btn--next');
    const submitBtn = document.querySelector('.nav-btn--submit');
    const progressFill = document.querySelector('.progress-fill');
    const progressSteps = document.querySelectorAll('.progress-step');
    
    // Form data storage
    const formData = {};
    
    // Initialize
    updateUI();
    setupOptionListeners();
    setupNavigation();
    
    // Setup option card listeners using event delegation for better performance
    function setupOptionListeners() {
        // Event delegation for all question options
        const fragebogenWrapper = document.querySelector('.fragebogen-wrapper');
        if (fragebogenWrapper) {
            fragebogenWrapper.addEventListener('change', (e) => {
                const input = e.target;
                if (input.type === 'radio') {
                    formData[input.name] = input.value;
                    updateNextButtonState();
                } else if (input.type === 'checkbox') {
                    const container = input.closest('.question-container');
                    if (container) {
                        const checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
                        formData[input.name] = Array.from(checkedBoxes).map(cb => cb.value);
                        updateNextButtonState();
                    }
                }
            }, { passive: true });
            
            // Contact form inputs with debounce for better performance
            fragebogenWrapper.addEventListener('input', (e) => {
                const input = e.target;
                if (input.closest('.contact-form')) {
                    formData[input.name] = input.value;
                    updateNextButtonState();
                }
            }, { passive: true });
        }
    }
    
    // Setup navigation buttons
    function setupNavigation() {
        backBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                goToStep(currentStep - 1);
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentStep < totalSteps && isStepValid(currentStep)) {
                goToStep(currentStep + 1);
            }
        });
        
        submitBtn.addEventListener('click', () => {
            if (isStepValid(currentStep)) {
                submitForm();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const activeElement = document.activeElement;
                if (activeElement.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    if (currentStep === totalSteps) {
                        if (isStepValid(currentStep)) submitForm();
                    } else if (isStepValid(currentStep)) {
                        goToStep(currentStep + 1);
                    }
                }
            }
        });
        
        // Progress step clicks
        progressSteps.forEach(step => {
            step.addEventListener('click', () => {
                const targetStep = parseInt(step.dataset.step);
                if (targetStep < currentStep || canGoToStep(targetStep)) {
                    goToStep(targetStep);
                }
            });
            step.style.cursor = 'pointer';
        });
    }
    
    // Check if all previous steps are valid to allow jumping
    function canGoToStep(targetStep) {
        for (let i = 1; i < targetStep; i++) {
            if (!isStepValid(i)) return false;
        }
        return true;
    }
    
    // Check if current step has valid input
    function isStepValid(step) {
        const container = document.querySelector(`.question-container[data-step="${step}"]`);
        if (!container) return false;
        
        const radioInputs = container.querySelectorAll('input[type="radio"]');
        const checkboxInputs = container.querySelectorAll('input[type="checkbox"]');
        const requiredInputs = container.querySelectorAll('input[required], textarea[required]');
        
        // Check radio buttons
        if (radioInputs.length > 0) {
            const isRadioChecked = Array.from(radioInputs).some(input => input.checked);
            if (!isRadioChecked) return false;
        }
        
        // Check checkboxes (step 4 - at least one should be checked, or skip is allowed)
        if (step === 4 && checkboxInputs.length > 0) {
            // Features are optional, so always valid
            return true;
        }
        
        // Check required form fields
        if (requiredInputs.length > 0) {
            return Array.from(requiredInputs).every(input => {
                if (input.type === 'email') {
                    return input.value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
                }
                return input.value.trim() !== '';
            });
        }
        
        return true;
    }
    
    // Navigate to step
    function goToStep(step) {
        if (step < 1 || step > totalSteps) return;
        
        // Hide current
        const currentContainer = document.querySelector(`.question-container[data-step="${currentStep}"]`);
        if (currentContainer) {
            currentContainer.hidden = true;
        }
        
        // Show new
        currentStep = step;
        const newContainer = document.querySelector(`.question-container[data-step="${currentStep}"]`);
        if (newContainer) {
            newContainer.hidden = false;
            // Focus first input in new container
            const firstInput = newContainer.querySelector('input, textarea');
            if (firstInput && firstInput.type !== 'radio' && firstInput.type !== 'checkbox') {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
        
        updateUI();
    }
    
    // Update all UI elements
    function updateUI() {
        updateProgressBar();
        updateProgressSteps();
        updateNavigationButtons();
        updateNextButtonState();
    }
    
    // Update progress bar fill
    function updateProgressBar() {
        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }
    
    // Update progress step indicators
    function updateProgressSteps() {
        progressSteps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            
            if (stepNum === currentStep) {
                step.classList.add('active');
            } else if (stepNum < currentStep) {
                step.classList.add('completed');
            }
        });
    }
    
    // Update navigation buttons visibility
    function updateNavigationButtons() {
        // Back button
        if (backBtn) {
            backBtn.disabled = currentStep === 1;
        }
        
        // Next/Submit button toggle
        if (nextBtn && submitBtn) {
            if (currentStep === totalSteps) {
                nextBtn.hidden = true;
                submitBtn.hidden = false;
            } else {
                nextBtn.hidden = false;
                submitBtn.hidden = true;
            }
        }
    }
    
    // Update next button enabled state
    function updateNextButtonState() {
        const isValid = isStepValid(currentStep);
        
        if (nextBtn) {
            nextBtn.disabled = !isValid;
        }
        if (submitBtn) {
            submitBtn.disabled = !isValid;
        }
    }
    
    // Submit form
    function submitForm() {
        console.log('Form submitted:', formData);
        
        // Hide all question containers
        questionContainers.forEach(container => {
            container.hidden = true;
        });
        
        // Hide navigation
        if (backBtn) backBtn.hidden = true;
        if (nextBtn) nextBtn.hidden = true;
        if (submitBtn) submitBtn.hidden = true;
        
        // Show success
        if (successContainer) {
            successContainer.hidden = false;
        }
        
        // Update progress to complete
        if (progressFill) {
            progressFill.style.width = '100%';
        }
        progressSteps.forEach(step => {
            step.classList.remove('active');
            step.classList.add('completed');
        });
        
        // Hide progress bar and navigation after delay
        setTimeout(() => {
            const progressBar = document.querySelector('.fragebogen-progress');
            const navBar = document.querySelector('.fragebogen-nav');
            if (progressBar) {
                progressBar.style.opacity = '0';
                progressBar.style.transform = 'translateY(100%)';
                progressBar.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            }
            if (navBar) {
                navBar.style.opacity = '0';
                navBar.style.transition = 'opacity 0.4s ease';
            }
        }, 500);
        
        // Here you would typically send the data to a server
        // Example:
        // fetch('/api/submit-questionnaire', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(formData)
        // });
    }
}
