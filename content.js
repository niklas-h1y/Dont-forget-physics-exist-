(function () {
  const GRAVITY = 0.35;
  const FRICTION = 0.8; // Air resistance / slide friction
  const BOUNCE_LOSS = 0.5; // Elasticity of drops
  const physicsParticles = [];
  let trackingActive = true;

  // Segment text into individual character wrappers safely
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
          const activateTrigger = (e) => {
            if (!trackingActive) return;
            letterSpan.removeEventListener('pointerover', activateTrigger);
            letterSpan.removeEventListener('touchstart', activateTrigger);

            const bounds = letterSpan.getBoundingClientRect();
            
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
              velX: (Math.random() - 0.5) * 6,
              velY: (Math.random() * -3) - 2,
              width: bounds.width,
              height: bounds.height,
              mass: Math.max(bounds.width * bounds.height, 10) // Larger letters are heavier
            });
          };

          letterSpan.addEventListener('pointerover', activateTrigger, { passive: true });
          letterSpan.addEventListener('touchstart', activateTrigger, { passive: true });
        }
        fragments.appendChild(letterSpan);
      }
      element.parentNode.replaceChild(fragments, element);
    } else {
      const ignoredTags = ['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'NOSCRIPT', 'SVG', 'CODE'];
      if (!ignoredTags.includes(element.nodeName)) {
        for (let i = element.childNodes.length - 1; i >= 0; i--) {
          shatterElementsIntoLetters(element.childNodes[i]);
        }
      }
    }
  }

  // Handle elastic collisions between two letters
  function resolveParticleCollisions() {
    const len = physicsParticles.length;
    
    for (let i = 0; i < len; i++) {
      const p1 = physicsParticles[i];
      
      for (let j = i + 1; j < len; j++) {
        const p2 = physicsParticles[j];

        // 1. Quick AABB Box Intersection Check
        const p1Right = p1.posX + p1.width;
        const p1Bottom = p1.posY + p1.height;
        const p2Right = p2.posX + p2.width;
        const p2Bottom = p2.posY + p2.height;

        if (p1.posX < p2Right && p1Right > p2.posX && p1.posY < p2Bottom && p1Bottom > p2.posY) {
          
          // 2. Calculate midpoints & overlap distance
          const center1X = p1.posX + p1.width / 2;
          const center1Y = p1.posY + p1.height / 2;
          const center2X = p2.posX + p2.width / 2;
          const center2Y = p2.posY + p2.height / 2;

          const diffX = center1X - center2X;
          const diffY = center1Y - center2Y;

          const minDistanceX = (p1.width + p2.width) / 2;
          const minDistanceY = (p1.height + p2.height) / 2;

          const overlapX = minDistanceX - Math.abs(diffX);
          const overlapY = minDistanceY - Math.abs(diffY);

          if (overlapX > 0 && overlapY > 0) {
            // Push along the shallowest axis to avoid sticking or clipping
            if (overlapX < overlapY) {
              if (diffX > 0) {
                p1.posX += overlapX / 2;
                p2.posX -= overlapX / 2;
              } else {
                p1.posX -= overlapX / 2;
                p2.posX += overlapX / 2;
              }
              // Swap X velocities with energy loss
              const tempVelX = p1.velX;
              p1.velX = p2.velX * BOUNCE_LOSS;
              p2.velX = tempVelX * BOUNCE_LOSS;
            } else {
              if (diffY > 0) {
                p1.posY += overlapY / 2;
                p2.posY -= overlapY / 2;
              } else {
                p1.posY -= overlapY / 2;
                p2.posY += overlapY / 2;
              }
              // Swap Y velocities with energy loss
              const tempVelY = p1.velY;
              p1.velY = p2.velY * BOUNCE_LOSS;
              p2.velY = tempVelY * BOUNCE_LOSS;
            }
          }
        }
      }
    }
  }

  // Primary animation loop
  function runPhysicsLoop() {
    const viewHeight = window.innerHeight;
    const viewWidth = window.innerWidth;

    // Apply gravity and update movements
    for (let i = 0; i < physicsParticles.length; i++) {
      const p = physicsParticles[i];
      
      p.velY += GRAVITY;
      p.posX += p.velX;
      p.posY += p.velY;

      // Floor boundary constraints
      if (p.posY + p.height >= viewHeight) {
        p.posY = viewHeight - p.height;
        p.velY = -p.velY * BOUNCE_LOSS;
        p.velX *= FRICTION;
      }

      // Left & Right walls constraints
      if (p.posX <= 0) {
        p.posX = 0;
        p.velX = -p.velX * BOUNCE_LOSS;
      } else if (p.posX + p.width >= viewWidth) {
        p.posX = viewWidth - p.width;
        p.velX = -p.velX * BOUNCE_LOSS;
      }
    }

    // Resolve bouncing letters into each other
    resolveParticleCollisions();

    // Redraw updated positions on viewport screen
    for (let i = 0; i < physicsParticles.length; i++) {
      const p = physicsParticles[i];
      p.domElement.style.left = `${p.posX}px`;
      p.domElement.style.top = `${p.posY}px`;
    }

    requestAnimationFrame(runPhysicsLoop);
  }

  shatterElementsIntoLetters(document.body);
  requestAnimationFrame(runPhysicsLoop);

  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'TOGGLE_PHYSICS') {
      trackingActive = event.data.enabled;
    }
  });
})();
