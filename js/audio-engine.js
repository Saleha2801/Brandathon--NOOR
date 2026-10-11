/**
 * NOOR - BEYOND SCENT
 * Generative Ambient Sound Engine (Web Audio API)
 * Pure procedural synthesis: rain, resonant warm wind, moonlight chime, and deep drone.
 * Fully optional, muted by default, gentle fading.
 */

class NoorAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.currentMode = 'default';
    this.masterGain = null;
    this.activeNodes = [];
    this.isMuted = true;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  toggle() {
    if (this.isMuted) {
      this.unmute();
      return true;
    } else {
      this.mute();
      return false;
    }
  }

  unmute() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isMuted = false;
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.22, this.ctx.currentTime + 1.2);
    this.setMode(this.currentMode || 'default');
  }

  mute() {
    if (!this.ctx || !this.masterGain) return;
    this.isMuted = true;
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.00001, this.ctx.currentTime + 0.8);
    setTimeout(() => {
      this.stopCurrentSounds();
    }, 900);
  }

  stopCurrentSounds() {
    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    this.activeNodes = [];
  }

  setMode(mode) {
    this.currentMode = mode;
    if (this.isMuted || !this.ctx) return;

    this.stopCurrentSounds();

    switch (mode) {
      case 'mitti':
        this.playRainMitti();
        break;
      case 'sandalwood':
        this.playWarmSandalwood();
        break;
      case 'mogra':
        this.playMoonlightMogra();
        break;
      case 'kasturi':
        this.playDeepKasturi();
        break;
      default:
        this.playSubtleAmbient();
        break;
    }
  }

  // Mitti: procedural rain droplets & soft pink-noise earth shower
  playRainMitti() {
    if (!this.ctx) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2 + white * 0.1) * 0.12;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    rainGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 1.5);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.masterGain);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, rainGain);
  }

  // Sandalwood: Warm golden harmonic resonance & temple breath
  playWarmSandalwood() {
    if (!this.ctx) return;
    const freqs = [108, 162, 216, 324]; // 432Hz sacred harmonic fifths
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04 / (idx + 1), this.ctx.currentTime + 2.0);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      this.activeNodes.push(osc, gain);
    });
  }

  // Mogra: Delicate high moonlight chime & ethereal silk
  playMoonlightMogra() {
    if (!this.ctx) return;
    const freqs = [528, 792, 1056]; // Solfeggio 528Hz love/clarity frequency
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // soft vibrato
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.3 + idx * 0.1, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(2.5, this.ctx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.025 / (idx + 1), this.ctx.currentTime + 2.0);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      this.activeNodes.push(osc, gain, lfo, lfoGain);
    });
  }

  // Kasturi: Deep atmospheric warm drone & dark amber resonance
  playDeepKasturi() {
    if (!this.ctx) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(54, this.ctx.currentTime); // Deep A1
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(55, this.ctx.currentTime); // Gentle binaural beating

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 2.0);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    this.activeNodes.push(osc1, osc2, filter, gain);
  }

  // Default subtle atmospheric breath
  playSubtleAmbient() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(108, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 2.0);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    this.activeNodes.push(osc, gain);
  }

  // Realistic pressurized perfume spray sound effect
  playSpraySound() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;

    // 1. Pressurized hiss (filtered noise burst)
    const bufferSize = this.ctx.sampleRate * 0.35;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.12));
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(3200, t);
    noiseFilter.Q.setValueAtTime(1.8, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, t);
    noiseGain.gain.linearRampToValueAtTime(0.28, t + 0.015);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noiseSource.start(t);

    // 2. Delicate crystalline overtone (golden shimmer chime)
    const bellOsc = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(1760, t + 0.04);
    bellOsc.frequency.exponentialRampToValueAtTime(2640, t + 0.28);

    bellGain.gain.setValueAtTime(0.001, t);
    bellGain.gain.linearRampToValueAtTime(0.06, t + 0.06);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);

    bellOsc.connect(bellGain);
    bellGain.connect(this.ctx.destination);
    bellOsc.start(t + 0.02);
    bellOsc.stop(t + 0.55);
  }
}

export const audioEngine = new NoorAudioEngine();
