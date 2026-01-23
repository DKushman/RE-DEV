// Performance-optimierte Version
(function() {
    'use strict';
    
    // Debounce Utility für resize Events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle Utility für häufige Events
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // RAF-basierte Updates für smooth scrolling
    let ticking = false;
    function requestTick(callback) {
        if (!ticking) {
            requestAnimationFrame(() => {
                callback();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    // Warte auf DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForGSAP, { once: true });
    } else {
        waitForGSAP();
    }
    
    function waitForGSAP() {
        // GSAP bereits verfügbar?
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            initAnimations();
            return;
        }
        
        // Effizienteres Warten auf GSAP mit RAF statt setInterval
        let attempts = 0;
        const maxAttempts = 100; // 5 Sekunden max
        
        function checkGSAP() {
            attempts++;
            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                initAnimations();
            } else if (attempts < maxAttempts) {
                requestAnimationFrame(checkGSAP);
            }
        }
        requestAnimationFrame(checkGSAP);
    }
    
    function initAnimations() {
        gsap.registerPlugin(ScrollTrigger);
        
        // Mobile Detection
        const isMobile = window.innerWidth < 769;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Wenn reduzierte Bewegung bevorzugt wird, minimale Animationen
        if (prefersReducedMotion) {
            initMinimalAnimations();
            return;
        }
        
        // Text Animation - Optimiert mit CSS-Klassen statt inline styles
        initTextAnimation();
        
        // Timeline Animation - Optimiert
        initTimelineAnimation(isMobile);
        
        // Kundenkommen Animation
        initKundenkommenAnimation();
        
        // Header Animation
        initHeaderAnimation();
        
        // Burger Menu
        initBurgerMenu();
    }
    
    function initMinimalAnimations() {
        // Minimale Animationen für reduced-motion
        const textElement = document.querySelector(".text-p");
        if (textElement) {
            textElement.style.color = "#000000";
        }
        
        const timelineItems = document.querySelectorAll(".timeline-item");
        timelineItems.forEach(item => item.classList.add("active"));
        
        initBurgerMenu();
    }
    
    function initTextAnimation() {
        const textElement = document.querySelector(".text-p");
        if (!textElement) return;
        
        const words = textElement.textContent.split(" ");
        textElement.innerHTML = words.map(word => 
            `<span class="text-word">${word}</span>`
        ).join(" ");
        
        const wordSpans = textElement.querySelectorAll(".text-word");
        const totalWords = wordSpans.length;
        
        // Initialer Stil per CSS-Klasse
        wordSpans.forEach(span => span.classList.add('text-word-inactive'));
        
        // Cache für aktiven Index - verhindert unnötige DOM-Updates
        let lastActiveIndex = -1;
        
        ScrollTrigger.create({
            trigger: ".text",
            start: "top 50%",
            end: "bottom 70%",
            onUpdate: throttle((self) => {
                const progress = self.progress;
                const activeIndex = Math.floor(progress * totalWords);
                
                // Nur updaten wenn sich der Index geändert hat
                if (activeIndex !== lastActiveIndex) {
                    requestTick(() => {
                        wordSpans.forEach((span, index) => {
                            if (index <= activeIndex) {
                                span.classList.add('text-word-active');
                                span.classList.remove('text-word-inactive');
                            } else {
                                span.classList.remove('text-word-active');
                                span.classList.add('text-word-inactive');
                            }
                        });
                        lastActiveIndex = activeIndex;
                    });
                }
            }, 16) // ~60fps throttle
        });
    }
    
    function initTimelineAnimation(isMobile) {
        const timelineTrack = document.querySelector(".timeline-track");
        const timelineItems = document.querySelectorAll(".timeline-item");
        const totalItems = timelineItems.length;
        
        if (!timelineTrack || timelineItems.length === 0) return;
        
        // Set first item as active
        timelineItems[0].classList.add("active");
        
        // Berechne Track-Breite
        function calculateTrackWidth() {
            const isDesktop = window.innerWidth >= 769;
            const itemWidth = isDesktop 
                ? Math.max(window.innerWidth * 0.25, 300)
                : Math.max(window.innerWidth * 0.2, 250);
            return (totalItems - 1) * itemWidth;
        }
        
        let trackWidth = calculateTrackWidth();
        let lastActiveIndex = 0;
        
        // Debounced resize handler
        const handleResize = debounce(() => {
            trackWidth = calculateTrackWidth();
            ScrollTrigger.refresh();
        }, 250);
        
        window.addEventListener('resize', handleResize, { passive: true });
        
        gsap.to(timelineTrack, {
            x: () => -trackWidth, // Funktion für dynamische Berechnung
            ease: "none",
            scrollTrigger: {
                trigger: ".timeline-section",
                start: "top top",
                end: "bottom bottom",
                scrub: isMobile ? 0.5 : 1, // Schnelleres scrub auf Mobile
                invalidateOnRefresh: true,
                onUpdate: throttle((self) => {
                    const progress = self.progress;
                    const activeIndex = Math.min(
                        Math.floor(progress * totalItems + 0.1), 
                        totalItems - 1
                    );
                    
                    // Nur updaten wenn sich der Index geändert hat
                    if (activeIndex !== lastActiveIndex) {
                        requestTick(() => {
                            timelineItems.forEach((item, index) => {
                                if (index <= activeIndex) {
                                    item.classList.add("active");
                                } else {
                                    item.classList.remove("active");
                                }
                            });
                            lastActiveIndex = activeIndex;
                        });
                    }
                }, 32) // ~30fps für Timeline
            }
        });
    }
    
    function initKundenkommenAnimation() {
        const kundenkommenP = document.querySelector(".kundenkommen-p");
        const teamList = document.querySelector(".team-list");
        
        if (!kundenkommenP || !teamList) return;
        
        ScrollTrigger.create({
            trigger: teamList,
            start: "top -50%",
            end: "bottom 50%",
            onEnter: () => kundenkommenP.classList.add("swapped"),
            onLeave: () => kundenkommenP.classList.remove("swapped"),
            onEnterBack: () => kundenkommenP.classList.add("swapped"),
            onLeaveBack: () => kundenkommenP.classList.remove("swapped")
        });
    }
    
    function initHeaderAnimation() {
        const header = document.querySelector("header");
        const footerElement = document.querySelector(".footer");
        
        if (!header || !footerElement) return;
        
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
    
    function initBurgerMenu() {
        const burgerBtn = document.querySelector('.burger-btn');
        const mainContent = document.querySelector('.main-content');
        const footer = document.querySelector('.footer');
        
        if (!burgerBtn || !mainContent || !footer) return;
        
        burgerBtn.addEventListener('click', () => {
            mainContent.classList.toggle('is-blurred');
            footer.classList.toggle('is-hidden');
            document.body.classList.toggle('menu-open');
        }, { passive: true });
    }
})();
