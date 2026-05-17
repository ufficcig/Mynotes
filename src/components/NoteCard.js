import { useState, useEffect, useRef } from "react";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import katex from "katex";

const COLORS = [
  { bg:"#FFFBF0", border:"#F59E0B", darkBg:"#1a1400" },
  { bg:"#FFF0F3", border:"#F43F5E", darkBg:"#1a000a" },
  { bg:"#F0FDF4", border:"#22C55E", darkBg:"#001408" },
  { bg:"#EFF6FF", border:"#3B82F6", darkBg:"#000d1a" },
  { bg:"#FAF5FF", border:"#A855F7", darkBg:"#0d0019" },
  { bg:"#FFF7ED", border:"#EA580C", darkBg:"#1a0a00" },
];

const SUBJECT_COLORS = {
  "Maths":"#3B82F6","Hindi":"#F59E0B","English":"#22C55E",
  "Physics":"#A855F7","Chemistry":"#F43F5E","Biology":"#10B981",
};

// Quick preview renderer (simplified, no special blocks)
function quickRender(text) {
  if (!text) return "";
  // Remove special syntax markers for preview
  let t = text
    .replace(/^# .+$/gm, m => `<strong style="color:inherit">${m.slice(2)}</strong>`)
    .replace(/^## .+$/gm, m => `<strong>${m.slice(3)}</strong>`)
    .replace(/^### .+$/gm, m => `<em>${m.slice(4)}</em>`)
    .replace(/^- /gm, "▸ ")
    .replace(/:::formula:([^:]+):::/g, (_, math) => {
      try { return katex.renderToString(math, { throwOnError: false }); }
      catch { return math; }
    })
    .replace(/:::def:([^:]+):::/g, "📖 $1")
    .replace(/:::remember:([^:]+):::/g, "⭐ $1")
    .replace(/:::diagram:[^:]+:::/g, "📊 [Diagram]")
    .replace(/!!(?:\w+:)?([^!]+)!!/g, "<mark>$1</mark>")
    .replace(/==([^=]+)==/g, "<mark>$1</mark>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Math inline
  t = t.replace(/\$\$([^$]+)\$\$/g, (_, m) => {
    try { return katex.renderToString(m, { displayMode: true, throwOnError: false }); }
    catch { return m; }
  }).replace(/\$([^$\n]+)\$/g, (_, m) => {
    try { return katex.renderToString(m, { throwOnError: false }); }
    catch { return m; }
  });

  return t.replace(/\n/g, "<br/>");
}

export default function NoteCard({ note, onEdit, onRead, dark }) {
  const [hov, setHov]           = useState(false);
  const [deleting, setDeleting] = useState(false);
  const contentRef = useRef();
  const c = COLORS[note.colorIdx ?? 0];
  const cardBg = dark ? c.darkBg : c.bg;
  const subjectColor = note.subject ? SUBJECT_COLORS[note.subject] : c.border;

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = quickRender(note.content || "");
    }
  }, [note.content]);

  async function handleDelete(e) {
    e.stopPropagation();
    if (!window.confirm("Delete?")) return;
    setDeleting(true);
    try { await deleteDoc(doc(db, "notes", note.id)); }
    catch (err) { console.error(err); setDeleting(false); }
  }

  async function handlePin(e) {
    e.stopPropagation();
    await updateDoc(doc(db, "notes", note.id), { pinned: !note.pinned });
  }

  async function handleStar(e) {
    e.stopPropagation();
    await updateDoc(doc(db, "notes", note.id), { important: !note.important });
  }

  const timeStr = note.updatedAt?.toDate
    ? note.updatedAt.toDate().toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })
    : "—";

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onRead(note)}
      style={{
        background: cardBg,
        border: `2px solid ${hov ? subjectColor : note.important ? "#F59E0B66" : "transparent"}`,
        borderRadius: 20,
        padding: "15px 14px 12px",
        position: "relative",
        boxShadow: note.important
          ? `0 4px 24px ${subjectColor}22, 0 0 0 1px #F59E0B22`
          : hov ? `0 8px 32px ${subjectColor}33` : "var(--shadow)",
        transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
        display: "flex", flexDirection: "column", gap: 8,
        breakInside: "avoid", marginBottom: 14,
        opacity: deleting ? 0.4 : 1,
        animation: "fadeUp 0.3s ease",
        cursor: "pointer",
      }}
    >
      {/* Important badge */}
      {note.important && (
        <div style={{
          position:"absolute", top:-11, left:12,
          background:"linear-gradient(135deg,#F59E0B,#D97706)",
          color:"white", borderRadius:20, padding:"2px 10px",
          fontSize:"0.6rem", fontWeight:900, letterSpacing:0.5,
          boxShadow:"0 2px 8px #F59E0B44",
        }}>⭐ IMPORTANT</div>
      )}

      {/* Pinned badge */}
      {note.pinned && (
        <div style={{
          position:"absolute", top:-11, right:12,
          background:subjectColor, color:"white",
          borderRadius:20, padding:"2px 10px",
          fontSize:"0.6rem", fontWeight:900,
          boxShadow:`0 2px 8px ${subjectColor}44`,
        }}>📌 PINNED</div>
      )}

      {/* Actions */}
      <div style={{
        position:"absolute", top:10, right:10,
        display:"flex", gap:4,
        opacity: hov ? 1 : 0, transition:"opacity 0.15s",
      }}>
        {[
          { icon: note.important ? "⭐" : "☆", fn: handleStar },
          { icon: note.pinned ? "📌" : "🖇", fn: handlePin },
          { icon: "✏️", fn: (e) => { e.stopPropagation(); onEdit(note); } },
          { icon: "🗑", fn: handleDelete, danger: true },
        ].map((b, i) => (
          <button key={i} onClick={b.fn} style={{
            background: b.danger ? "#fee2e2" : dark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.95)",
            border:`1px solid ${b.danger ? "#fca5a5" : dark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`,
            borderRadius:8, padding:"4px 6px",
            cursor:"pointer", fontSize:13, lineHeight:1,
          }}>{b.icon}</button>
        ))}
      </div>

      {/* Badges */}
      {(note.className || note.subject || note.chapter) && (
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", paddingRight:90 }}>
          {note.className && (
            <span style={{ background:dark?"rgba(255,255,255,0.12)":"#1a1a2e", color:"white", borderRadius:20, padding:"2px 8px", fontSize:"0.6rem", fontWeight:800 }}>
              🏫 {note.className}
            </span>
          )}
          {note.subject && (
            <span style={{ background:subjectColor, color:"white", borderRadius:20, padding:"2px 8px", fontSize:"0.6rem", fontWeight:800 }}>
              📚 {note.subject}
            </span>
          )}
          {note.chapter && (
            <span style={{ background:subjectColor+"22", color:subjectColor, border:`1px solid ${subjectColor}44`, borderRadius:20, padding:"2px 8px", fontSize:"0.6rem", fontWeight:800 }}>
              📖 {note.chapter}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      {note.title && (
        <div style={{
          fontFamily:"'Playfair Display',serif",
          fontWeight:700,
          fontSize:"1rem",
          color:subjectColor,
          lineHeight:1.3,
          letterSpacing:-0.2,
        }}>{note.title}</div>
      )}

      {/* Content preview */}
      <div ref={contentRef} style={{
        fontFamily:"'Instrument Serif',serif",
        fontSize:"0.88rem",
        color: dark ? "#b8b4ad" : "#3a3530",
        lineHeight:1.7,
        maxHeight:160, overflow:"hidden",
        maskImage:"linear-gradient(to bottom, black 60%, transparent 100%)",
      }} />

      {/* JSON badge */}
      {note.jsonData && (
        <div style={{
          display:"inline-flex", alignItems:"center", gap:5,
          background:dark?"rgba(255,255,255,0.07)":"rgba(255,255,255,0.9)",
          border:`1px solid ${subjectColor}44`,
          borderRadius:10, padding:"3px 9px",
          fontSize:"0.68rem", fontFamily:"'JetBrains Mono',monospace",
          color:subjectColor, width:"fit-content",
        }}>📋 {note.jsonName || "data.json"}</div>
      )}

      {/* Bottom row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:2 }}>
        <div style={{ fontSize:"0.65rem", color:"var(--muted)", fontFamily:"'JetBrains Mono',monospace" }}>{timeStr}</div>
        <div style={{
          fontSize:"0.62rem", color:subjectColor, fontWeight:800,
          opacity: hov ? 1 : 0, transition:"opacity 0.15s",
          display:"flex", alignItems:"center", gap:3,
        }}>Read <span style={{ fontSize:10 }}>→</span></div>
      </div>
    </div>
  );
}
