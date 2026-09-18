(function() {
    if (window.hasGravityRun) return;
    window.hasGravityRun = true;

    const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img, button, a, span, input, label');
    const physicsBodies = [];
    
    // Global engine variables mutable via incoming browser port requests
    window.gravitySettings = {
        gravity: 0.6,
        bounce: 0.45
    };

    // Unbind elements from default layouts
    elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        el.style.position = 'fixed';
        el.style.left = rect.left + 'px';
        el.style.top = rect.top + 'px';
        el.style.width = rect.width + 'px';
        el.style.height = rect.height + 'px';
        el.style.margin = '0';
        el.style.zIndex = '99999';

        physicsBodies.push({
            element: el,
            y: rect.top,
            vy: 0,
            height: rect.height
        });
    });

    // Listen for real-time config updates sent from the popup sliders
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'UPDATE_PHYSICS') {
            window.gravitySettings.gravity = message.gravity;
            window.gravitySettings.bounce = message.bounce;
        }
    });

    function updatePhysics() {
        const floor = window.innerHeight;

        physicsBodies.forEach(body => {
            // Apply parameters from the global configuration object
            body.vy += window.gravitySettings.gravity;
            body.y += body.vy;

            if (body.y + body.height >= floor) {
                body.y = floor - body.height;
                body.vy = -body.vy * window.gravitySettings.bounce;
                
                if (Math.abs(body.vy) < 1) body.vy = 0;
            }

            body.element.style.top = body.y + 'px';
        });

        requestAnimationFrame(updatePhysics);
    }

    updatePhysics();
})();
