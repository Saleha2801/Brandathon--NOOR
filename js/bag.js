/**
 * NOOR - BEYOND SCENT
 * Luxury Discovery Bag Manager
 * Minimal slide-over drawer with luxury vocabulary ("Experience", "Discover", "Flacon").
 */

export class NoorDiscoveryBag {
  constructor() {
    this.items = [];
    this.drawer = document.getElementById('noor-bag-drawer');
    this.backdrop = document.getElementById('noor-bag-backdrop');
    this.badge = document.getElementById('bag-count-badge');
    this.itemsContainer = document.getElementById('bag-items-list');
    this.totalPriceEl = document.getElementById('bag-total-price');

    this.init();
  }

  init() {
    // Open bag triggers
    document.querySelectorAll('[data-action="open-bag"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });

    // Close triggers
    const closeBtn = document.getElementById('close-bag-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (this.backdrop) this.backdrop.addEventListener('click', () => this.close());

    // Listen for add-to-bag events
    window.addEventListener('noor:add-to-bag', (e) => {
      this.addItem(e.detail);
      this.open();
    });

    const checkoutBtn = document.getElementById('bag-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (this.items.length === 0) return;
        this.simulateCheckout();
      });
    }
  }

  open() {
    if (this.drawer) this.drawer.classList.add('open');
    if (this.backdrop) this.backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (this.drawer) this.drawer.classList.remove('open');
    if (this.backdrop) this.backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  addItem(product) {
    const existing = this.items.find(i => i.id === product.id && i.size === product.size);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        number: product.number,
        size: product.size || '100ml Flacon',
        price: product.price || 14500,
        image: product.image,
        quantity: 1
      });
    }
    this.updateUI();
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.updateUI();
  }

  updateQuantity(index, delta) {
    if (!this.items[index]) return;
    this.items[index].quantity += delta;
    if (this.items[index].quantity <= 0) {
      this.removeItem(index);
    } else {
      this.updateUI();
    }
  }

  updateUI() {
    const totalCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (this.badge) {
      this.badge.textContent = totalCount;
      this.badge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
    }

    if (this.totalPriceEl) {
      this.totalPriceEl.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
    }

    if (!this.itemsContainer) return;

    if (this.items.length === 0) {
      this.itemsContainer.innerHTML = `
        <div class="empty-bag-state">
          <p class="empty-bag-text">Your discovery bag is currently unwritten.</p>
          <span class="empty-bag-sub">Explore the collection to invite a fragrance into your visual world.</span>
        </div>
      `;
      return;
    }

    this.itemsContainer.innerHTML = this.items.map((item, idx) => `
      <div class="bag-item-card">
        <div class="bag-item-thumb">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="bag-item-details">
          <div class="bag-item-top">
            <span class="bag-item-num">${item.number}</span>
            <span class="bag-item-title">${item.name}</span>
          </div>
          <span class="bag-item-size">${item.size}</span>
          <span class="bag-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
          <div class="bag-item-controls">
            <button class="bag-qty-btn clickable" data-index="${idx}" data-delta="-1">−</button>
            <span class="bag-qty-val">${item.quantity}</span>
            <button class="bag-qty-btn clickable" data-index="${idx}" data-delta="1">+</button>
            <button class="bag-remove-link clickable" data-index="${idx}">Remove</button>
          </div>
        </div>
      </div>
    `).join('');

    // Re-attach controls
    this.itemsContainer.querySelectorAll('.bag-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        const delta = parseInt(btn.getAttribute('data-delta'));
        this.updateQuantity(idx, delta);
      });
    });

    this.itemsContainer.querySelectorAll('.bag-remove-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        this.removeItem(idx);
      });
    });
  }

  simulateCheckout() {
    const confirmation = document.getElementById('bag-checkout-confirmation');
    if (confirmation) {
      confirmation.classList.remove('hidden');
      setTimeout(() => {
        this.items = [];
        this.updateUI();
        confirmation.classList.add('hidden');
        this.close();
      }, 3500);
    }
  }
}
