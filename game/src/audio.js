// Small synthesised sounds through WebAudio: no audio files, no network.
// The context is created on the first user gesture, so it never blocks.
export function createAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (!context) {
      try {
        context = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        context = null;
      }
    }
    if (context && context.state === 'suspended') void context.resume();
    return context;
  }

  function tone(freq, when, length, type, gainValue) {
    const audio = ensure();
    if (!audio || muted) return;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, audio.currentTime + when);
    gain.gain.exponentialRampToValueAtTime(gainValue, audio.currentTime + when + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + when + length);
    osc.connect(gain).connect(audio.destination);
    osc.start(audio.currentTime + when);
    osc.stop(audio.currentTime + when + length + 0.05);
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    play() {
      tone(520, 0, 0.12, 'triangle', 0.12);
      tone(780, 0.06, 0.14, 'triangle', 0.1);
    },
    hit() {
      tone(180, 0, 0.16, 'sawtooth', 0.12);
      tone(90, 0.02, 0.2, 'square', 0.08);
    },
    heal() {
      tone(660, 0, 0.14, 'sine', 0.1);
      tone(880, 0.08, 0.18, 'sine', 0.1);
    },
    draw() {
      tone(440, 0, 0.07, 'triangle', 0.07);
    },
    win() {
      [523, 659, 784, 1047].forEach((freq, i) => tone(freq, i * 0.12, 0.22, 'triangle', 0.12));
    },
    lose() {
      [392, 330, 262, 196].forEach((freq, i) => tone(freq, i * 0.14, 0.24, 'sawtooth', 0.08));
    },
  };
}
