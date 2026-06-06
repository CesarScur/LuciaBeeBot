/* ============================================================
   BEE SVG
   ============================================================ */
function createBeeSVG() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 56 56');
    svg.setAttribute('width', '52');
    svg.setAttribute('height', '52');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `
    <!-- Wings -->
    <ellipse cx="16" cy="18" rx="11" ry="7" fill="#B3E5FC" opacity="0.85" transform="rotate(-20,16,18)"/>
    <ellipse cx="40" cy="18" rx="11" ry="7" fill="#B3E5FC" opacity="0.85" transform="rotate(20,40,18)"/>
    <!-- Body -->
    <ellipse cx="28" cy="32" rx="13" ry="16" fill="#FFD600"/>
    <!-- Stripes -->
    <ellipse cx="28" cy="30" rx="13" ry="4" fill="#212121" opacity="0.75"/>
    <ellipse cx="28" cy="38" rx="11" ry="3.5" fill="#212121" opacity="0.65"/>
    <!-- Head -->
    <circle cx="28" cy="18" r="9" fill="#FFD600"/>
    <!-- Eyes -->
    <circle cx="24" cy="16" r="3" fill="white"/>
    <circle cx="32" cy="16" r="3" fill="white"/>
    <circle cx="25" cy="16" r="1.5" fill="#212121"/>
    <circle cx="33" cy="16" r="1.5" fill="#212121"/>
    <!-- Smile -->
    <path d="M23,22 Q28,26 33,22" stroke="#212121" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <!-- Antennae -->
    <line x1="23" y1="10" x2="18" y2="4" stroke="#212121" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="18" cy="4" r="2" fill="#E53935"/>
    <line x1="33" y1="10" x2="38" y2="4" stroke="#212121" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="38" cy="4" r="2" fill="#E53935"/>
    <!-- Stinger -->
    <polygon points="28,47 25,44 31,44" fill="#F9A825"/>
  `;
    return svg;
}
