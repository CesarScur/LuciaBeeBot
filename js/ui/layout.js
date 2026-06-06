/* ============================================================
   TABS
   ============================================================ */
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected','true');
        document.getElementById(`view-${tab.dataset.view}`).classList.add('active');
        if (tab.dataset.view === 'challenge' && window._challengeShowPicker) {
            if (window._challengeSkipPickerOnce) {
                window._challengeSkipPickerOnce = false;
            } else {
                const gameEl = document.getElementById('challenge-game');
                if (!gameEl.classList.contains('active')) window._challengeShowPicker();
            }
        }
        AudioManager.click();
    });
});

/* ============================================================
   HEADER CONTROLS
   ============================================================ */
document.getElementById('btn-high-contrast').addEventListener('click', function() {
    document.body.classList.toggle('high-contrast');
    const on = document.body.classList.contains('high-contrast');
    this.setAttribute('aria-pressed', on);
    try { localStorage.setItem('beebot_contrast', on ? '1' : '0'); } catch(e) {}
    AudioManager.click();
});

document.getElementById('btn-sound').addEventListener('click', function() {
    const enabled = !AudioManager.isEnabled();
    AudioManager.setEnabled(enabled);
    this.textContent = enabled ? '🔊 Sons' : '🔇 Mudo';
    this.setAttribute('aria-pressed', enabled);
    this.classList.toggle('active', enabled);
    try { localStorage.setItem('beebot_sound', enabled ? '1' : '0'); } catch(e) {}
});

// Load saved preferences
try {
    if (localStorage.getItem('beebot_contrast') === '1') {
        document.body.classList.add('high-contrast');
        document.getElementById('btn-high-contrast').setAttribute('aria-pressed','true');
    }
    if (localStorage.getItem('beebot_sound') === '0') {
        AudioManager.setEnabled(false);
        document.getElementById('btn-sound').textContent = '🔇 Mudo';
        document.getElementById('btn-sound').setAttribute('aria-pressed','false');
        document.getElementById('btn-sound').classList.remove('active');
    }
} catch(e) {}

/* ============================================================
   KEYBOARD SHORTCUTS GLOBAL
   ============================================================ */
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
});