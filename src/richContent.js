import katex from "katex";

// ── SVG DIAGRAMS ────────────────────────────────────────────────────────────
export const DIAGRAMS = {
  // Concave Mirror
  "concave-mirror": `
<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto">
  <defs>
    <marker id="arr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#3B82F6"/>
    </marker>
    <marker id="arr2" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
      <polygon points="8 0, 0 3, 8 6" fill="#EF4444"/>
    </marker>
  </defs>
  <!-- Principal axis -->
  <line x1="10" y1="100" x2="390" y2="100" stroke="#888" stroke-width="1" stroke-dasharray="4"/>
  <!-- Mirror arc -->
  <path d="M 60 30 Q 30 100 60 170" stroke="#A855F7" stroke-width="3" fill="none"/>
  <!-- Hatching -->
  <line x1="60" y1="30" x2="45" y2="40" stroke="#A855F7" stroke-width="1.5"/>
  <line x1="55" y1="55" x2="40" y2="65" stroke="#A855F7" stroke-width="1.5"/>
  <line x1="50" y1="80" x2="35" y2="90" stroke="#A855F7" stroke-width="1.5"/>
  <line x1="50" y1="120" x2="35" y2="110" stroke="#A855F7" stroke-width="1.5"/>
  <line x1="55" y1="145" x2="40" y2="135" stroke="#A855F7" stroke-width="1.5"/>
  <!-- Object -->
  <line x1="280" y1="100" x2="280" y2="50" stroke="#22C55E" stroke-width="2.5" marker-end="url(#arr)"/>
  <text x="287" y="75" fill="#22C55E" font-size="11" font-family="Syne,sans-serif" font-weight="700">Object</text>
  <!-- Image -->
  <line x1="100" y1="100" x2="100" y2="135" stroke="#EF4444" stroke-width="2.5"/>
  <text x="107" y="125" fill="#EF4444" font-size="11" font-family="Syne,sans-serif" font-weight="700">Image</text>
  <!-- Ray 1: parallel to axis -->
  <line x1="280" y1="50" x2="60" y2="50" stroke="#3B82F6" stroke-width="1.5" stroke-dasharray="4" marker-end="url(#arr)"/>
  <!-- Ray 1 after reflection through focus -->
  <line x1="60" y1="50" x2="100" y2="100" stroke="#3B82F6" stroke-width="1.5" marker-end="url(#arr)"/>
  <!-- Labels -->
  <text x="160" y="92" fill="#888" font-size="10" font-family="JetBrains Mono,monospace">F</text>
  <circle cx="165" cy="100" r="3" fill="#F59E0B"/>
  <text x="112" y="92" fill="#888" font-size="10" font-family="JetBrains Mono,monospace">C</text>
  <circle cx="118" cy="100" r="3" fill="#F59E0B"/>
  <text x="30" y="188" fill="#A855F7" font-size="11" font-family="Syne,sans-serif" font-weight="800">Concave Mirror</text>
</svg>`,

  // Convex Lens
  "convex-lens": `
<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto">
  <defs>
    <marker id="a1" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#3B82F6"/>
    </marker>
  </defs>
  <!-- Principal axis -->
  <line x1="10" y1="100" x2="390" y2="100" stroke="#888" stroke-width="1" stroke-dasharray="4"/>
  <!-- Convex lens -->
  <path d="M 190 40 Q 220 100 190 160" stroke="#3B82F6" stroke-width="2.5" fill="rgba(59,130,246,0.08)"/>
  <path d="M 190 40 Q 160 100 190 160" stroke="#3B82F6" stroke-width="2.5" fill="none"/>
  <!-- Object -->
  <line x1="80" y1="100" x2="80" y2="55" stroke="#22C55E" stroke-width="2.5"/>
  <polygon points="80,55 75,68 85,68" fill="#22C55E"/>
  <text x="60" y="48" fill="#22C55E" font-size="11" font-family="Syne,sans-serif" font-weight="700">Object</text>
  <!-- Image -->
  <line x1="310" y1="100" x2="310" y2="135" stroke="#EF4444" stroke-width="2.5"/>
  <polygon points="310,135 305,122 315,122" fill="#EF4444"/>
  <text x="290" y="155" fill="#EF4444" font-size="11" font-family="Syne,sans-serif" font-weight="700">Image</text>
  <!-- Rays -->
  <line x1="80" y1="55" x2="190" y2="55" stroke="#3B82F6" stroke-width="1.5" stroke-dasharray="3"/>
  <line x1="190" y1="55" x2="310" y2="135" stroke="#3B82F6" stroke-width="1.5" marker-end="url(#a1)"/>
  <!-- F points -->
  <circle cx="250" cy="100" r="3" fill="#F59E0B"/>
  <text x="255" y="94" fill="#F59E0B" font-size="10" font-family="JetBrains Mono,monospace" font-weight="700">F</text>
  <circle cx="130" cy="100" r="3" fill="#F59E0B"/>
  <text x="135" y="94" fill="#F59E0B" font-size="10" font-family="JetBrains Mono,monospace" font-weight="700">F'</text>
  <text x="140" y="188" fill="#3B82F6" font-size="11" font-family="Syne,sans-serif" font-weight="800">Convex Lens — Real Image</text>
</svg>`,

  // Refraction through glass slab
  "refraction": `
<svg viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto">
  <defs>
    <marker id="ra" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#F59E0B"/>
    </marker>
  </defs>
  <!-- Glass slab -->
  <rect x="120" y="40" width="120" height="140" fill="rgba(59,130,246,0.12)" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="150" y="115" fill="#3B82F6" font-size="12" font-family="Syne,sans-serif" font-weight="800">Glass</text>
  <text x="148" y="130" fill="#3B82F6" font-size="10" font-family="JetBrains Mono,monospace">n = 1.5</text>
  <!-- Normal line -->
  <line x1="180" y1="10" x2="180" y2="210" stroke="#888" stroke-width="1" stroke-dasharray="4"/>
  <!-- Incident ray -->
  <line x1="40" y1="10" x2="180" y2="80" stroke="#F59E0B" stroke-width="2" marker-end="url(#ra)"/>
  <!-- Refracted ray inside -->
  <line x1="180" y1="80" x2="180" y2="160" stroke="#F59E0B" stroke-width="2" stroke-dasharray="5" marker-end="url(#ra)"/>
  <!-- Emergent ray -->
  <line x1="180" y1="160" x2="320" y2="210" stroke="#F59E0B" stroke-width="2" marker-end="url(#ra)"/>
  <!-- Angle labels -->
  <text x="155" y="65" fill="#EF4444" font-size="11" font-family="JetBrains Mono,monospace">i</text>
  <text x="188" y="100" fill="#22C55E" font-size="11" font-family="JetBrains Mono,monospace">r</text>
  <!-- Air labels -->
  <text x="30" y="35" fill="#888" font-size="11" font-family="Syne,sans-serif" font-weight="700">Air (n=1)</text>
  <text x="250" y="35" fill="#888" font-size="11" font-family="Syne,sans-serif" font-weight="700">Air (n=1)</text>
  <text x="100" y="210" fill="#3B82F6" font-size="11" font-family="Syne,sans-serif" font-weight="800">Refraction through Glass Slab</text>
</svg>`,

  // Simple circuit
  "circuit": `
<svg viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto">
  <!-- Battery -->
  <line x1="40" y1="80" x2="40" y2="140" stroke="#1a1a2e" stroke-width="2"/>
  <line x1="30" y1="95" x2="50" y2="95" stroke="#1a1a2e" stroke-width="3"/>
  <line x1="35" y1="107" x2="45" y2="107" stroke="#1a1a2e" stroke-width="2"/>
  <line x1="30" y1="119" x2="50" y2="119" stroke="#1a1a2e" stroke-width="3"/>
  <line x1="35" y1="131" x2="45" y2="131" stroke="#1a1a2e" stroke-width="2"/>
  <text x="55" y="115" fill="#1a1a2e" font-size="11" font-family="Syne,sans-serif" font-weight="700">Battery</text>
  <!-- Wires -->
  <line x1="40" y1="80" x2="40" y2="50" stroke="#22C55E" stroke-width="2.5"/>
  <line x1="40" y1="50" x2="320" y2="50" stroke="#22C55E" stroke-width="2.5"/>
  <line x1="320" y1="50" x2="320" y2="80" stroke="#22C55E" stroke-width="2.5"/>
  <line x1="40" y1="140" x2="40" y2="170" stroke="#22C55E" stroke-width="2.5"/>
  <line x1="40" y1="170" x2="320" y2="170" stroke="#22C55E" stroke-width="2.5"/>
  <line x1="320" y1="170" x2="320" y2="140" stroke="#22C55E" stroke-width="2.5"/>
  <!-- Resistor (zigzag) -->
  <polyline points="220,80 228,90 236,75 244,100 252,80 260,95 268,80 276,90 284,80" fill="none" stroke="#EF4444" stroke-width="2.5"/>
  <line x1="284" y1="80" x2="284" y2="75" stroke="#EF4444" stroke-width="2"/>
  <line x1="220" y1="80" x2="220" y2="75" stroke="#EF4444" stroke-width="2"/>
  <text x="238" y="115" fill="#EF4444" font-size="11" font-family="Syne,sans-serif" font-weight="700">R (Resistor)</text>
  <!-- Bulb -->
  <circle cx="160" cy="80" r="18" fill="rgba(245,158,11,0.15)" stroke="#F59E0B" stroke-width="2"/>
  <line x1="152" y1="88" x2="168" y2="72" stroke="#F59E0B" stroke-width="1.5"/>
  <line x1="168" y1="88" x2="152" y2="72" stroke="#F59E0B" stroke-width="1.5"/>
  <line x1="160" y1="62" x2="160" y2="50" stroke="#22C55E" stroke-width="2.5"/>
  <line x1="160" y1="98" x2="160" y2="170" stroke="#22C55E" stroke-width="2.5"/>
  <text x="140" y="125" fill="#F59E0B" font-size="11" font-family="Syne,sans-serif" font-weight="700">Bulb</text>
  <!-- Current arrows -->
  <text x="130" y="42" fill="#3B82F6" font-size="10" font-family="JetBrains Mono,monospace">→ I</text>
  <text x="130" y="183" fill="#3B82F6" font-size="10" font-family="JetBrains Mono,monospace">← I</text>
  <text x="100" y="205" fill="#1a1a2e" font-size="11" font-family="Syne,sans-serif" font-weight="800">Simple Electric Circuit</text>
</svg>`,

  // Photosynthesis diagram
  "photosynthesis": `
<svg viewBox="0 0 380 220" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto">
  <!-- Leaf shape -->
  <path d="M 190 30 Q 280 60 280 130 Q 280 180 190 190 Q 100 180 100 130 Q 100 60 190 30 Z" fill="rgba(34,197,94,0.2)" stroke="#22C55E" stroke-width="2"/>
  <!-- Midrib -->
  <line x1="190" y1="30" x2="190" y2="190" stroke="#22C55E" stroke-width="2" stroke-dasharray="4"/>
  <!-- Veins -->
  <line x1="190" y1="80" x2="140" y2="110" stroke="#22C55E" stroke-width="1.5" stroke-dasharray="3"/>
  <line x1="190" y1="80" x2="240" y2="110" stroke="#22C55E" stroke-width="1.5" stroke-dasharray="3"/>
  <line x1="190" y1="120" x2="148" y2="145" stroke="#22C55E" stroke-width="1.5" stroke-dasharray="3"/>
  <line x1="190" y1="120" x2="232" y2="145" stroke="#22C55E" stroke-width="1.5" stroke-dasharray="3"/>
  <!-- Sun -->
  <circle cx="50" cy="40" r="22" fill="rgba(245,158,11,0.3)" stroke="#F59E0B" stroke-width="2"/>
  <text x="38" y="45" fill="#D97706" font-size="11" font-family="Syne,sans-serif" font-weight="800">☀️</text>
  <!-- Light rays -->
  <line x1="72" y1="50" x2="130" y2="90" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="4" marker-end="url(#ra2)"/>
  <line x1="72" y1="35" x2="130" y2="70" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="4"/>
  <!-- CO2 input -->
  <text x="10" y="135" fill="#EF4444" font-size="11" font-family="Syne,sans-serif" font-weight="700">CO₂</text>
  <line x1="55" y1="130" x2="100" y2="130" stroke="#EF4444" stroke-width="1.5" marker-end="url(#ra2)"/>
  <!-- H2O input -->
  <text x="10" y="160" fill="#3B82F6" font-size="11" font-family="Syne,sans-serif" font-weight="700">H₂O</text>
  <line x1="55" y1="155" x2="100" y2="150" stroke="#3B82F6" stroke-width="1.5" marker-end="url(#ra2)"/>
  <!-- O2 output -->
  <text x="310" y="110" fill="#22C55E" font-size="11" font-family="Syne,sans-serif" font-weight="700">O₂</text>
  <line x1="280" y1="100" x2="307" y2="100" stroke="#22C55E" stroke-width="1.5" marker-end="url(#ra2)"/>
  <!-- Glucose output -->
  <text x="300" y="145" fill="#A855F7" font-size="10" font-family="Syne,sans-serif" font-weight="700">C₆H₁₂O₆</text>
  <line x1="280" y1="135" x2="298" y2="135" stroke="#A855F7" stroke-width="1.5" marker-end="url(#ra2)"/>
  <defs>
    <marker id="ra2" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
      <polygon points="0 0, 6 2.5, 0 5" fill="#888"/>
    </marker>
  </defs>
  <text x="110" y="212" fill="#22C55E" font-size="11" font-family="Syne,sans-serif" font-weight="800">Photosynthesis in Leaf</text>
</svg>`,

  // Human eye
  "human-eye": `
<svg viewBox="0 0 380 200" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto">
  <!-- Eye outline -->
  <ellipse cx="190" cy="100" rx="140" ry="80" fill="rgba(255,255,255,0.9)" stroke="#1a1a2e" stroke-width="2"/>
  <!-- Sclera -->
  <ellipse cx="190" cy="100" rx="138" ry="78" fill="white"/>
  <!-- Iris -->
  <circle cx="190" cy="100" r="55" fill="rgba(59,130,246,0.3)" stroke="#3B82F6" stroke-width="2"/>
  <!-- Pupil -->
  <circle cx="190" cy="100" r="25" fill="#1a1a2e"/>
  <!-- Lens -->
  <ellipse cx="190" cy="100" rx="12" ry="30" fill="rgba(245,158,11,0.4)" stroke="#F59E0B" stroke-width="1.5"/>
  <!-- Cornea -->
  <path d="M 55 100 Q 80 60 80 100 Q 80 140 55 100" fill="rgba(59,130,246,0.15)" stroke="#3B82F6" stroke-width="1.5"/>
  <!-- Retina label -->
  <text x="300" y="85" fill="#EF4444" font-size="10" font-family="Syne,sans-serif" font-weight="700">Retina</text>
  <line x1="298" y1="90" x2="278" y2="100" stroke="#EF4444" stroke-width="1" stroke-dasharray="3"/>
  <!-- Labels -->
  <text x="55" y="175" fill="#3B82F6" font-size="10" font-family="Syne,sans-serif" font-weight="700">Cornea</text>
  <text x="148" y="175" fill="#1a1a2e" font-size="10" font-family="Syne,sans-serif" font-weight="700">Pupil</text>
  <text x="200" y="175" fill="#3B82F6" font-size="10" font-family="Syne,sans-serif" font-weight="700">Iris</text>
  <text x="248" y="175" fill="#F59E0B" font-size="10" font-family="Syne,sans-serif" font-weight="700">Lens</text>
  <!-- Optic nerve -->
  <line x1="328" y1="100" x2="360" y2="100" stroke="#A855F7" stroke-width="3"/>
  <text x="330" y="120" fill="#A855F7" font-size="9" font-family="Syne,sans-serif" font-weight="700">Optic Nerve</text>
  <text x="120" y="15" fill="#1a1a2e" font-size="12" font-family="Syne,sans-serif" font-weight="800">Human Eye — Cross Section</text>
</svg>`,
};

// ── RICH TEXT PARSER ─────────────────────────────────────────────────────────
// Syntax:
//   # Title         → h1
//   ## Heading      → h2
//   ### Sub         → h3
//   !!text!!        → yellow highlight block
//   !!green:text!!  → green highlight block
//   !!blue:text!!   → blue highlight block
//   !!red:text!!    → red highlight block
//   :::formula:::   → formula card with KaTeX
//   :::def:text::: → definition box
//   :::remember:text::: → remember box
//   :::diagram:name::: → SVG diagram
//   ==text==        → inline mark/highlight
//   - text          → bullet point
//   $formula$       → inline math
//   $$formula$$     → block math

function parseRichContent(text, subjectColor) {
  if (!text) return "";
  const sc = subjectColor || "#e8622a";

  const lines = text.split("\n");
  let html = `<div class="rich-content" style="--subject-color:${sc}">`;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // H1
    if (line.startsWith("# ")) {
      html += `<div class="h1">${parsInline(line.slice(2))}</div>`;
    }
    // H2
    else if (line.startsWith("## ")) {
      html += `<div class="h2">${parsInline(line.slice(3))}</div>`;
    }
    // H3
    else if (line.startsWith("### ")) {
      html += `<div class="h3">${parsInline(line.slice(4))}</div>`;
    }
    // Bullet
    else if (line.startsWith("- ")) {
      html += `<div class="bullet">${parsInline(line.slice(2))}</div>`;
    }
    // Formula card :::formula:::
    else if (line.startsWith(":::formula:") && line.endsWith(":::")) {
      const math = line.slice(11, -3);
      try {
        const rendered = katex.renderToString(math, { displayMode: true, throwOnError: false });
        html += `<div class="formula-card"><div class="formula-label">📐 Formula</div>${rendered}</div>`;
      } catch {
        html += `<div class="formula-card"><div class="formula-label">📐 Formula</div><code>${math}</code></div>`;
      }
    }
    // Definition box :::def:text:::
    else if (line.startsWith(":::def:") && line.endsWith(":::")) {
      const content = line.slice(7, -3);
      html += `<div class="def-box"><div class="def-label">📖 Definition</div>${parsInline(content)}</div>`;
    }
    // Remember box :::remember:text:::
    else if (line.startsWith(":::remember:") && line.endsWith(":::")) {
      const content = line.slice(12, -3);
      html += `<div class="remember-box"><div class="remember-label">⭐ Remember</div>${parsInline(content)}</div>`;
    }
    // SVG Diagram :::diagram:name:::
    else if (line.startsWith(":::diagram:") && line.endsWith(":::")) {
      const name = line.slice(11, -3).trim();
      const svg = DIAGRAMS[name];
      if (svg) {
        html += `<div class="diagram-box">${svg}<div class="diagram-label">📊 ${name.replace(/-/g," ").toUpperCase()}</div></div>`;
      } else {
        html += `<div class="diagram-box" style="padding:20px;color:var(--muted);font-size:0.85rem">Diagram "${name}" not found. Available: ${Object.keys(DIAGRAMS).join(", ")}</div>`;
      }
    }
    // Highlight blocks !!color:text!! or !!text!!
    else if (line.startsWith("!!") && line.endsWith("!!")) {
      const inner = line.slice(2, -2);
      const colonIdx = inner.indexOf(":");
      let color = "yellow", content = inner;
      if (colonIdx > -1 && ["green","blue","red","purple","yellow"].includes(inner.slice(0, colonIdx))) {
        color = inner.slice(0, colonIdx);
        content = inner.slice(colonIdx + 1);
      }
      html += `<div class="hl-${color}">${parsInline(content)}</div>`;
    }
    // Block math $$...$$
    else if (line.startsWith("$$") && line.endsWith("$$") && line.length > 4) {
      const math = line.slice(2, -2);
      try {
        html += katex.renderToString(math, { displayMode: true, throwOnError: false });
      } catch { html += `<code>${math}</code>`; }
    }
    // Empty line
    else if (line.trim() === "") {
      html += "<br/>";
    }
    // Normal line
    else {
      html += `<p style="margin:4px 0">${parsInline(line)}</p>`;
    }

    i++;
  }

  html += "</div>";
  return html;
}

// Inline parser: ==mark==, $math$, **bold**
function parsInline(text) {
  return text
    // Inline math $...$
    .replace(/\$([^$\n]+?)\$/g, (_, m) => {
      try { return katex.renderToString(m, { throwOnError: false }); }
      catch { return `$${m}$`; }
    })
    // ==highlight==
    .replace(/==([^=]+)==/g, "<mark>$1</mark>")
    // **bold**
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // *italic*
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    // HTML escape for remaining < >
    .replace(/(?<!<[^>]*)&(?![^;]+;)/g, "&amp;");
}

export default parseRichContent;
