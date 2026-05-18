import { useEffect, useRef } from "react";
import parseRichContent from "../richContent";

// ── Print/PDF styles ──────────────────────────────────────────────────────────
const PRINT_STYLE = `
@media print {
  body > *:not(#print-area) { display: none !important; }
  #print-area {
    display: block !important;
    position: fixed; inset: 0;
    background: white; color: #1a1a2e;
    padding: 32px 40px; overflow: auto;
    font-family: 'Instrument Serif', serif;
    font-size: 13pt; line-height: 1.9;
    z-index: 99999;
  }
  #print-area h1 { font-family: 'Playfair Display', serif; font-size: 22pt; font-weight: 700; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 2px solid currentColor; }
  #print-area .h1 { font-size: 16pt; font-weight: 700; margin: 18px 0 8px; font-family: 'Playfair Display', serif; }
  #print-area .h2 { font-size: 13pt; font-weight: 800; margin: 14px 0 6px; font-family: 'Syne', sans-serif; }
  #print-area .h2::before { content: ''; display: inline-block; width: 4px; height: 16px; background: currentColor; margin-right: 8px; border-radius: 4px; vertical-align: middle; }
  #print-area .h3 { font-size: 10pt; font-weight: 700; text-transform: uppercase; color: #888; margin: 10px 0 4px; letter-spacing: 0.5px; }
  #print-area .bullet { display: flex; gap: 8px; margin: 4px 0; }
  #print-area .bullet::before { content: '▸'; flex-shrink: 0; }
  #print-area .formula-card { background: #1a1a2e !important; color: white !important; border-radius: 12px; padding: 14px 18px; margin: 12px 0; break-inside: avoid; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  #print-area .formula-label { font-size: 8pt; font-family: 'Syne', sans-serif; font-weight: 800; color: #60A5FA !important; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px; }
  #print-area .def-box { border-left: 4px solid #8B5CF6; padding: 10px 14px; margin: 10px 0; background: #F5F3FF !important; border-radius: 0 10px 10px 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  #print-area .remember-box { border-left: 4px solid #F59E0B; padding: 10px 14px; margin: 10px 0; background: #FFFBEB !important; border-radius: 0 10px 10px 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  #print-area .hl-yellow { background: #FFF3C4 !important; border-left: 4px solid #F59E0B; padding: 8px 12px; margin: 6px 0; border-radius: 0 8px 8px 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  #print-area .hl-green  { background: #D1FAE5 !important; border-left: 4px solid #10B981; padding: 8px 12px; margin: 6px 0; border-radius: 0 8px 8px 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  #print-area .hl-blue   { background: #DBEAFE !important; border-left: 4px solid #3B82F6; padding: 8px 12px; margin: 6px 0; border-radius: 0 8px 8px 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  #print-area .hl-red    { background: #FEE2E2 !important; border-left: 4px solid #EF4444; padding: 8px 12px; margin: 6px 0; border-radius: 0 8px 8px 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  #print-area .diagram-box { border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 14px; margin: 12px 0; text-align: center; break-inside: avoid; }
  #print-area mark { background: #FEF08A !important; padding: 1px 4px; border-radius: 3px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  #print-area .katex-display { margin: 10px 0; overflow-x: auto; }
  .print-meta { font-family: 'Syne', sans-serif; font-size: 9pt; color: #666; margin-bottom: 20px; display: flex; gap: 8px; flex-wrap: wrap; }
  .print-meta span { border: 1px solid #e5e7eb; padding: 2px 10px; border-radius: 20px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @page { margin: 18mm; size: A4; }
}
`;

function injectPrintStyle() {
  if (document.getElementById("mynotes-print-style")) return;
  const s = document.createElement("style");
  s.id = "mynotes-print-style";
  s.textContent = PRINT_STYLE;
  document.head.appendChild(s);
}

function printNote(note, contentHTML, subjectColor) {
  injectPrintStyle();
  let el = document.getElementById("print-area");
  if (!el) {
    el = document.createElement("div");
    el.id = "print-area";
    el.style.display = "none";
    document.body.appendChild(el);
  }
  const timeStr = note.updatedAt?.toDate
    ? note.updatedAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";
  el.innerHTML = `
    <div class="print-meta">
      ${note.className ? `<span>🏫 ${note.className}</span>` : ""}
      ${note.subject  ? `<span style="background:${subjectColor}22;color:${subjectColor};border-color:${subjectColor}44">📚 ${note.subject}</span>` : ""}
      ${note.chapter  ? `<span>📖 ${note.chapter}</span>` : ""}
      ${note.important ? `<span style="background:#FFF7ED;color:#D97706;border-color:#F59E0B44">⭐ Important</span>` : ""}
      ${timeStr ? `<span>📅 ${timeStr}</span>` : ""}
    </div>
    ${note.title ? `<h1 style="color:${subjectColor}">${note.title}</h1>` : ""}
    <div class="rich-content" style="--subject-color:${subjectColor}">${contentHTML}</div>
  `;
  window.print();
}

const SUBJECT_COLORS = {
  "Maths":     "#3B82F6",
  "Hindi":     "#F59E0B",
  "English":   "#22C55E",
  "Physics":   "#A855F7",
  "Chemistry": "#F43F5E",
  "Biology":   "#10B981",
};

const COLORS = [
  { bg: "#FFFBF0", border: "#F59E0B" },
  { bg: "#FFF0F3", border: "#F43F5E" },
  { bg: "#F0FDF4", border: "#22C55E" },
  { bg: "#EFF6FF", border: "#3B82F6" },
  { bg: "#FAF5FF", border: "#A855F7" },
  { bg: "#FFF7ED", border: "#EA580C" },
];

export default function ReadMode({ note, onClose, onEdit, dark }) {
  const contentRef = useRef();
  const c = COLORS[note.colorIdx ?? 0];
  const subjectColor = note.subject ? SUBJECT_COLORS[note.subject] : c.border;

  const bgColor    = dark ? "#0f0f1a" : "white";
  const textColor  = dark ? "#e8e4dd" : "#1a1a2e";
  const borderClr  = dark ? "#2a2a3e" : "#f0ede8";

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = parseRichContent(note.content || "", subjectColor);
    }
  }, [note.content, subjectColor]);

  useEffect(() => {
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const timeStr = note.updatedAt?.toDate
    ? note.updatedAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: bgColor,
        borderRadius: 24, width: "100%", maxWidth: 680,
        maxHeight: "93vh", display: "flex", flexDirection: "column",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        overflow: "hidden", animation: "fadeUp 0.25s ease",
        border: `1.5px solid ${borderClr}`,
      }}>
        {/* Top bar */}
        <div style={{
          padding: "12px 18px",
          borderBottom: `1.5px solid ${borderClr}`,
          display: "flex", alignItems: "center", gap: 8,
          background: bgColor, position: "sticky", top: 0, zIndex: 10,
          flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {note.important && <span style={{ background:"#FFF7ED", color:"#F59E0B", border:"1px solid #F59E0B44", borderRadius:20, padding:"3px 10px", fontSize:"0.68rem", fontWeight:800 }}>⭐ Important</span>}
            {note.className && <span style={{ background: dark ? "rgba(255,255,255,0.1)" : "#1a1a2e", color:"white", borderRadius:20, padding:"3px 10px", fontSize:"0.68rem", fontWeight:800 }}>🏫 {note.className}</span>}
            {note.subject  && <span style={{ background:subjectColor, color:"white", borderRadius:20, padding:"3px 10px", fontSize:"0.68rem", fontWeight:800 }}>📚 {note.subject}</span>}
            {note.chapter  && <span style={{ background:subjectColor+"22", color:subjectColor, border:`1px solid ${subjectColor}44`, borderRadius:20, padding:"3px 10px", fontSize:"0.68rem", fontWeight:800 }}>📖 {note.chapter}</span>}
          </div>
          <button onClick={() => { onClose(); onEdit(note); }} style={{
            background: dark ? "rgba(255,255,255,0.1)" : "#1a1a2e", color:"white",
            border:"none", borderRadius:10, padding:"7px 14px",
            fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"0.78rem", cursor:"pointer",
          }}>✏️ Edit</button>
          <button onClick={() => printNote(note, contentRef.current?.innerHTML || "", subjectColor)} style={{
            background: subjectColor, color:"white",
            border:"none", borderRadius:10, padding:"7px 14px",
            fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"0.78rem", cursor:"pointer",
          }}>📄 PDF</button>
          <button onClick={onClose} style={{
            background: dark ? "rgba(255,255,255,0.08)" : "#f5f5f5",
            border:"none", borderRadius:10, padding:"7px 12px",
            cursor:"pointer", fontSize:18, color:"var(--muted)", lineHeight:1,
          }}>×</button>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px 36px", color:textColor }}>

          {/* Title */}
          {note.title && (
            <h1 style={{
              fontFamily:"'Playfair Display',serif",
              fontSize:"clamp(1.5rem,4vw,2rem)",
              fontWeight:700, color:subjectColor,
              marginBottom:20, lineHeight:1.25,
              borderBottom:`3px solid ${subjectColor}22`,
              paddingBottom:14,
            }}>{note.title}</h1>
          )}

          {/* Rich rendered content */}
          <div ref={contentRef} />

          {/* JSON */}
          {note.jsonData && (
            <div style={{ marginTop:28 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <span style={{ fontSize:18 }}>📋</span>
                <span style={{ fontWeight:800, fontSize:"0.88rem" }}>{note.jsonName || "data.json"}</span>
                <span style={{ fontSize:"0.72rem", color:"var(--muted)" }}>· {(note.jsonData.length/1024).toFixed(1)} KB</span>
              </div>
              <pre style={{
                background: dark ? "rgba(255,255,255,0.04)" : "#f8f7f5",
                border:`1.5px solid ${borderClr}`, borderRadius:14,
                padding:"14px 16px", fontFamily:"'JetBrains Mono',monospace",
                fontSize:"0.8rem", color:textColor, overflowX:"auto",
                lineHeight:1.6, whiteSpace:"pre-wrap", wordBreak:"break-all",
                maxHeight:260, overflowY:"auto",
              }}>
                {(() => { try { return JSON.stringify(JSON.parse(note.jsonData),null,2); } catch { return note.jsonData; } })()}
              </pre>
            </div>
          )}

          {timeStr && (
            <div style={{ marginTop:28, paddingTop:12, borderTop:`1px solid ${borderClr}`, fontSize:"0.72rem", color:"var(--muted)", fontFamily:"'JetBrains Mono',monospace" }}>
              📅 {timeStr}
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
