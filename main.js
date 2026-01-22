gsap.registerPlugin(ScrollTrigger);

// Text Animation
const textElement = document.querySelector(".text-p");
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

// Timeline Horizontal Scroll Animation
const timelineTrack = document.querySelector(".timeline-track");
const timelineItems = document.querySelectorAll(".timeline-item");
const totalItems = timelineItems.length;

// Set first item as active
timelineItems[0].classList.add("active");

// Function to calculate track width based on screen size
function calculateTrackWidth() {
    const isDesktop = window.innerWidth >= 769;
    const itemWidth = isDesktop 
        ? Math.max(window.innerWidth * 0.25, 300)
        : Math.max(window.innerWidth * 0.2, 250);
    return (totalItems - 1) * itemWidth;
}

// Initial calculation
let trackWidth = calculateTrackWidth();

// Update on resize
window.addEventListener('resize', () => {
    trackWidth = calculateTrackWidth();
    ScrollTrigger.refresh();
});

gsap.to(timelineTrack, {
    x: -trackWidth,
    ease: "none",
    scrollTrigger: {
        trigger: ".timeline-section",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
            const progress = self.progress;
            // Ensure last item is active only at the very end
            const activeIndex = Math.min(Math.floor(progress * totalItems + 0.1), totalItems - 1);
            
            timelineItems.forEach((item, index) => {
                if (index <= activeIndex) {
                    item.classList.add("active");
                } else {
                    item.classList.remove("active");
                }
            });
        }
    }
});

// Kundenkommen Text Color Swap Animation
const kundenkommenP = document.querySelector(".kundenkommen-p");
const teamList = document.querySelector(".team-list");

if (kundenkommenP && teamList) {
    ScrollTrigger.create({
        trigger: teamList,
        start: "top 100",
        end: "bottom 20%",
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