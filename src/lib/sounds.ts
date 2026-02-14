/**
 * Generates a high-tech "Success" sound using Web Audio API
 */
export const playSuccessSound = () => {
    if (typeof window === 'undefined') return;

    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Final "Success" chirp
        const playChirp = (freq: number, startTime: number, duration: number, volume: number) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + duration);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(volume, startTime + 0.05);
            gain.gain.linearRampToValueAtTime(0, startTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
        };

        // Play a double chirp sequence
        const now = audioCtx.currentTime;
        playChirp(880, now, 0.1, 0.1); // A5
        playChirp(1320, now + 0.1, 0.2, 0.1); // E6

    } catch (e) {
        console.warn('Audio feedback failed:', e);
    }
};

export const playErrorSound = () => {
    if (typeof window === 'undefined') return;

    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const now = audioCtx.currentTime;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.3);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    } catch (e) { }
};
