// src/components/NoteCard.js
import { useState, useEffect, useRef } from "react";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import katex from "katex";

// ── Render text with KaTeX ──────────────────────────────────────────────────
function renderMath(text) {
  if (!text) return "";
  // Split on $$ (block) and $ (inline)
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
  return parts.map((part, i) => {
    if (part.startsWith("$$") && part.endsWith("$$")) {
      const math = part.slice(2, -2);
      try {
        return `<div class="katex-block">${katex.renderToString(math, { displayMode: true, throwOnError: false })}</div>`;
      } catch { return part; }
    }
    if (part.startsWith("$") && part.endsWith("$")) {
      const math = part.slice(1, -1);
      try {
        return katex.renderToString(math, { displayMode: false, throwOnError: false });
      } catch { return part; }
    }
    // Escape HTML for plain text
    return part.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br/>");
  }).join("");
}

const COLORS = [
  { bg: "#FFFBF0", border: "#F59E0B" },
  { bg: "#FFF0F3", border: "#F43F5E" },
  { bg: "#F0FDF4", border: "#22C55E" },
  { bg: "#EFF6FF", border: "#3B82F6" },
  { bg: "#FAF5FF", border: "#A855F7" },
  { bg: "#FFF7ED", border: "#EA580C" },
];

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
    if (!window.confirm("Ye note delete karna chahte ho?")) return;
    setDeleting(true);
    try { await deleteDoc(doc(db, "notes", note.id)); }
    catch (e) { console.error(e); setDeleting(false); }
  }

  async function handlePin() {
    await updateDoc(doc(db, "notes", note.id), { pinned: !note.pinned });
  }

  const fileIcon = (type) => {
    if (!type) return "📎";
    if (type.startsWith("image/")) return "🖼";
    if (type === "application/pdf") return "📄";
    if (type.includes("json")) return "📋";
    return "📎";
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: c.bg,
        border: `2px solid ${hov ? c.border : "transparent"}`,
        borderRadius: 20,
        padding: "18px",
        position: "relative",
        boxShadow: hov ? `0 8px 32px ${c.border}33` : "var(--shadow)",
        transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        breakInside: "avoid",
        marginBottom: 14,
        opacity: deleting ? 0.4 : 1,
        animation: "fadeUp 0.35s ease",
      }}
    >
      {/* Pin badge */}
      {note.pinned && (
        <div style={{
          position: "absolute", top: -8, right: 14,
          background: c.border, color: "white",
          borderRadius: 20, padding: "2px 8px",
          fontSize: "0.65rem", fontWeight: 800,
          letterSpacing: 0.5,
        }}>📌 PINNED</div>
      )}

      {/* Actions */}
      <div style={{
        position: "absolute", top: 10, right: 10,
        display: "flex", gap: 4,
        opacity: hov ? 1 : 0,
        transition: "opacity 0.15s",
      }}>
        {[
          { icon: note.pinned ? "📌" : "🖇", onClick: handlePin, title: "Pin" },
          { icon: "✏️", onClick: () => onEdit(note), title: "Edit" },
          { icon: "🗑", onClick: handleDelete, title: "Delete", danger: true },
        ].map((btn, i) => (
          <button key={i} onClick={btn.onClick} title={btn.title}
            style={{
              background: btn.danger ? "#fee2e2" : "rgba(255,255,255,0.8)",
              border: "1px solid " + (btn.danger ? "#fca5a5" : "#e5e7eb"),
              borderRadius: 9, padding: "4px 7px",
              cursor: "pointer", fontSize: 14, lineHeight: 1,
              transition: "transform 0.1s",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
            onMouseLeave={e => e.currentTarget.style.transform = ""}
          >{btn.icon}</button>
        ))}
      </div>

      {/* Title */}
      {note.title && (
        <div style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: "1rem",
          color: c.border,
          paddingRight: 70,
          lineHeight: 1.3,
          letterSpacing: -0.3,
        }}>{note.title}</div>
      )}

      {/* Math content */}
      <div
        ref={contentRef}
        style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "0.93rem",
          color: "var(--ink)",
          lineHeight: 1.7,
          maxHeight: 200,
          overflow: "hidden",
          maskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
        }}
      />

      {/* Attachments */}
      {note.attachments?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {note.attachments.map((att, i) => (
            <a key={i} href={att.url} target="_blank" rel="noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(255,255,255,0.8)",
                border: "1px solid " + c.border + "66",
                borderRadius: 10, padding: "4px 10px",
                fontSize: "0.75rem",
                fontFamily: "'JetBrains Mono', monospace",
                color: c.border, textDecoration: "none",
                fontWeight: 500,
                transition: "background 0.15s",
                maxWidth: "100%",
              }}
              onMouseEnter={e => e.currentTarget.style.background = c.border + "22"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.8)"}
            >
              {fileIcon(att.type)} {att.name.length > 20 ? att.name.slice(0,18)+"…" : att.name}
            </a>
          ))}
        </div>
      )}

      {/* Image previews */}
      {note.attachments?.some(a => a.type?.startsWith("image/")) && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {note.attachments.filter(a => a.type?.startsWith("image/")).map((att, i) => (
            <a key={i} href={att.url} target="_blank" rel="noreferrer">
              <img src={att.url} alt={att.name}
                style={{
                  width: 72, height: 72,
                  objectFit: "cover",
                  borderRadius: 10,
                  border: "2px solid " + c.border + "44",
                  transition: "transform 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={e => e.currentTarget.style.transform = ""}
              />
            </a>
          ))}
        </div>
      )}

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {note.tags.map(t => (
            <span key={t} style={{
              background: c.border + "20", color: c.border,
              borderRadius: 20, padding: "2px 10px",
              fontSize: "0.7rem", fontWeight: 700,
              letterSpacing: 0.3,
            }}>#{t}</span>
          ))}
        </div>
      )}

      {/* Date */}
      <div style={{ fontSize: "0.68rem", color: "var(--muted)", fontFamily: "'JetBrains Mono', monospace" }}>
        {new Date(note.updatedAt?.toDate?.() || note.updatedAt).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
        })}
      </div>
    </div>
  );
}
