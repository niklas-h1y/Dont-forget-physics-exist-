(function () {
  const GRAVITY = 0.35;
  const FRICTION = 0.65;
  const BOUNCE_LOSS = 0.6;
  const physicsParticles = [];
  let trackingActive = true;

  // Segment text into individual character wrappers safely without breaking structural layout
  function shatterElementsIntoLetters(element) {
    if (element.nodeType === Node.TEXT_NODE && element.textContent.trim().length > 0) {
      const textContent = element.textContent;
      const fragments = document.createDocumentFragment();

      for (let i = 0; i < textContent.length; i++) {
        const letterSpan = document.createElement('span');
        letterSpan.textContent = textContent[i];
        letterSpan.style.display = 'inline-block';
        letterSpan.style.whiteSpace = 'pre';
        letterSpan.style.transition = 'none';

        if (textContent[i] !== ' ' && textContent[i] !== '\n') {
          // Trigger physics on touch (mobile) or hover (desktop)
          const activateTrigger = (e) => {
            if (!trackingActive) return;
            letterSpan.removeEventListener('pointerover', activateTrigger);
            letterSpan.removeEventListener('touchstart', activateTrigger);

            const bounds = letterSpan.getBoundingClientRect();
            
            // Lock dimensions and detach into absolute layer
            letterSpan.style.position = 'fixed';
            letterSpan.style.left = `${bounds.left}px`;
            letterSpan.style.top = `${bounds.top}px`;
            letterSpan.style.width = `${bounds.width}px`;
            letterSpan.style.height = `${bounds.height}px`;
            letterSpan.style.zIndex = '2147483647';
            letterSpan.style.pointerEvents = 'none';

            physicsParticles.push({
              domElement: letterSpan,
              posX: bounds.left,
              posY: bounds.top,
              velX: (Math.random() - 0.5) * 5,
              velY: (Math.random() * -4) - 2,
              width: bounds.width,
              height: bounds.height
            });
          };

          letterSpan.addEventListener('pointerover', activateTrigger, { passive: true });
          letterSpan.addEventListener('touchstart', activateTrigger, { passive: true });
        }
        fragments.appendChild(letterSpan);
      }
      element.parentNode.replaceChild(fragments, element);
    } else {
      // Avoid targeting script, style, and high-density input blocks
      const ignoredTags = ['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'NOSCRIPT', 'SVG', 'CODE'];
      if (!ignoredTags.includes(element.nodeName)) {
        for (let i = element.childNodes.length - 1; i >= 0; i--) {
          shatterElementsIntoLetters(element.childNodes[i]);
        }
      }
    }
  }

  // Animation frame processor
  function runPhysicsLoop() {
    const viewHeight = window.innerHeight;
    const viewWidth = window.innerWidth;

    for (let i = 0; i < physicsParticles.length; i++) {
      const p = physicsParticles[i];
      
      p.velY += GRAVITY;
      p.posX += p.velX;
      p.posY += p.velY;

      // Bottom boundary intersection
      if (p.posY + p.height >= viewHeight) {
        p.posY = viewHeight - p.height;
        p.velY = -p.velY * BOUNCE_LOSS;
        p.velX *= FRICTION;
      }

      // Lateral boundaries intersection
      if (p.posX <= 0) {
        p.posX = 0;
        p.velX = -p.velX * BOUNCE_LOSS;
      } else if (p.posX + p.width >= viewWidth) {
        p.posX = viewWidth - p.width;
        p.velX = -p.velX * BOUNCE_LOSS;
      }

      p.domElement.style.left = `${p.posX}px`;
      p.domElement.style.top = `${p.posY}px`;
    }
    requestAnimationFrame(runPhysicsLoop);
  }

  // Initializing sequence
  shatterElementsIntoLetters(document.body);
  requestAnimationFrame(runPhysicsLoop);

  // Communications listener from extension popup settings menu
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'TOGGLE_PHYSICS') {
      trackingActive = event.data.enabled;
    }
  });
})();
