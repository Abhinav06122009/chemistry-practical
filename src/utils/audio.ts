// Web Audio API Synthesizer for realistic laboratory sounds.
// Lazy-initializes to comply with browser autoplay security policies.

let audioCtx: AudioContext | null = null;
let bubbleInterval: number | null = null;
let bubbleGainNode: GainNode | null = null;

// Transformer hum sound sources
let humOsc1: OscillatorNode | null = null;
let humOsc2: OscillatorNode | null = null;
let humGainNode: GainNode | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// 1. Play mechanical click sound for stopcock or buttons
export const playClickSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(450, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.06);
};

// 2. Play liquid pour/slosh sound
export const playPourSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const duration = 1.2;
  const sampleRate = ctx.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  // Fill buffer with white noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  // Create noise source
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // Filter to shape the sound of pouring liquid
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.setValueAtTime(12, ctx.currentTime);
  filter.frequency.setValueAtTime(500, ctx.currentTime);
  
  // Modulate filter frequency to simulate splashy movement
  filter.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + duration);

  // Gain node for smooth fade in/out
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
  // Periodic "glugs" modulation
  for (let t = 0.2; t < duration; t += 0.15) {
    gain.gain.setValueAtTime(0.12, ctx.currentTime + t);
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + t + 0.08);
  }
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start();
  noise.stop(ctx.currentTime + duration);
};

// 3. Play high-pitch drip chime (water drop falling)
export const playDripSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(900, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.04);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.05);
};

// 4. Start continuous chemical bubbling sound (for magnetic stirrer)
export const startBubbleSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (bubbleInterval) return; // Already running

  bubbleGainNode = ctx.createGain();
  bubbleGainNode.gain.setValueAtTime(0.04, ctx.currentTime);
  bubbleGainNode.connect(ctx.destination);

  bubbleInterval = window.setInterval(() => {
    if (!ctx || !bubbleGainNode) return;

    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      const delay = Math.random() * 0.1;
      const osc = ctx.createOscillator();
      const popGain = ctx.createGain();

      osc.type = 'sine';
      const baseFreq = 800 + Math.random() * 1200;
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + delay + 0.03);

      popGain.gain.setValueAtTime(0, ctx.currentTime + delay);
      popGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + delay + 0.005);
      popGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.035);

      osc.connect(popGain);
      popGain.connect(bubbleGainNode);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.04);
    }
  }, 120);
};

// 5. Stop continuous bubbling sound
export const stopBubbleSound = () => {
  if (bubbleInterval) {
    clearInterval(bubbleInterval);
    bubbleInterval = null;
  }
  if (bubbleGainNode) {
    try {
      bubbleGainNode.gain.setValueAtTime(bubbleGainNode.gain.value, audioCtx?.currentTime || 0);
      bubbleGainNode.gain.exponentialRampToValueAtTime(0.001, (audioCtx?.currentTime || 0) + 0.1);
      setTimeout(() => {
        bubbleGainNode?.disconnect();
        bubbleGainNode = null;
      }, 120);
    } catch (e) {
      bubbleGainNode = null;
    }
  }
};

// 6. Start continuous transformer magnetostriction hum
export const startHumSound = (freq: number = 50) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (humOsc1 || humOsc2) return; // Already running

  humGainNode = ctx.createGain();
  // Magnetostriction hum is double the electrical frequency (e.g. 50Hz AC yields 100Hz vibration hum)
  const humFreq = freq * 2;

  // Primary 100Hz saw or triangle wave for rich hum
  humOsc1 = ctx.createOscillator();
  humOsc1.type = 'sawtooth';
  humOsc1.frequency.setValueAtTime(humFreq, ctx.currentTime);

  // Harmonic at 200Hz to add warmth
  humOsc2 = ctx.createOscillator();
  humOsc2.type = 'triangle';
  humOsc2.frequency.setValueAtTime(humFreq * 2, ctx.currentTime);

  // Filter out harsh highs
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(250, ctx.currentTime);

  humGainNode.gain.setValueAtTime(0.06, ctx.currentTime);

  humOsc1.connect(filter);
  humOsc2.connect(filter);
  filter.connect(humGainNode);
  humGainNode.connect(ctx.destination);

  humOsc1.start();
  humOsc2.start();
};

// 7. Stop transformer hum
export const stopHumSound = () => {
  if (humOsc1) {
    try { humOsc1.stop(); humOsc1.disconnect(); } catch(e){}
    humOsc1 = null;
  }
  if (humOsc2) {
    try { humOsc2.stop(); humOsc2.disconnect(); } catch(e){}
    humOsc2 = null;
  }
  if (humGainNode) {
    try { humGainNode.disconnect(); } catch(e){}
    humGainNode = null;
  }
};

// 8. Play high-pitch alarm beep (thermal overload)
export const playAlarmSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(2200, ctx.currentTime);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.4);
};
