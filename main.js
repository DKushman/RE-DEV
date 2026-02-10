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
                start: isMobile ? "top 50%" : "top 50%",  // Früher auf Desktop
                end: isMobile ? "bottom 90%" : "bottom 100%",
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
        // Cache DOM queries
        const mainItemInners = () => mobileNav.querySelectorAll('.mobile-nav-main-item .mobile-nav-item-inner');
        const allSubItems = () => mobileNav.querySelectorAll('.mobile-nav-sub-item');
        const openSubItemInners = () => mobileNav.querySelectorAll('.mobile-nav-sub-item.is-open .mobile-nav-item-inner');
        const allSubSubItems = () => mobileNav.querySelectorAll('.mobile-nav-sub-sub-item');
        const openSubSubItemInners = () => mobileNav.querySelectorAll('.mobile-nav-sub-sub-item.is-open .mobile-nav-item-inner');
        const TRANSITION_DURATION = 550;
        
        // Helper Functions
        const closeMainLinks = () => {
            mainItemInners().forEach(item => item.classList.remove('is-open'));
        };
        
        const openMainLinks = () => {
            const inners = mainItemInners();
            
            // Ensure all inner elements start without is-open class
            inners.forEach(item => {
                item.classList.remove('is-open');
            });
            
            // Single forced reflow to ensure browser recognizes initial state (batched)
            void mobileNav.offsetHeight;
            
            // Add is-open class with proper timing to trigger animation
            // Single requestAnimationFrame is sufficient
            requestAnimationFrame(() => {
                inners.forEach((item, index) => {
                    item.classList.add('is-open');
                });
            });
        };
        
        const closeSubLinks = (callback) => {
            // Remove is-open from all sub-link inners (triggers reverse animation)
            // IMPORTANT: Keep items with is-open so they remain visible during animation
            openSubItemInners().forEach(inner => inner.classList.remove('is-open'));
            
            // Close back button inner (triggers reverse animation)
            const backInner = mobileNav.querySelector('.mobile-nav-back-item .mobile-nav-item-inner');
            if (backInner) backInner.classList.remove('is-open');
            
            // Always wait for animation to complete before hiding containers
            setTimeout(() => {
                // Hide all sub-groups after animation completes
                mobileNav.querySelectorAll('.mobile-nav-sub-group').forEach(group => {
                    group.classList.remove('is-open');
                });
                
                // Remove is-open from all items after animation completes
                allSubItems().forEach(item => item.classList.remove('is-open'));
                
                // Call callback if provided
                if (callback) callback();
            }, TRANSITION_DURATION);
        };
        
        const hideSubItems = () => {
            // Hide all sub-groups (containers)
            mobileNav.querySelectorAll('.mobile-nav-sub-group').forEach(group => {
                group.classList.remove('is-open');
            });
            // Also hide individual items
            allSubItems().forEach(item => {
                item.classList.remove('is-open');
                const inner = item.querySelector('.mobile-nav-item-inner');
                if (inner) inner.classList.remove('is-open');
            });
        };
        
        const openSubLinks = (groupName) => {
            // Hide all sub-groups first
            mobileNav.querySelectorAll('.mobile-nav-sub-group').forEach(group => {
                group.classList.remove('is-open');
            });
            
            // Show the correct group container
            const group = mobileNav.querySelector(`.mobile-nav-sub-group-${groupName}`);
            if (!group) return;
            
            group.classList.add('is-open');
            
            // Get all sub-items within this group
            const subItems = group.querySelectorAll('.mobile-nav-sub-item');
            
            // Batch DOM operations
            const itemsData = Array.from(subItems).map((item, index) => {
                item.classList.add('is-open');
                const inner = item.querySelector('.mobile-nav-item-inner');
                const link = inner?.querySelector('.mobile-nav-link');
                if (link) link.style.transitionDelay = `${0.05 + (index * 0.05)}s`;
                return { item, inner };
            });
            
            // Force reflow
            if (itemsData.length > 0) {
                void itemsData[0].item.offsetHeight;
            }
            
            // Animate items
            const backItem = mobileNav.querySelector('.mobile-nav-back-item');
            const backInner = backItem?.querySelector('.mobile-nav-item-inner');
            
            requestAnimationFrame(() => {
                itemsData.forEach(({ inner }) => {
                    if (inner) inner.classList.add('is-open');
                });
                if (backInner) backInner.classList.add('is-open');
            });
        };
        
        // Sub-Sub-Links functions (exact copy of sub-links pattern)
        const closeSubSubLinks = (callback) => {
            openSubSubItemInners().forEach(inner => inner.classList.remove('is-open'));
            const backInner = mobileNav.querySelector('.mobile-nav-back-sub-item .mobile-nav-item-inner');
            if (backInner) {
                backInner.classList.remove('is-open');
            }
            if (callback) {
                setTimeout(callback, TRANSITION_DURATION);
            }
        };
        
        const hideSubSubItems = () => {
            allSubSubItems().forEach(item => item.classList.remove('is-open'));
        };
        
        const openSubSubLinks = (subSubItemsSelector) => {
            const subSubItems = mobileNav.querySelectorAll(subSubItemsSelector);
            const itemsData = Array.from(subSubItems).map((item, index) => {
                item.classList.add('is-open');
                const inner = item.querySelector('.mobile-nav-item-inner');
                const link = inner.querySelector('.mobile-nav-link');
                link.style.transitionDelay = `${0.05 + (index * 0.05)}s`;
                return { item, inner };
            });
            
            if (itemsData.length > 0) {
                void itemsData[0].item.offsetHeight;
            }
            
            const backItem = mobileNav.querySelector('.mobile-nav-back-sub-item');
            const backInner = backItem?.querySelector('.mobile-nav-item-inner');
            
            requestAnimationFrame(() => {
                itemsData.forEach(({ inner }) => {
                    inner.classList.add('is-open');
                });
                if (backInner) {
                    backInner.classList.add('is-open');
                }
            });
        };
        
        const closeMenu = () => {
            burgerBtn.classList.remove('active');
            mobileNav.classList.remove('is-open', 'has-subs-open', 'has-sub-subs-open');
            mobileNav.setAttribute('aria-hidden', 'true');
            burgerBtn.setAttribute('aria-expanded', 'false');
            if (footer) footer.classList.remove('is-hidden');
            document.body.classList.remove('menu-open');
            if (lenis) lenis.start();
        };
        
        const openMenu = () => {
            burgerBtn.classList.add('active');
            mobileNav.classList.add('is-open');
            mobileNav.classList.remove('has-subs-open', 'has-sub-subs-open');
            mobileNav.setAttribute('aria-hidden', 'false');
            burgerBtn.setAttribute('aria-expanded', 'true');
            if (footer) footer.classList.add('is-hidden');
            document.body.classList.add('menu-open');
            if (lenis) lenis.stop();
        };
        burgerBtn.addEventListener('click', (e) => {
            const clickedClose = e.target.closest('.burger-btn-close');
            const isOpen = burgerBtn.classList.contains('active');
            
            if (clickedClose) {
                // X geklickt: Menü schließen
                closeSubSubLinks();
                closeSubLinks();
                closeMainLinks();
                setTimeout(() => {
                    hideSubSubItems();
                    hideSubItems();
                    closeMenu();
                }, TRANSITION_DURATION);
            } else {
                // ☰ geklickt: Menü öffnen
                // Ensure preload is removed (in case menu opens before DOMContentLoaded completes)
                document.body.classList.remove('preload');
                
                // Ensure inner elements don't have is-open before opening
                mainItemInners().forEach(item => {
                    item.classList.remove('is-open');
                });
                
                openMenu();
                
                // Force reflow to ensure browser recognizes initial state before animating
                void mobileNav.offsetHeight;
                
                // Small delay to ensure browser recognizes initial state
                requestAnimationFrame(() => {
                    openMainLinks();
                });
                hideSubItems();
                hideSubSubItems();
            }
        }, { passive: true });
        
        // Schließe Mobile Nav beim Klick auf einen echten Link (but not triggers)
        mobileNav.addEventListener('click', (e) => {
            const link = e.target.closest('a.mobile-nav-link');
            const isTrigger = e.target.closest('.mobile-nav-trigger, .mobile-nav-sub-trigger');
            if (link && !isTrigger) {
                hideSubSubItems();
                hideSubItems();
                closeMenu();
            }
        }, { passive: true });

        // Mobile Nav: Unterpunkte auf-/zuklappen (Leistungen + Fakten)
        mobileNav.querySelectorAll('.mobile-nav-trigger-leistungen, .mobile-nav-trigger-fakten').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                
                closeMainLinks();
                hideSubItems();
                hideSubSubItems();
                
                setTimeout(() => {
                    mobileNav.classList.add('has-subs-open');
                    const groupName = trigger.classList.contains('mobile-nav-trigger-leistungen') 
                        ? 'leistungen'
                        : 'fakten';
                    openSubLinks(groupName);
                }, TRANSITION_DURATION);
            });
        });
        
        // Mobile Nav: Sub-Sub-Links auf-/zuklappen
        mobileNav.querySelectorAll('.mobile-nav-sub-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const parentSubItem = trigger.closest('.mobile-nav-sub-item');
                const subSubGroup = parentSubItem?.dataset.subSubGroup;
                if (!subSubGroup) return;
                
                // Store which group we're coming from (for back button)
                const parentGroup = parentSubItem.closest('.mobile-nav-sub-group');
                const groupName = parentGroup?.classList.contains('mobile-nav-sub-group-leistungen') 
                    ? 'leistungen' 
                    : 'fakten';
                parentSubItem.dataset.parentGroup = groupName;
                
                closeSubLinks();
                hideSubSubItems();
                
                setTimeout(() => {
                    mobileNav.classList.add('has-sub-subs-open');
                    openSubSubLinks(`.mobile-nav-sub-sub-${subSubGroup}`);
                }, TRANSITION_DURATION);
            });
        });

        // Back Button: Zurück zum Hauptmenü
        const backBtn = mobileNav.querySelector('.mobile-nav-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                closeSubSubLinks();
                closeSubLinks(() => {
                    hideSubSubItems();
                    hideSubItems();
                    mobileNav.classList.remove('has-subs-open', 'has-sub-subs-open');
                    openMainLinks();
                });
            });
        }
        
        // Back Button: Zurück zu Sub-Links
        const backSubBtn = mobileNav.querySelector('.mobile-nav-back-sub-btn');
        if (backSubBtn) {
            backSubBtn.addEventListener('click', () => {
                closeSubSubLinks(() => {
                    hideSubSubItems();
                    mobileNav.classList.remove('has-sub-subs-open');
                    
                    // Hide all groups first
                    hideSubItems();
                    
                    // Find which group we came from
                    const triggerItem = mobileNav.querySelector('.mobile-nav-sub-item[data-sub-sub-group]');
                    const groupName = triggerItem?.dataset.parentGroup || 'leistungen';
                    
                    setTimeout(() => {
                        mobileNav.classList.add('has-subs-open');
                        openSubLinks(groupName);
                    }, TRANSITION_DURATION);
                });
            });
        }
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
    // Preload-Klasse entfernen synchron (verhindert Transitions beim Laden, aber erlaubt sie für Menü)
    document.body.classList.remove('preload');
    
    initPageTransition();
    
    // Zusammenfassung-Cards: Klick auf Card togglet Checkbox
    document.querySelectorAll('.fakten-zsmfassung-card').forEach(card => {
        const checkbox = card.querySelector('.fakten-zsmfassung-checkbox');
        if (!checkbox) return;
        card.addEventListener('click', (e) => {
            if (e.target === checkbox) return;
            checkbox.checked = !checkbox.checked;
            card.setAttribute('aria-pressed', checkbox.checked);
        });
        checkbox.addEventListener('change', () => {
            card.setAttribute('aria-pressed', checkbox.checked);
        });
    });
    
    // Leistungen + Fakten Dropdown (Desktop) – ein Delegat für alle
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.nav-dropdown-btn');
        if (btn) {
            // Ensure preload is removed for desktop dropdown animations
            document.body.classList.remove('preload');
            
            const id = btn.getAttribute('aria-controls');
            const panel = id ? document.getElementById(id) : null;
            if (!panel) return;
            const isOpen = panel.classList.contains('is-open');
            
            // Close all panels and remove is-open from inner containers
            document.querySelectorAll('.nav-dropdown-panel').forEach(p => {
                p.classList.remove('is-open');
                p.classList.remove('has-subs-open');
                p.setAttribute('aria-hidden', 'true');
                // Remove is-open from inner containers and sub-items
                p.querySelectorAll('.leistungen-dropdown-inner, .fakten-dropdown-inner').forEach(inner => {
                    inner.classList.remove('is-open');
                });
                p.querySelectorAll('.leistungen-dropdown-sub-item').forEach(item => {
                    item.classList.remove('is-open');
                });
                const backInner = p.querySelector('.leistungen-dropdown-back-item .leistungen-dropdown-inner');
                if (backInner) backInner.classList.remove('is-open');
            });
            document.querySelectorAll('.nav-dropdown-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
            document.querySelectorAll('.leistungen-dropdown-trigger').forEach(b => b.setAttribute('aria-expanded', 'false'));
            
            if (!isOpen) {
                // Reset sub-items if any were open
                panel.classList.remove('has-subs-open');
                panel.querySelectorAll('.leistungen-dropdown-sub-item').forEach(item => {
                    item.classList.remove('is-open');
                });
                
                // Ensure inner containers don't have is-open before opening
                panel.querySelectorAll('.leistungen-dropdown-inner, .fakten-dropdown-inner').forEach(inner => {
                    inner.classList.remove('is-open');
                });
                
                // Reset back button
                const backInner = panel.querySelector('.leistungen-dropdown-back-item .leistungen-dropdown-inner');
                if (backInner) backInner.classList.remove('is-open');
                
                // Reset trigger button
                panel.querySelectorAll('.leistungen-dropdown-trigger').forEach(b => b.setAttribute('aria-expanded', 'false'));
                
                panel.classList.add('is-open');
                panel.setAttribute('aria-hidden', 'false');
                btn.setAttribute('aria-expanded', 'true');
                
                // Force reflow to ensure browser recognizes initial state
                void panel.offsetHeight;
                
                // Animate links like mobile nav
                requestAnimationFrame(() => {
                    const inners = panel.querySelectorAll('.leistungen-dropdown-main-item .leistungen-dropdown-inner, .fakten-dropdown-inner');
                    inners.forEach(inner => {
                        inner.classList.add('is-open');
                    });
                });
                
                if (lenis) lenis.stop();
            } else if (lenis) lenis.start();
            return;
        }
        
        // Handle Notare&Kanzleien trigger button
        const triggerBtn = e.target.closest('.leistungen-dropdown-trigger');
        if (triggerBtn) {
            e.preventDefault();
            document.body.classList.remove('preload');
            
            const panel = triggerBtn.closest('.leistungen-dropdown');
            if (!panel) return;
            
            const TRANSITION_DURATION = 550;
            const mainItems = panel.querySelectorAll('.leistungen-dropdown-main-item');
            const subItems = panel.querySelectorAll('.leistungen-dropdown-sub-item');
            const backItem = panel.querySelector('.leistungen-dropdown-back-item');
            const backInner = backItem?.querySelector('.leistungen-dropdown-inner');
            
            // Close main links
            mainItems.forEach(item => {
                const inner = item.querySelector('.leistungen-dropdown-inner');
                if (inner) inner.classList.remove('is-open');
            });
            
            // Hide sub items and back button initially
            subItems.forEach(item => item.classList.remove('is-open'));
            if (backInner) backInner.classList.remove('is-open');
            
            // After transition duration, show sub items with animation
            setTimeout(() => {
                panel.classList.add('has-subs-open');
                
                // Add is-open to sub-items and set transition delays
                subItems.forEach((item, index) => {
                    item.classList.add('is-open');
                    const inner = item.querySelector('.leistungen-dropdown-inner');
                    const link = inner?.querySelector('.leistungen-dropdown-link');
                    if (link) {
                        link.style.transitionDelay = `${0.05 + (index * 0.05)}s`;
                    }
                });
                
                // Force reflow
                if (subItems.length > 0) {
                    void subItems[0].offsetHeight;
                }
                
                // Animate sub-links and back button
                requestAnimationFrame(() => {
                    subItems.forEach(item => {
                        const inner = item.querySelector('.leistungen-dropdown-inner');
                        if (inner) inner.classList.add('is-open');
                    });
                    
                    if (backInner) {
                        backInner.classList.add('is-open');
                    }
                });
            }, TRANSITION_DURATION);
            
            triggerBtn.setAttribute('aria-expanded', 'true');
            return;
        }
        
        // Handle back button click
        const backBtn = e.target.closest('.leistungen-dropdown-back-btn');
        if (backBtn) {
            e.preventDefault();
            document.body.classList.remove('preload');
            
            const panel = backBtn.closest('.leistungen-dropdown');
            if (!panel) return;
            
            const TRANSITION_DURATION = 550;
            const mainItems = panel.querySelectorAll('.leistungen-dropdown-main-item');
            const subItems = panel.querySelectorAll('.leistungen-dropdown-sub-item');
            const backItem = panel.querySelector('.leistungen-dropdown-back-item');
            const backInner = backItem?.querySelector('.leistungen-dropdown-inner');
            
            // Close sub-links and back button
            subItems.forEach(item => {
                const inner = item.querySelector('.leistungen-dropdown-inner');
                if (inner) inner.classList.remove('is-open');
            });
            if (backInner) backInner.classList.remove('is-open');
            
            // After transition duration, hide sub-items and show main items
            setTimeout(() => {
                subItems.forEach(item => item.classList.remove('is-open'));
                panel.classList.remove('has-subs-open');
                
                // Force reflow
                if (mainItems.length > 0) {
                    void mainItems[0].offsetHeight;
                }
                
                // Animate main links
                requestAnimationFrame(() => {
                    mainItems.forEach(item => {
                        const inner = item.querySelector('.leistungen-dropdown-inner');
                        if (inner) inner.classList.add('is-open');
                    });
                });
            }, TRANSITION_DURATION);
            
            // Reset trigger button
            const triggerBtn = panel.querySelector('.leistungen-dropdown-trigger');
            if (triggerBtn) triggerBtn.setAttribute('aria-expanded', 'false');
            return;
        }
        
        const link = e.target.closest('.leistungen-dropdown-link, .fakten-dropdown-link');
        const openPanel = document.querySelector('.nav-dropdown-panel.is-open');
        
        // Handle clicks on links (close immediately)
        if (link) {
            // Don't close if clicking the trigger button
            if (link.classList.contains('leistungen-dropdown-trigger')) {
                return;
            }
            
            document.querySelectorAll('.nav-dropdown-panel').forEach(p => {
                p.classList.remove('is-open');
                p.classList.remove('has-subs-open');
                p.setAttribute('aria-hidden', 'true');
                p.querySelectorAll('.leistungen-dropdown-sub-item').forEach(item => {
                    item.classList.remove('is-open');
                });
                const backInner = p.querySelector('.leistungen-dropdown-back-item .leistungen-dropdown-inner');
                if (backInner) backInner.classList.remove('is-open');
            });
            document.querySelectorAll('.nav-dropdown-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
            document.querySelectorAll('.leistungen-dropdown-trigger').forEach(b => b.setAttribute('aria-expanded', 'false'));
            if (lenis) lenis.start();
            return;
        }
        
        // Handle clicks on overlay/backdrop (clicking on panel but not on interactive content) - close with reverse animation
        if (openPanel && openPanel.contains(e.target)) {
            // Check if clicking on backdrop (panel itself or list container, but not on list items, links, or buttons)
            const clickedOnListItem = e.target.closest('li');
            const clickedOnButton = e.target.closest('button');
            const clickedOnLink = e.target.closest('a');
            const clickedOnBackdrop = !clickedOnListItem && !clickedOnButton && !clickedOnLink && 
                                      (e.target === openPanel || e.target.classList.contains('leistungen-dropdown-list') || e.target.classList.contains('fakten-dropdown-list'));
            
            if (clickedOnBackdrop) {
                const TRANSITION_DURATION = 550;
                const hasSubsOpen = openPanel.classList.contains('has-subs-open');
                
                if (hasSubsOpen) {
                    // Close sub-links with reverse animation (like mobile X button)
                    const subItems = openPanel.querySelectorAll('.leistungen-dropdown-sub-item');
                    const backInner = openPanel.querySelector('.leistungen-dropdown-back-item .leistungen-dropdown-inner');
                    
                    // Remove is-open from sub-link inners (triggers reverse animation)
                    subItems.forEach(item => {
                        const inner = item.querySelector('.leistungen-dropdown-inner');
                        if (inner) inner.classList.remove('is-open');
                    });
                    
                    // Close back button inner
                    if (backInner) backInner.classList.remove('is-open');
                    
                    // Wait for animation to complete, then close main links and hide panel
                    setTimeout(() => {
                        // Close main links
                        const mainItems = openPanel.querySelectorAll('.leistungen-dropdown-main-item');
                        mainItems.forEach(item => {
                            const inner = item.querySelector('.leistungen-dropdown-inner');
                            if (inner) inner.classList.remove('is-open');
                        });
                        
                        // Hide sub-items and close panel
                        subItems.forEach(item => item.classList.remove('is-open'));
                        openPanel.classList.remove('is-open');
                        openPanel.classList.remove('has-subs-open');
                        openPanel.setAttribute('aria-hidden', 'true');
                        
                        document.querySelectorAll('.nav-dropdown-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
                        document.querySelectorAll('.leistungen-dropdown-trigger').forEach(b => b.setAttribute('aria-expanded', 'false'));
                        if (lenis) lenis.start();
                    }, TRANSITION_DURATION);
                } else {
                    // No sub-items open, just close main links and panel with reverse animation
                    const mainItems = openPanel.querySelectorAll('.leistungen-dropdown-main-item');
                    mainItems.forEach(item => {
                        const inner = item.querySelector('.leistungen-dropdown-inner');
                        if (inner) inner.classList.remove('is-open');
                    });
                    
                    setTimeout(() => {
                        openPanel.classList.remove('is-open');
                        openPanel.setAttribute('aria-hidden', 'true');
                        
                        document.querySelectorAll('.nav-dropdown-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
                        document.querySelectorAll('.leistungen-dropdown-trigger').forEach(b => b.setAttribute('aria-expanded', 'false'));
                        if (lenis) lenis.start();
                    }, TRANSITION_DURATION);
                }
            }
            return;
        }
    });
    
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

// Page Transition
function initPageTransition() {
    const t = document.querySelector('.page-transition');
    if (!t) return;
    
    // Reveal: wenn von anderer Seite kommend
    if (sessionStorage.getItem('transition')) {
        sessionStorage.removeItem('transition');
        // Transitioning class already set by inline script in head
        t.classList.add('reveal');
        setTimeout(() => {
            t.classList.remove('reveal');
            document.documentElement.classList.remove('transitioning');
        }, 550);
    }
    
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (link.target === '_blank') return;
        if (link.hostname !== location.hostname) return;
        if (href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        if (href.startsWith('#')) return;
        
        e.preventDefault();
        sessionStorage.setItem('transition', '1');
        document.documentElement.classList.add('transitioning');
        t.classList.add('active');
        setTimeout(() => location.href = link.href, 550);
    });
}

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
    
    // Close on real link click (not the Leistungen button)
    mobileNav.querySelectorAll('a.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            burgerBtn.classList.remove('active');
            mobileNav.classList.remove('is-open');
            mobileNav.setAttribute('aria-hidden', 'true');
            burgerBtn.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
        }, { passive: true });
    });

    // Sub-menu toggle (Leistungen + Fakten)
    mobileNav.querySelectorAll('.mobile-nav-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const parentLi = trigger.closest('.mobile-nav-item-has-sub');
            if (!parentLi) return;
            const sublist = document.getElementById(trigger.getAttribute('aria-controls'));
            const isExpanded = parentLi.classList.toggle('is-expanded');
            trigger.setAttribute('aria-expanded', isExpanded);
            if (sublist) sublist.setAttribute('aria-hidden', !isExpanded);
        });
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
