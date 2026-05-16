import { useEffect, useRef } from "react";
import katex from "katex";

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

function renderMath(text) {
  if (!text) return "";
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
  return parts.map(part => {
    if (part.startsWith("$$") && part.endsWith("$$")) {
      try {
        return `<div style="margin:12px 0;overflow-x:auto;text-align:center">${katex.renderToString(part.slice(2, -2), { displayMode: true, throwOnError: false })}</div>`;
      } catch { return part; }
    }
    if (part.startsWith("$") && part.endsWith("$")) {
      try { return katex.renderToString(part.slice(1, -1), { throwOnError: false }); }
      catch { return part; }
    }
    return part
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\n\n/g, "</p><p style='margin:12px 0'>")
      .replace(/\n/g, "<br/>");
  }).join("");
}

export default function ReadMode({ note, onClose, onEdit }) {
  const contentRef = useRef();
  const c = COLORS[note.colorIdx ?? 0];
  const subjectColor = note.subject ? SUBJECT_COLORS[note.subject] : c.border;

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = `<p style="margin:0">${renderMath(note.content || "")}</p>`;
    }
  }, [note.content]);

  // Close on Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const timeStr = note.updatedAt?.toDate
    ? note.updatedAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(26,26,46,0.7)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "16px",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "white",
        borderRadius: 24,
        width: "100%", maxWidth: 640,
        maxHeight: "93vh",
        display: "flex", flexDirection: "column",
        boxShadow: "0 24px 64px rgba(26,26,46,0.3)",
        overflow: "hidden",
        animation: "fadeUp 0.25s ease",
      }}>
        {/* Top bar */}
        <div style={{
          padding: "14px 20px",
          borderBottom: "1.5px solid #f0ede8",
          display: "flex", alignItems: "center", gap: 10,
          background: "white",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          {/* Class + Subject badges */}
          <div style={{ flex: 1, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {note.className && (
              <span style={{
                background: "var(--ink)", color: "white",
                borderRadius: 20, padding: "3px 12px",
                fontSize: "0.72rem", fontWeight: 800, letterSpacing: 0.3,
              }}>🏫 {note.className}</span>
            )}
            {note.subject && (
              <span style={{
                background: subjectColor, color: "white",
                borderRadius: 20, padding: "3px 12px",
                fontSize: "0.72rem", fontWeight: 800, letterSpacing: 0.3,
              }}>📚 {note.subject}</span>
            )}
            {note.pinned && (
              <span style={{
                background: "#FFF7ED", color: "#EA580C",
                border: "1px solid #EA580C44",
                borderRadius: 20, padding: "3px 10px",
                fontSize: "0.72rem", fontWeight: 800,
              }}>📌 Pinned</span>
            )}
          </div>

          {/* Buttons */}
          <button onClick={() => { onClose(); onEdit(note); }} style={{
            background: "var(--ink)", color: "white",
            border: "none", borderRadius: 10,
            padding: "7px 14px",
            fontFamily: "'Syne', sans-serif", fontWeight: 700,
            fontSize: "0.8rem", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
          }}>✏️ Edit</button>
          <button onClick={onClose} style={{
            background: "#f5f5f5", border: "none", borderRadius: 10,
            padding: "7px 12px", cursor: "pointer",
            fontSize: 18, color: "var(--muted)", lineHeight: 1,
          }}>×</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px 40px" }}>
          {/* Title */}
          {note.title && (
            <h1 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(1.4rem, 4vw, 2rem)",
              fontWeight: 400, color: subjectColor,
              marginBottom: 20, lineHeight: 1.3,
              borderBottom: `2px solid ${subjectColor}22`,
              paddingBottom: 14,
            }}>{note.title}</h1>
          )}

          {/* Math rendered content */}
          <div ref={contentRef} style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "1.05rem",
            color: "#1a1a2e",
            lineHeight: 1.9,
            letterSpacing: 0.1,
          }} />

          {/* JSON section */}
          {note.jsonData && (
            <div style={{ marginTop: 28 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                marginBottom: 10,
              }}>
                <span style={{ fontSize: 18 }}>📋</span>
                <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "var(--ink)" }}>{note.jsonName || "data.json"}</span>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>· {(note.jsonData.length / 1024).toFixed(1)} KB</span>
              </div>
              <pre style={{
                background: "#f8f7f5",
                border: "1.5px solid #e8e4dd",
                borderRadius: 14, padding: "14px 16px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.8rem", color: "#1a1a2e",
                overflowX: "auto", lineHeight: 1.6,
                whiteSpace: "pre-wrap", wordBreak: "break-all",
                maxHeight: 300, overflowY: "auto",
              }}>
                {(() => { try { return JSON.stringify(JSON.parse(note.jsonData), null, 2); } catch { return note.jsonData; } })()}
              </pre>
            </div>
          )}

          {/* Date */}
          {timeStr && (
            <div style={{
              marginTop: 32, paddingTop: 16,
              borderTop: "1px solid #f0ede8",
              fontSize: "0.75rem", color: "var(--muted)",
              fontFamily: "'JetBrains Mono', monospace",
            }}>📅 {timeStr}</div>
          )}
        </div>
      </div>
    </div>
  );
}
