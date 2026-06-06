
/* ============================================================
   CONFETTI
   ============================================================ */
function launchConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['#FFD600','#FF5722','#4CAF50','#2196F3','#9C27B0','#FF9800'];
    for (let i = 0; i < 80; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.top = '-10px';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.transform = `rotate(${Math.random()*360}deg)`;
        piece.style.animationDuration = (1.5 + Math.random() * 2) + 's';
        piece.style.animationDelay = (Math.random() * 0.8) + 's';
        piece.style.width = (6 + Math.random() * 8) + 'px';
        piece.style.height = (6 + Math.random() * 8) + 'px';
        container.appendChild(piece);
        piece.addEventListener('animationend', () => piece.remove());
    }
}



