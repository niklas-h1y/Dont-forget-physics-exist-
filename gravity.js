(function() {
    if (window.hasGravityRun) return;
    window.hasGravityRun = true;

    // Global settings controlled by your popup UI panel
    window.gravitySettings = {
        gravity: 0.6,
        bounce: 0.45
    };

    const physicsBodies = [];

    // 1. Target container elements that hold actual strings of text
    const textContainers = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, label, button');
    
    textContainers.forEach(container => {
        // Skip empty or invisible text wrappers
        if (!container.innerText.trim()) return;

        // Break text string into separate letters, wrapping each character in a clean inline span
        const originalText = container.innerText;
        container.innerHTML = originalText.split('').map(char => {
            if (char === ' ') return '<span>&nbsp;</span>'; // Preserve structural blank spaces
            return `<span>${char}</span>`;
        }).join('');
    });

    // 2. Gather ALL visual pieces now (including our newly generated individual letter spans and images)
    const allElements = document.querySelectorAll('p > span, h1 > span, h2 > span, h3 > span, h4 > span, h5 > span, h6 > span, a > span, label > span, button > span, img, input');

    // 3. Freeze elements in their precise screen spots and apply absolute coordinates
    allElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        el.style.position = 'fixed';
        el.style.left = rect.left + 'px';
        el.style.top = rect.top + 'px';
        el.style.width = rect.width + 'px';
        el.style.height = rect.height + 'px';
        el.style.margin = '0';
        el.style.display = 'inline-block'; // Allow inline spans to respect top/left coordinates
        el.style.zIndex = '99999';

        physicsBodies.push({
            element: el,
            y: rect.top,
            vy: 0,
            height: rect.height
        });
    });

    // 4. Slider communication listener
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'UPDATE_PHYSICS') {
            window.gravitySettings.gravity = message.gravity;
            window.gravitySettings.bounce = message.bounce;
        }
    });

    // 5. Physics Engine Pipeline Loop
    function updatePhysics() {
        const floor = window.innerHeight;

        physicsBodies.forEach(body => {
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
