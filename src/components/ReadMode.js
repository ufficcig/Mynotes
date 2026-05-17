import { useEffect, useRef } from "react";
import parseRichContent from "../richContent";

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

        {/* Syntax hint */}
        <div style={{
          padding:"10px 18px",
          borderTop:`1px solid ${borderClr}`,
          background: dark ? "rgba(255,255,255,0.02)" : "#fafaf8",
          display:"flex", gap:12, flexWrap:"wrap",
          fontSize:"0.65rem", color:"var(--muted)",
          fontFamily:"'JetBrains Mono',monospace",
        }}>
          <span># Title</span>
          <span>## Heading</span>
          <span>!!highlight!!</span>
          <span>:::formula:\frac{{a}}{{b}}:::</span>
          <span>:::def:text:::</span>
          <span>:::diagram:concave-mirror:::</span>
          <span>==mark==</span>
        </div>
      </div>
    </div>
  );
}
