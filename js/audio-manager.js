/* ============================================================
   AUDIO MANAGER — Web Audio API
   ============================================================ */
const AudioManager = (() => {
    let ctx = null;
    let enabled = true;

    function getCtx() {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    function tone(freq, type = 'sine', duration = 0.12, vol = 0.18, delay = 0) {
        if (!enabled) return;
        try {
            const c = getCtx();
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.connect(gain);
            gain.connect(c.destination);
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, c.currentTime + delay);
            gain.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
            osc.start(c.currentTime + delay);
            osc.stop(c.currentTime + delay + duration + 0.01);
        } catch(e) {}
    }

    return {
        setEnabled(v) { enabled = v; },
        isEnabled() { return enabled; },
        click() { tone(440, 'square', 0.06, 0.12); },
        move() { tone(523, 'sine', 0.1, 0.15); tone(659, 'sine', 0.08, 0.12, 0.07); },
        turn() { tone(392, 'triangle', 0.15, 0.15); tone(494, 'triangle', 0.1, 0.12, 0.1); },
        pause_snd() { tone(330, 'sine', 0.2, 0.1); },
        success() {
            [523,659,784,1047].forEach((f,i) => tone(f,'sine',0.15,0.2,i*0.1));
        },
        error() {
            tone(220,'sawtooth',0.1,0.2); tone(185,'sawtooth',0.15,0.2,0.12);
        },
        collect() {
            tone(880,'sine',0.08,0.2); tone(1100,'sine',0.08,0.18,0.08); tone(1320,'sine',0.1,0.15,0.16);
        }
    };
})();