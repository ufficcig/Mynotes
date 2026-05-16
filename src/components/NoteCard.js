import { useState, useEffect, useRef } from "react";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import katex from "katex";

const COLORS = [
  { bg: "#FFFBF0", border: "#F59E0B" },
  { bg: "#FFF0F3", border: "#F43F5E" },
  { bg: "#F0FDF4", border: "#22C55E" },
  { bg: "#EFF6FF", border: "#3B82F6" },
  { bg: "#FAF5FF", border: "#A855F7" },
  { bg: "#FFF7ED", border: "#EA580C" },
];

function renderMath(text) {
  if (!text) return "";
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
  return parts.map(part => {
    if (part.startsWith("$$") && part.endsWith("$$")) {
      try {
        return `<div style="margin:6px 0;overflow-x:auto">${katex.renderToString(part.slice(2, -2), { displayMode: true, throwOnError: false })}</div>`;
      } catch { return part; }
    }
    if (part.startsWith("$") && part.endsWith("$")) {
      try {
        return katex.renderToString(part.slice(1, -1), { throwOnError: false });
      } catch { return part; }
    }
    return part
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");
  }).join("");
}

export default function NoteCard({ note, onEdit }) {
  const [hov, setHov] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const contentRef = useRef();
  const c = COLORS[note.colorIdx ?? 0];

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = renderMath(note.content || "");
    }
  }, [note.content]);

  async function handleDelete() {
    if (!window.confirm("Note delete karna chahte ho?")) return;
    setDeleting(true);
    try { await deleteDoc(doc(db, "notes", note.id)); }
    catch (e) { console.error(e); setDeleting(false); }
  }

  async function handlePin() {
    await updateDoc(doc(db, "notes", note.id), { pinned: !note.pinned });
  }

  const timeStr = note.updatedAt?.toDate
    ? note.updatedAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: c.bg,
        border: `2px solid ${hov ? c.border : "transparent"}`,
        borderRadius: 20,
        padding: "18px 18px 14px",
        position: "relative",
        boxShadow: hov ? `0 8px 32px ${c.border}33` : "var(--shadow)",
        transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
        display: "flex", flexDirection: "column", gap: 10,
        breakInside: "avoid", marginBottom: 14,
        opacity: deleting ? 0.4 : 1,
        animation: "fadeUp 0.3s ease",
      }}
    >
      {/* Pinned badge */}
      {note.pinned && (
        <div style={{
          position: "absolute", top: -9, right: 14,
          background: c.border, color: "white",
          borderRadius: 20, padding: "2px 10px",
          fontSize: "0.62rem", fontWeight: 900, letterSpacing: 1,
        }}>📌 PINNED</div>
      )}

      {/* Action buttons */}
      <div style={{
        position: "absolute", top: 10, right: 10,
        display: "flex", gap: 4,
        opacity: hov ? 1 : 0, transition: "opacity 0.15s",
      }}>
        {[
          { icon: note.pinned ? "📌" : "🖇", fn: handlePin, title: "Pin" },
          { icon: "✏️", fn: () => onEdit(note), title: "Edit" },
          { icon: "🗑", fn: handleDelete, title: "Delete", danger: true },
        ].map((b, i) => (
          <button key={i} onClick={b.fn} title={b.title} style={{
            background: b.danger ? "#fee2e2" : "rgba(255,255,255,0.85)",
            border: `1px solid ${b.danger ? "#fca5a5" : "#e5e7eb"}`,
            borderRadius: 9, padding: "4px 7px",
            cursor: "pointer", fontSize: 14, lineHeight: 1,
            transition: "transform 0.1s",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
            onMouseLeave={e => e.currentTarget.style.transform = ""}
          >{b.icon}</button>
        ))}
      </div>

      {/* Title */}
      {note.title && (
        <div style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: "1rem", color: c.border,
          paddingRight: 80, lineHeight: 1.3, letterSpacing: -0.3,
        }}>{note.title}</div>
      )}

      {/* Math content */}
      <div ref={contentRef} style={{
        fontFamily: "'Instrument Serif', serif",
        fontSize: "0.93rem", color: "var(--ink)",
        lineHeight: 1.75, maxHeight: 220, overflow: "hidden",
        maskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
      }} />

      {/* JSON attachment badge */}
      {note.jsonData && (
        <div
          onClick={() => onEdit(note)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.8)",
            border: `1px solid ${c.border}66`,
            borderRadius: 10, padding: "5px 10px",
            fontSize: "0.74rem",
            fontFamily: "'JetBrains Mono', monospace",
            color: c.border, cursor: "pointer",
            fontWeight: 500, width: "fit-content",
          }}
        >
          📋 {note.jsonName || "data.json"} · {(note.jsonData.length / 1024).toFixed(1)} KB
        </div>
      )}

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {note.tags.map(t => (
            <span key={t} style={{
              background: c.border + "20", color: c.border,
              borderRadius: 20, padding: "2px 10px",
              fontSize: "0.7rem", fontWeight: 700, letterSpacing: 0.3,
            }}>#{t}</span>
          ))}
        </div>
      )}

      {/* Date */}
      <div style={{
        fontSize: "0.68rem", color: "var(--muted)",
        fontFamily: "'JetBrains Mono', monospace",
      }}>{timeStr}</div>
    </div>
  );
}
