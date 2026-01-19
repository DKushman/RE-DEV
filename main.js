document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.classList.contains('active')) return;
        
        const oldActive = document.querySelector('.tab-btn.active');
        const oldBall = oldActive?.querySelector('.tab-ball');
        const newBall = this.querySelector('.tab-ball');
        const tab = this.dataset.tab;
        
        // Alter Ball verschwindet
        if (oldBall) {
            gsap.to(oldBall, {
                scale: 0, y: -8, opacity: 0,
                duration: 0.2, ease: "power2.in"
            });
        }
        
        // Update states
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.remove('active');
        });
        document.querySelectorAll('.tab-pane').forEach(p => {
            p.classList.remove('active');
            p.hidden = true;
        });
        
        this.classList.add('active');
        const pane = document.querySelector(`.tab-pane[data-tab="${tab}"]`);
        pane.classList.add('active');
        pane.hidden = false;
        
        // Neuer Ball: erscheint + squash/stretch bounce
        gsap.fromTo(newBall, 
            { scale: 0, y: 0, opacity: 0 },
            { scale: 1.3, y: 0, opacity: 1, duration: 0.15, ease: "power2.out",
              onComplete: () => {
                gsap.to(newBall, {
                    scale: 0.8, y: -10, duration: 0.12, ease: "power2.out",
                    onComplete: () => {
                        gsap.to(newBall, {
                            scale: 1.15, y: 0, duration: 0.1, ease: "power2.in",
                            onComplete: () => {
                                gsap.to(newBall, { scale: 1, duration: 0.08, ease: "power1.out" });
                            }
                        });
                    }
                });
              }
            }
        );
        
        gsap.fromTo(pane, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
    });
});

