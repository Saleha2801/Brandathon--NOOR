/**
 * NOOR - BEYOND SCENT
 * Luxury Minimal Cursor & Interactive Follower
 * Dot expands into soft ring with subtle contextual text ('DISCOVER' or 'SMELL').
 */

export class NoorCursor {
  constructor() {
    this.dot = null;
    this.ring = null;
    this.ringText = null;
    this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.isHovering = false;
    this.init();
  }

  init() {
    // Only on fine pointers (desktop)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    this.dot = document.createElement('div');
    this.dot.className = 'noor-cursor-dot';

    this.ring = document.createElement('div');
    this.ring.className = 'noor-cursor-ring';

    this.ringText = document.createElement('span');
    this.ringText.className = 'noor-cursor-text';
    this.ring.appendChild(this.ringText);

    document.body.appendChild(this.dot);
    document.body.appendChild(this.ring);

    window.addEventListener('mousemove', (e) => {
      this.target.x = e.clientX;
      this.target.y = e.clientY;
      this.dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      this.dot.classList.add('hidden');
      this.ring.classList.add('hidden');
    });

    document.addEventListener('mouseenter', () => {
      this.dot.classList.remove('hidden');
      this.ring.classList.remove('hidden');
    });

    this.bindHoverElements();
    this.animate();
  }

  bindHoverElements() {
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-cursor]');
      if (target) {
        const text = target.getAttribute('data-cursor') || 'DISCOVER';
        this.expand(text);
      } else if (e.target.closest('button, a, .clickable, .interactive-tag')) {
        this.expandSmall();
      } else {
        this.shrink();
      }
    });
  }

  expand(text) {
    this.ring.classList.add('active');
    this.ringText.textContent = text;
    this.dot.classList.add('active');
  }

  expandSmall() {
    this.ring.classList.add('active-small');
    this.ringText.textContent = '';
    this.dot.classList.add('active-small');
  }

  shrink() {
    this.ring.classList.remove('active', 'active-small');
    this.ringText.textContent = '';
    this.dot.classList.remove('active', 'active-small');
  }

  animate() {
    this.pos.x += (this.target.x - this.pos.x) * 0.16;
    this.pos.y += (this.target.y - this.pos.y) * 0.16;
    if (this.ring) {
      this.ring.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`;
    }
    requestAnimationFrame(() => this.animate());
  }
}
