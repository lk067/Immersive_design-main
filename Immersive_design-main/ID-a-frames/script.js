AFRAME.registerComponent('schelp-klik', {
  schema: {
    soundId: { type: 'string', default: '#zeeGeluid' }
  },
  init: function () {
    const el = this.el;
    let isDraaiend = false;

    // Betrouwbare fallback: genereert een zacht ruisend golfgeluid
    const speelOceaanGeluid = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        // Ruisgenerator voor branding-effect
        const bufferSize = ctx.sampleRate * 2.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        // Filter voor een lage, warme golfklank
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1.0);
        filter.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 2.5);

        // Volumeregeling (fade-in en fade-out)
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
      } catch (err) {
        console.warn('Audio fallback kon niet starten:', err);
      }
    };

    el.addEventListener('click', () => {
      isDraaiend = !isDraaiend;

      const audio = document.querySelector(this.data.soundId);
      if (audio && audio.src && !audio.error) {
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            speelOceaanGeluid();
          });
        }
      } else {
        speelOceaanGeluid();
      }
    });

    this.tick = function (time, timeDelta) {
      if (isDraaiend) {
        // Roteer rond de Y-as
        el.object3D.rotation.y += (timeDelta / 1000) * 1.8;
      }
    };
  }
});