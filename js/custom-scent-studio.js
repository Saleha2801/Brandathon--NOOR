/**
 * NOOR — BEYOND SCENT
 * AI Personal Perfume Creation Studio
 * "Your mood. Your imagination. Your fragrance."
 */

class NoorScentStudio {
  constructor() {
    this.section = document.getElementById('scent-gallery');
    if (!this.section) return;

    this.state = {
      feel: 'Mysterious',
      character: 'Woody',
      palette: 'Warm amber',
      silhouette: 'Sculptural glass',
      customColor: '',
      personalisation: {
        name: '',
        memory: '',
        namingStyle: 'poetic'
      },
      scentData: null,
      imageUrl: null,
      isGenerating: false
    };

    this.init();
  }

  init() {
    this.renderStudio();
    this.bindEvents();
  }

  renderStudio() {
    // If not already rendered with template
    const container = document.getElementById('scent-studio-container');
    if (!container) return;
  }

  bindEvents() {
    // Selection cards
    document.querySelectorAll('.scent-choice-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const group = card.getAttribute('data-group');
        const value = card.getAttribute('data-value');
        if (!group || !value) return;

        // Deselect siblings in same group
        document.querySelectorAll(`.scent-choice-card[data-group="${group}"]`).forEach(c => {
          c.classList.remove('selected');
        });
        card.classList.add('selected');

        this.state[group] = value;
      });
    });

    // Custom color input
    const customColorInput = document.getElementById('scent-custom-color-input');
    if (customColorInput) {
      customColorInput.addEventListener('input', (e) => {
        this.state.customColor = e.target.value;
      });
    }

    // Personalisation inputs
    const nameInput = document.getElementById('scent-user-name');
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        this.state.personalisation.name = e.target.value;
      });
    }

    const memoryInput = document.getElementById('scent-user-memory');
    if (memoryInput) {
      memoryInput.addEventListener('input', (e) => {
        this.state.personalisation.memory = e.target.value;
      });
    }

    const styleSelect = document.getElementById('scent-naming-style');
    if (styleSelect) {
      styleSelect.addEventListener('change', (e) => {
        this.state.personalisation.namingStyle = e.target.value;
      });
    }

    // Submit button
    const submitBtn = document.getElementById('btn-create-scent');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.generateSignatureScent());
    }

    // Post-reveal actions
    const resetBtn = document.getElementById('btn-create-another');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetStudio());
    }

    const editBtn = document.getElementById('btn-edit-preferences');
    if (editBtn) {
      editBtn.addEventListener('click', () => this.showForm());
    }

    const downloadBtn = document.getElementById('btn-download-scent');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadCreation());
    }

    const shareBtn = document.getElementById('btn-share-scent');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareCreation());
    }

    const enquireBtn = document.getElementById('btn-enquire-scent');
    if (enquireBtn) {
      enquireBtn.addEventListener('click', () => this.openEnquiry());
    }
  }

  async generateSignatureScent() {
    if (this.state.isGenerating) return;
    this.state.isGenerating = true;

    const formEl = document.getElementById('scent-creator-form');
    const loaderEl = document.getElementById('scent-creation-loader');
    const revealEl = document.getElementById('scent-reveal-stage');
    const statusText = document.getElementById('scent-loader-status');
    const progressBar = document.getElementById('scent-loader-progress');

    // Show Loader
    formEl.style.display = 'none';
    revealEl.style.display = 'none';
    loaderEl.style.display = 'flex';

    // Step 1: Formulating Scent Identity
    statusText.textContent = "Consulting the Master Perfumer & weaving olfactory accords...";
    progressBar.style.width = "30%";

    try {
      // Call backend to generate perfume details
      const scentResp = await fetch('/api/generate-scent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feel: this.state.feel,
          character: this.state.character,
          palette: this.state.palette === 'Custom colour' ? (this.state.customColor || 'Warm amber') : this.state.palette,
          silhouette: this.state.silhouette,
          personalisation: this.state.personalisation
        })
      });

      const scentResult = await scentResp.json();
      if (!scentResult.ok || !scentResult.data) {
        throw new Error("Unable to formulate fragrance identity");
      }

      this.state.scentData = scentResult.data;

      // Step 2: Sculpting Bottle & Packaging
      statusText.textContent = "Sculpting bespoke flacon, crystal cap & gilded coffer...";
      progressBar.style.width = "65%";

      // Call backend to generate image
      const imgResp = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scentData: this.state.scentData,
          preferences: {
            palette: this.state.palette === 'Custom colour' ? (this.state.customColor || 'Warm amber') : this.state.palette,
            silhouette: this.state.silhouette
          }
        })
      });

      const imgResult = await imgResp.json();
      this.state.imageUrl = imgResult.imageUrl || 'assets/images/approved_perfume_01_midnight_musk.jpg';

      // Step 3: Revealing Scent
      statusText.textContent = "Polishing presentation for the private unveil...";
      progressBar.style.width = "100%";

      setTimeout(() => {
        this.displayReveal();
        this.state.isGenerating = false;
      }, 700);

    } catch (err) {
      console.error("Scent generation error:", err);
      statusText.textContent = "Fine-tuning your bespoke accord...";
      // Fallback display
      setTimeout(() => {
        this.displayReveal();
        this.state.isGenerating = false;
      }, 1000);
    }
  }

  displayReveal() {
    const loaderEl = document.getElementById('scent-creation-loader');
    const revealEl = document.getElementById('scent-reveal-stage');
    if (!loaderEl || !revealEl) return;

    loaderEl.style.display = 'none';
    revealEl.style.display = 'block';

    const data = this.state.scentData || {
      name: "OBSIDIAN NOCTURNE",
      story: "An intimate velvet composition echoing dark smoked woods and sacred amber embers.",
      descriptors: ["MYSTERIOUS", "WOODY", "REGAL"],
      notes: {
        top: ["Black Cardamom", "Smoked Bergamot"],
        heart: ["Sacred Cedar Heart", "Iris Resin"],
        base: ["Aged Oud", "Cashmere Wood"]
      },
      bottleDirection: "Sculptural glass with antique gold collar",
      boxDirection: "Rigid keepsake coffer wrapped in matte textured board",
      labelInscription: this.state.personalisation.name || "NOOR BESPOKE"
    };

    // Populate reveal DOM
    const nameEl = document.getElementById('reveal-perfume-name');
    if (nameEl) nameEl.textContent = data.name;

    const inscriptionEl = document.getElementById('reveal-inscription-tag');
    if (inscriptionEl) {
      inscriptionEl.textContent = `BESPOKE CREATION · FOR ${data.labelInscription.toUpperCase()}`;
    }

    const descriptorsWrap = document.getElementById('reveal-descriptors');
    if (descriptorsWrap) {
      descriptorsWrap.innerHTML = (data.descriptors || []).map(d => `<span class="keyword-badge">${d}</span>`).join('');
    }

    const storyEl = document.getElementById('reveal-story-text');
    if (storyEl) storyEl.textContent = data.story;

    // Notes breakdown
    const notesEl = document.getElementById('reveal-notes-breakdown');
    if (notesEl && data.notes) {
      notesEl.innerHTML = `
        <div class="reveal-note-col">
          <span class="note-type">TOP NOTES</span>
          <span class="note-items">${(data.notes.top || []).join(', ')}</span>
        </div>
        <div class="reveal-note-col">
          <span class="note-type">HEART NOTES</span>
          <span class="note-items">${(data.notes.heart || []).join(', ')}</span>
        </div>
        <div class="reveal-note-col">
          <span class="note-type">BASE NOTES</span>
          <span class="note-items">${(data.notes.base || []).join(', ')}</span>
        </div>
      `;
    }

    // Image reveal
    const imgEl = document.getElementById('reveal-product-image');
    if (imgEl) {
      imgEl.src = this.state.imageUrl || 'assets/images/approved_perfume_01_midnight_musk.jpg';
      imgEl.alt = data.name;
    }

    // Scroll smoothly to reveal
    revealEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  showForm() {
    const formEl = document.getElementById('scent-creator-form');
    const loaderEl = document.getElementById('scent-creation-loader');
    const revealEl = document.getElementById('scent-reveal-stage');

    loaderEl.style.display = 'none';
    revealEl.style.display = 'none';
    formEl.style.display = 'block';

    formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  resetStudio() {
    // Reset to defaults
    this.state.scentData = null;
    this.state.imageUrl = null;
    this.showForm();
  }

  downloadCreation() {
    if (!this.state.imageUrl) return;
    const link = document.createElement('a');
    link.href = this.state.imageUrl;
    link.download = `${(this.state.scentData?.name || 'NOOR_SIGNATURE').replace(/\s+/g, '_')}_CONCEPT.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async shareCreation() {
    const name = this.state.scentData?.name || 'My NOOR Signature Fragrance';
    const text = `I just designed ${name} with NOOR — Beyond Scent. Discover your signature fragrance!`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: name, text: text, url: url });
      } catch (err) {
        // User cancelled or unsupported
      }
    } else {
      // Fallback copy to clipboard
      navigator.clipboard.writeText(`${text} ${url}`).then(() => {
        alert("Link & fragrance details copied to clipboard!");
      });
    }
  }

  openEnquiry() {
    // Open product modal or concierge chat with prefilled custom scent message
    if (window.noorChat) {
      window.noorChat.open();
      const name = this.state.scentData?.name || 'my bespoke fragrance';
      window.noorChat.sendMessage(`Hello, I would like to enquire about bringing my signature scent "${name}" into physical production.`);
    } else {
      alert(`Thank you for your interest in "${this.state.scentData?.name}". Our Private Client Master Perfumer will be in touch.`);
    }
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.noorScentStudio = new NoorScentStudio();
});
