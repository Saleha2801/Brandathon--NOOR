/**
 * NOOR — BEYOND SCENT
 * AI Atelier Concierge Chatbot
 * Knows full catalogue, heritage quadrant, notes, philosophy, and custom studio.
 */

class NoorConciergeChat {
  constructor() {
    this.history = [];
    this.isOpen = false;
    this.init();
  }

  init() {
    this.createWidgetDOM();
    this.bindEvents();
  }

  createWidgetDOM() {
    const existing = document.getElementById('noor-concierge-widget');
    if (existing) return;

    const widget = document.createElement('div');
    widget.id = 'noor-concierge-widget';
    widget.className = 'noor-concierge-widget';

    widget.innerHTML = `
      <!-- Floating Trigger Button -->
      <button class="concierge-trigger-btn clickable" id="concierge-toggle-btn" aria-label="Open NOOR Concierge Chat">
        <span class="trigger-sparkle">✨</span>
        <span class="trigger-label">ATELIER CONCIERGE</span>
      </button>

      <!-- Chat Drawer Window -->
      <div class="concierge-chat-panel" id="concierge-chat-panel" aria-hidden="true">
        <!-- Header -->
        <div class="concierge-panel-header">
          <div class="concierge-brand-title">
            <span class="concierge-star">✦</span>
            <div>
              <h4>NOOR CONCIERGE</h4>
              <span class="concierge-status">AI Master Fragrance Advisor</span>
            </div>
          </div>
          <button class="concierge-close-btn clickable" id="concierge-close-btn" aria-label="Close Chat">✕</button>
        </div>

        <!-- Message Stream -->
        <div class="concierge-messages-body" id="concierge-messages-body">
          <div class="concierge-bubble bot-msg">
            <p>Welcome to NOOR — Beyond Scent. I am your private Atelier Concierge.</p>
            <p>May I guide you through our 4 Indian Heritage attars, recommend a bespoke creation, or explore the 20-perfume compendium with you?</p>
          </div>
          <div class="concierge-suggestions" id="concierge-suggestions">
            <button class="concierge-chip clickable" data-query="Tell me about Mitti Attar & Kannauj distillation">Mitti Attar & Kannauj</button>
            <button class="concierge-chip clickable" data-query="Which perfume is warm, woody and regal?">Warm & Woody scents</button>
            <button class="concierge-chip clickable" data-query="How can I create my signature scent?">Custom Scent Studio</button>
            <button class="concierge-chip clickable" data-query="What are the fragrance prices?">Collection Pricing</button>
          </div>
        </div>

        <!-- Input Bar -->
        <div class="concierge-input-bar">
          <input type="text" id="concierge-text-input" placeholder="Ask about notes, heritage, custom perfumes..." aria-label="Message to Concierge" />
          <button id="concierge-send-btn" class="clickable" aria-label="Send Message">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(widget);
  }

  bindEvents() {
    const toggleBtn = document.getElementById('concierge-toggle-btn');
    const closeBtn = document.getElementById('concierge-close-btn');
    const sendBtn = document.getElementById('concierge-send-btn');
    const input = document.getElementById('concierge-text-input');
    const suggestions = document.getElementById('concierge-suggestions');

    if (toggleBtn) toggleBtn.addEventListener('click', () => this.toggle());
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    if (sendBtn) sendBtn.addEventListener('click', () => this.handleSend());
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleSend();
      });
    }

    if (suggestions) {
      suggestions.addEventListener('click', (e) => {
        const chip = e.target.closest('.concierge-chip');
        if (chip) {
          const query = chip.getAttribute('data-query');
          if (query) this.sendMessage(query);
        }
      });
    }
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open() {
    const panel = document.getElementById('concierge-chat-panel');
    if (!panel) return;
    panel.classList.add('active');
    panel.setAttribute('aria-hidden', 'false');
    this.isOpen = true;
    setTimeout(() => {
      document.getElementById('concierge-text-input')?.focus();
    }, 200);
  }

  close() {
    const panel = document.getElementById('concierge-chat-panel');
    if (!panel) return;
    panel.classList.remove('active');
    panel.setAttribute('aria-hidden', 'true');
    this.isOpen = false;
  }

  handleSend() {
    const input = document.getElementById('concierge-text-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    this.sendMessage(text);
  }

  async sendMessage(text) {
    const messagesBody = document.getElementById('concierge-messages-body');
    if (!messagesBody) return;

    // Append user message
    const userBubble = document.createElement('div');
    userBubble.className = 'concierge-bubble user-msg';
    userBubble.textContent = text;
    messagesBody.appendChild(userBubble);
    messagesBody.scrollTop = messagesBody.scrollHeight;

    // Append typing indicator
    const typingBubble = document.createElement('div');
    typingBubble.className = 'concierge-bubble bot-msg typing';
    typingBubble.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    messagesBody.appendChild(typingBubble);
    messagesBody.scrollTop = messagesBody.scrollHeight;

    this.history.push({ role: 'user', content: text });

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: this.history
        })
      });

      const res = await resp.json();
      typingBubble.remove();

      const botText = res.reply || "I am at your service. Please tell me more about what you are seeking.";
      const botBubble = document.createElement('div');
      botBubble.className = 'concierge-bubble bot-msg';
      botBubble.innerHTML = `<p>${botText}</p>`;
      messagesBody.appendChild(botBubble);
      messagesBody.scrollTop = messagesBody.scrollHeight;

      this.history.push({ role: 'assistant', content: botText });
    } catch (err) {
      typingBubble.remove();
      const errBubble = document.createElement('div');
      errBubble.className = 'concierge-bubble bot-msg';
      errBubble.innerHTML = "<p>Our Atelier is curating your response. Feel free to explore our 4 Heritage Quadrant perfumes above.</p>";
      messagesBody.appendChild(errBubble);
      messagesBody.scrollTop = messagesBody.scrollHeight;
    }
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.noorChat = new NoorConciergeChat();
});
