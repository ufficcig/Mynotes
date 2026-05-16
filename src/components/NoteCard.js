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

const SUBJECT_COLORS = {
  "Maths":     "#3B82F6",
  "Hindi":     "#F59E0B",
  "English":   "#22C55E",
  "Physics":   "#A855F7",
  "Chemistry": "#F43F5E",
  "Biology":   "#10B981",
};

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
      try { return katex.renderToString(part.slice(1, -1), { throwOnError: false }); }
      catch { return part; }
    }
    return part
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");
  }).join("");
}

export default function NoteCard({ note, onEdit, onRead }) {
  const [hov, setHov] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const contentRef = useRef();
  const c = COLORS[note.colorIdx ?? 0];
  const subjectColor = note.subject ? SUBJECT_COLORS[note.subject] : c.border;

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = renderMath(note.content || "");
    }
  }, [note.content]);

  async function handleDelete(e) {
    e.stopPropagation();
    if (!window.confirm("Note delete karna chahte ho?")) return;
    setDeleting(true);
    try { await deleteDoc(doc(db, "notes", note.id)); }
    catch (e) { console.error(e); setDeleting(false); }
  }

  async function handlePin(e) {
    e.stopPropagation();
    await updateDoc(doc(db, "notes", note.id), { pinned: !note.pinned });
  }

  const timeStr = note.updatedAt?.toDate
    ? note.updatedAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onRead(note)}
      style={{
        background: c.bg,
        border: `2px solid ${hov ? subjectColor : "transparent"}`,
        borderRadius: 20,
        padding: "16px 16px 12px",
        position: "relative",
        boxShadow: hov ? `0 8px 32px ${subjectColor}33` : "var(--shadow)",
        transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
        display: "flex", flexDirection: "column", gap: 9,
        breakInside: "avoid", marginBottom: 14,
        opacity: deleting ? 0.4 : 1,
        animation: "fadeUp 0.3s ease",
        cursor: "pointer",
      }}
    >
      {/* Pinned badge */}
      {note.pinned && (
        <div style={{
          position: "absolute", top: -9, right: 14,
          background: subjectColor, color: "white",
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
          { icon: "✏️", fn: (e) => { e.stopPropagation(); onEdit(note); }, title: "Edit" },
          { icon: "🗑", fn: handleDelete, title: "Delete", danger: true },
        ].map((b, i) => (
          <button key={i} onClick={b.fn} title={b.title} style={{
            background: b.danger ? "#fee2e2" : "rgba(255,255,255,0.9)",
            border: `1px solid ${b.danger ? "#fca5a5" : "#e5e7eb"}`,
            borderRadius: 9, padding: "4px 7px",
            cursor: "pointer", fontSize: 14, lineHeight: 1,
          }}>{b.icon}</button>
        ))}
      </div>

      {/* Class + Subject badges */}
      {(note.className || note.subject) && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", paddingRight: 70 }}>
          {note.className && (
            <span style={{
              background: "var(--ink)", color: "white",
              borderRadius: 20, padding: "2px 9px",
              fontSize: "0.65rem", fontWeight: 800,
            }}>🏫 {note.className}</span>
          )}
          {note.subject && (
            <span style={{
              background: subjectColor, color: "white",
              borderRadius: 20, padding: "2px 9px",
              fontSize: "0.65rem", fontWeight: 800,
            }}>📚 {note.subject}</span>
          )}
        </div>
      )}

      {/* Title */}
      {note.title && (
        <div style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: "0.97rem", color: subjectColor,
          paddingRight: note.className || note.subject ? 0 : 80,
          lineHeight: 1.3, letterSpacing: -0.3,
        }}>{note.title}</div>
      )}

      {/* Math content preview */}
      <div ref={contentRef} style={{
        fontFamily: "'Instrument Serif', serif",
        fontSize: "0.9rem", color: "var(--ink)",
        lineHeight: 1.7, maxHeight: 180, overflow: "hidden",
        maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
      }} />

      {/* JSON badge */}
      {note.jsonData && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: "rgba(255,255,255,0.8)",
          border: `1px solid ${subjectColor}55`,
          borderRadius: 10, padding: "4px 10px",
          fontSize: "0.72rem", fontFamily: "'JetBrains Mono', monospace",
          color: subjectColor, fontWeight: 500, width: "fit-content",
        }}>
          📋 {note.jsonName || "data.json"}
        </div>
      )}

      {/* Date + read hint */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "0.68rem", color: "var(--muted)", fontFamily: "'JetBrains Mono', monospace" }}>
          {timeStr}
        </div>
        <div style={{ fontSize: "0.65rem", color: subjectColor, fontWeight: 700, opacity: hov ? 1 : 0, transition: "opacity 0.15s" }}>
          Tap to read →
        </div>
      </div>
    </div>
  );
}
