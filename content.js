(function () {
  const GRAVITY = 0.35;
  const FRICTION = 0.8;
  const BOUNCE_LOSS = 0.5;
  const physicsParticles = [];
  let trackingActive = true;
  const SCANNED_MARKER = 'data-shattered';

  function shatterElementsIntoLetters(element) {
    if (!element) return;
    
    try {
      if (element.nodeType === Node.TEXT_NODE && element.textContent.trim().length > 0) {
        const parent = element.parentNode;
        if (!parent || parent.hasAttribute(SCANNED_MARKER)) return;
        if (parent.closest && parent.closest('.cm-editor, .commit-create, form, input, textarea')) return;

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
                height: bounds.height
              });
            };

            // Touchstart für Mobilgeräte und Pointerover für Desktop-Modus
            letterSpan.addEventListener('pointerover', activateTrigger, { passive: true });
            letterSpan.addEventListener('touchstart', activateTrigger, { passive: true });
          }
          fragments.appendChild(letterSpan);
        }
        
        parent.setAttribute(SCANNED_MARKER, 'true');
        parent.replaceChild(fragments, element);
      } else {
        const ignoredTags = ['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'NOSCRIPT', 'SVG', 'CODE', 'CANVAS'];
        if (!ignoredTags.includes(element.nodeName) && element.nodeType === Node.ELEMENT_NODE) {
          if (element.hasAttribute(SCANNED_MARKER)) return;
          const children = Array.from(element.childNodes);
          for (let i = children.length - 1; i >= 0; i--) {
            shatterElementsIntoLetters(children[i]);
          }
        }
      }
    } catch (e) {}
  }

  function resolveParticleCollisions() {
    const len = physicsParticles.length;
    for (let i = 0; i < len; i++) {
      const p1 = physicsParticles[i];
      for (let j = i + 1; j < len; j++) {
        const p2 = physicsParticles[j];

        const p1Right = p1.posX + p1.width;
        const p1Bottom = p1.posY + p1.height;
        const p2Right = p2.posX + p2.width;
        const p2Bottom = p2.posY + p2.height;

        if (p1.posX < p2Right && p1Right > p2.posX && p1.posY < p2Bottom && p1Bottom > p2.posY) {
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
            if (overlapX < overlapY) {
              if (diffX > 0) { p1.posX += overlapX / 2; p2.posX -= overlapX / 2; }
              else { p1.posX -= overlapX / 2; p2.posX += overlapX / 2; }
              const tempVelX = p1.velX;
              p1.velX = p2.velX * BOUNCE_LOSS;
              p2.velX = tempVelX * BOUNCE_LOSS;
            } else {
              if (diffY > 0) { p1.posY += overlapY / 2; p2.posY -= overlapY / 2; }
              else { p1.posY -= overlapY / 2; p2.posY += overlapY / 2; }
              const tempVelY = p1.velY;
              p1.velY = p2.velY * BOUNCE_LOSS;
              p2.velY = tempVelY * BOUNCE_LOSS;
            }
          }
        }
      }
    }
  }

  function runPhysicsLoop() {
    const viewHeight = window.innerHeight;
    const viewWidth = window.innerWidth;

    for (let i = 0; i < physicsParticles.length; i++) {
      const p = physicsParticles[i];
      p.velY += GRAVITY;
      p.posX += p.velX;
      p.posY += p.velY;

      if (p.posY + p.height >= viewHeight) {
        p.posY = viewHeight - p.height;
        p.velY = -p.velY * BOUNCE_LOSS;
        p.velX *= FRICTION;
      }

      if (p.posX <= 0) {
        p.posX = 0;
        p.velX = -p.velX * BOUNCE_LOSS;
      } else if (p.posX + p.width >= viewWidth) {
        p.posX = viewWidth - p.width;
        p.velX = -p.velX * BOUNCE_LOSS;
      }
    }

    resolveParticleCollisions();

    for (let i = 0; i < physicsParticles.length; i++) {
      const p = physicsParticles[i];
      p.domElement.style.left = `${p.posX}px`;
      p.domElement.style.top = `${p.posY}px`;
    }

    requestAnimationFrame(runPhysicsLoop);
  }

  // Diese Funktion wartet jetzt intelligent, bis GitHub echten Inhalt geladen hat
  function startEngineWhenReady() {
    // Sobald sich Elemente im DOM befinden, legen wir los
    if (document.body && document.body.childNodes.length > 0) {
      shatterElementsIntoLetters(document.body);
      requestAnimationFrame(runPhysicsLoop);

      // Beobachtet den dynamischen Seitenaufbau
      const pageObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            shatterElementsIntoLetters(node);
          }
        }
      });
      pageObserver.observe(document.body, { childList: true, subtree: true });
    } else {
      // Wenn das Dokument noch leer ist, prüfen wir es in 50ms erneut
      setTimeout(startEngineWhenReady, 50);
    }
  }

  // Nur auf GitHub aktivieren
  if (window.location.hostname.includes('github.com')) {
    // Startet die Warteschleife, sobald die DOM-Struktur initialisiert wird
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startEngineWhenReady);
    } else {
      startEngineWhenReady();
    }
  }

  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'TOGGLE_PHYSICS') {
      trackingActive = event.data.enabled;
    }
  });
})();
