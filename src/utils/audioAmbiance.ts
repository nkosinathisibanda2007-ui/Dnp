// Web Audio API Ambience Synthesizer for Dzinopona Farms
// Synthesizes a gentle, soothing rural farm soundscape (breeze, soft grain rustle, distant harvester hum)
// Requires no external audio files, works offline, and complies with browser audio autoplay policies.

class FarmAmbienceSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private nodes: (AudioNode | number)[] = [];

  public start() {
    if (this.isPlaying) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.2, this.ctx.currentTime + 1.5);
      this.masterGain.connect(this.ctx.destination);

      // 1. Gentle Wind / Field Breeze (Pink Noise through resonant Bandpass filter)
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(320, this.ctx.currentTime);

      // Low frequency modulation for wind gusts
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(windFilter.frequency);

      whiteNoise.connect(windFilter);
      windFilter.connect(this.masterGain);

      whiteNoise.start();
      lfo.start();
      this.nodes.push(whiteNoise, lfo);

      // 2. Distant Mechanical Sheller/Harvester Rhythm (warm, low hum)
      const humOsc = this.ctx.createOscillator();
      humOsc.type = 'triangle';
      humOsc.frequency.setValueAtTime(58, this.ctx.currentTime); // 58 Hz low rhythmic engine tone

      const humFilter = this.ctx.createBiquadFilter();
      humFilter.type = 'lowpass';
      humFilter.frequency.setValueAtTime(120, this.ctx.currentTime);

      const humGain = this.ctx.createGain();
      humGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      humOsc.connect(humFilter);
      humFilter.connect(humGain);
      humGain.connect(this.masterGain);

      humOsc.start();
      this.nodes.push(humOsc);

      this.isPlaying = true;
    } catch {
      this.isPlaying = false;
    }
  }

  public stop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;
    try {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
      setTimeout(() => {
        if (this.ctx && this.ctx.state !== 'closed') {
          this.ctx.close();
        }
        this.ctx = null;
        this.masterGain = null;
        this.isPlaying = false;
      }, 700);
    } catch {
      this.isPlaying = false;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public get active(): boolean {
    return this.isPlaying;
  }
}

export const farmAmbience = new FarmAmbienceSynthesizer();
