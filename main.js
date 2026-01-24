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
                start: "top 50%",
                end: "bottom 70%",
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
    const mainContent = document.querySelector('.main-content');
    const footer = document.querySelector('.footer');

    if (burgerBtn && mainContent && footer) {
        burgerBtn.addEventListener('click', () => {
            mainContent.classList.toggle('is-blurred');
            footer.classList.toggle('is-hidden');
            document.body.classList.toggle('menu-open');
        }, { passive: true });
    }
    
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

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    waitForLibraries(() => {
        initLenis();
        initAnimations();
    });
});
