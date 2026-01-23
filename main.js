document.addEventListener('DOMContentLoaded', () => {
    // Warte bis GSAP geladen ist
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        // Fallback: Warte auf GSAP
        const checkGSAP = setInterval(() => {
            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                clearInterval(checkGSAP);
                initAnimations();
            }
        }, 50);
        return;
    }
    
    initAnimations();
});

function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Text Animation
    const textElement = document.querySelector(".text-p");
    if (textElement) {
        const words = textElement.textContent.split(" ");
        textElement.innerHTML = words.map(word => `<span style="color:rgb(235, 235, 235);">${word}</span>`).join(" ");

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
                            span.style.color = "#000000";
                        } else {
                            span.style.color = "rgb(235, 235, 235)";
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
        });
    }
}
