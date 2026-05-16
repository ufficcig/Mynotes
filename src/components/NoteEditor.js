import { useState, useRef, useEffect } from "react";
import { addDoc, updateDoc, doc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import katex from "katex";

const CLASSES = ["Class 9", "Class 10", "Class 11", "Class 12"];
const SUBJECTS = ["Maths", "Hindi", "English", "Physics", "Chemistry", "Biology"];

const COLORS = [
  { bg: "#FFFBF0", border: "#F59E0B", name: "Amber" },
  { bg: "#FFF0F3", border: "#F43F5E", name: "Rose" },
  { bg: "#F0FDF4", border: "#22C55E", name: "Mint" },
  { bg: "#EFF6FF", border: "#3B82F6", name: "Sky" },
  { bg: "#FAF5FF", border: "#A855F7", name: "Violet" },
  { bg: "#FFF7ED", border: "#EA580C", name: "Coral" },
];

const SUBJECT_COLORS = {
  "Maths":     "#3B82F6",
  "Hindi":     "#F59E0B",
  "English":   "#22C55E",
  "Physics":   "#A855F7",
  "Chemistry": "#F43F5E",
  "Biology":   "#10B981",
};

function MathPreview({ text }) {
  const ref = useRef();
  useEffect(() => {
    if (!ref.current || !text) return;
    const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
    ref.current.innerHTML = parts.map(part => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        try { return `<div style="margin:8px 0;overflow-x:auto">${katex.renderToString(part.slice(2, -2), { displayMode: true, throwOnError: false })}</div>`; }
        catch { return part; }
      }
      if (part.startsWith("$") && part.endsWith("$")) {
        try { return katex.renderToString(part.slice(1, -1), { throwOnError: false }); }
        catch { return part; }
      }
      return part.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br/>");
    }).join("");
  }, [text]);
  return <div ref={ref} style={{ lineHeight: 1.9, fontFamily: "'Instrument Serif', serif", fontSize: "1rem" }} />;
}

export default function NoteEditor({ note, user, onClose }) {
  const [title, setTitle]         = useState(note?.title   || "");
  const [content, setContent]     = useState(note?.content || "");
  const [colorIdx, setColorIdx]   = useState(note?.colorIdx ?? 0);
  const [tab, setTab]             = useState("write");
  const [selectedClass, setSelectedClass] = useState(note?.className || "");
  const [selectedSubject, setSelectedSubject] = useState(note?.subject || "");
  const [jsonData, setJsonData]   = useState(note?.jsonData || null);
  const [jsonName, setJsonName]   = useState(note?.jsonName || "");
  const [jsonError, setJsonError] = useState("");
  const [jsonViewMode, setJsonViewMode] = useState("pretty");
  const [saving, setSaving]       = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const fileInputRef = useRef();
  const textRef = useRef();
  const c = COLORS[colorIdx];

  useEffect(() => { if (tab === "write") textRef.current?.focus(); }, [tab]);

  function handleJsonFile(file) {
    if (!file) return;
    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      setJsonError("Sirf .json file allowed hai!"); return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        JSON.parse(e.target.result);
        setJsonData(e.target.result); setJsonName(file.name); setJsonError("");
      } catch { setJsonError("Invalid JSON file!"); }
    };
    reader.readAsText(file);
  }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    handleJsonFile(e.dataTransfer.files[0]);
  }

  function handlePasteJson(text) {
    try {
      JSON.parse(text);
      setJsonData(text); setJsonName("pasted.json"); setJsonError("");
    } catch { setJsonError("Invalid JSON!"); }
  }

  function prettyJson() {
    try { return JSON.stringify(JSON.parse(jsonData), null, 2); }
    catch { return jsonData; }
  }

  async function handleSave() {
    if (!content.trim() && !title.trim()) return;
    setSaving(true);
    try {
      const data = {
        title, content, colorIdx,
        className: selectedClass,
        subject: selectedSubject,
        jsonData: jsonData || null,
        jsonName: jsonName || null,
        uid: user.uid,
        updatedAt: serverTimestamp(),
        pinned: note?.pinned || false,
      };
      if (note) {
        await updateDoc(doc(db, "notes", note.id), data);
      } else {
        await addDoc(collection(db, "notes"), { ...data, createdAt: serverTimestamp() });
      }
      onClose();
    } catch (e) {
      alert("Save mein error: " + e.message);
      setSaving(false);
    }
  }

  const tabStyle = (active) => ({
    padding: "7px 14px",
    background: active ? "var(--ink)" : "transparent",
    color: active ? "white" : "var(--muted)",
    border: `1.5px solid ${active ? "var(--ink)" : "var(--border)"}`,
    borderRadius: 10, fontFamily: "'Syne', sans-serif",
    fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", transition: "all 0.15s",
  });

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(26,26,46,0.65)",
      backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: c.bg, borderRadius: 28,
        width: "100%", maxWidth: 560,
        maxHeight: "93vh", overflowY: "auto",
        boxShadow: `0 20px 60px ${c.border}44`,
        border: `2px solid ${c.border}66`,
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "1.3rem", fontWeight: 400, color: c.border }}>
            {note ? "Edit Note" : "Naya Note"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 24, color: "var(--muted)" }}>×</button>
        </div>

        <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Title */}
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title..."
            style={{
              border: `1.5px solid ${c.border}55`, borderRadius: 14, padding: "10px 14px",
              fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1rem",
              background: "rgba(255,255,255,0.7)", outline: "none", color: "var(--ink)",
            }}
          />

          {/* Class selector */}
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--muted)", marginBottom: 6, letterSpacing: 0.5 }}>🏫 CLASS SELECT KARO</div>
            <div style={{ display: "flex", gap: 8 }}>
              {CLASSES.map(cls => (
                <button key={cls} onClick={() => setSelectedClass(selectedClass === cls ? "" : cls)} style={{
                  flex: 1,
                  background: selectedClass === cls ? "var(--ink)" : "rgba(255,255,255,0.6)",
                  color: selectedClass === cls ? "white" : "var(--ink)",
                  border: `1.5px solid ${selectedClass === cls ? "var(--ink)" : "var(--border)"}`,
                  borderRadius: 12, padding: "9px",
                  fontFamily: "'Syne', sans-serif", fontWeight: 800,
                  fontSize: "0.88rem", cursor: "pointer", transition: "all 0.15s",
                }}>{cls}</button>
              ))}
            </div>
          </div>

          {/* Subject selector */}
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--muted)", marginBottom: 6, letterSpacing: 0.5 }}>📚 SUBJECT SELECT KARO</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {SUBJECTS.map(sub => {
                const subColor = SUBJECT_COLORS[sub];
                const active = selectedSubject === sub;
                return (
                  <button key={sub} onClick={() => setSelectedSubject(active ? "" : sub)} style={{
                    background: active ? subColor : "rgba(255,255,255,0.6)",
                    color: active ? "white" : subColor,
                    border: `1.5px solid ${subColor}`,
                    borderRadius: 20, padding: "6px 16px",
                    fontFamily: "'Syne', sans-serif", fontWeight: 800,
                    fontSize: "0.82rem", cursor: "pointer", transition: "all 0.15s",
                  }}>{sub}</button>
                );
              })}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[["write","✍️ Write"], ["preview","👁 Preview"], ["json","📋 JSON"]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={tabStyle(tab === id)}>
                {label}
                {id === "json" && jsonData && (
                  <span style={{ marginLeft: 5, background: c.border, color: "white", borderRadius: 20, padding: "0 6px", fontSize: "0.68rem" }}>✓</span>
                )}
              </button>
            ))}
          </div>

          {/* Write Tab */}
          {tab === "write" && (
            <>
              <textarea ref={textRef} value={content} onChange={e => setContent(e.target.value)}
                placeholder={"Yahan likho...\nInline math: $x^2$\nBlock math: $$\\frac{a}{b}$$"}
                rows={9} style={{
                  border: `1.5px solid ${c.border}55`, borderRadius: 14, padding: "12px 14px",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "0.88rem",
                  background: "rgba(255,255,255,0.7)", outline: "none",
                  resize: "vertical", color: "var(--ink)", lineHeight: 1.7,
                }}
              />
              <div style={{
                background: "rgba(255,255,255,0.5)", border: `1px dashed ${c.border}55`,
                borderRadius: 12, padding: "9px 14px",
                fontSize: "0.73rem", color: "var(--muted)",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                💡 Inline: <code>$formula$</code> · Block: <code>$$formula$$</code>
              </div>
            </>
          )}

          {/* Preview Tab */}
          {tab === "preview" && (
            <div style={{
              minHeight: 160, border: `1.5px solid ${c.border}44`,
              borderRadius: 14, padding: "14px 16px",
              background: "rgba(255,255,255,0.8)",
            }}>
              {(content || title)
                ? <MathPreview text={content || title} />
                : <span style={{ color: "var(--muted)", fontStyle: "italic" }}>Kuch likho pehle...</span>
              }
            </div>
          )}

          {/* JSON Tab */}
          {tab === "json" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {!jsonData ? (
                <>
                  <div onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragOver ? c.border : c.border + "66"}`,
                      borderRadius: 16, padding: "32px 20px", textAlign: "center", cursor: "pointer",
                      background: dragOver ? c.border + "11" : "rgba(255,255,255,0.5)",
                    }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                    <div style={{ fontWeight: 800, color: c.border }}>JSON file drag karo ya click karo</div>
                    <input ref={fileInputRef} type="file" accept=".json" onChange={e => handleJsonFile(e.target.files[0])} style={{ display: "none" }} />
                  </div>
                  <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.8rem", fontWeight: 700 }}>— YA —</div>
                  <textarea placeholder="JSON paste karo..." rows={4}
                    onChange={e => { if (e.target.value.trim()) handlePasteJson(e.target.value.trim()); }}
                    style={{ border: `1.5px solid ${c.border}55`, borderRadius: 14, padding: "11px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem", background: "rgba(255,255,255,0.7)", outline: "none", resize: "vertical" }}
                  />
                  {jsonError && <div style={{ background: "#fee2e2", borderRadius: 10, padding: "9px 14px", fontSize: "0.8rem", color: "#dc2626", fontWeight: 700 }}>⚠️ {jsonError}</div>}
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.8)", border: `1px solid ${c.border}55`, borderRadius: 12, padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 22 }}>📋</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "0.85rem" }}>{jsonName}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{(jsonData.length / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <button onClick={() => { setJsonData(null); setJsonName(""); }} style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "5px 9px", cursor: "pointer", fontSize: 13 }}>🗑</button>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["pretty","raw"].map(m => (
                      <button key={m} onClick={() => setJsonViewMode(m)} style={{ padding: "4px 12px", background: jsonViewMode === m ? c.border : "rgba(255,255,255,0.5)", color: jsonViewMode === m ? "white" : c.border, border: `1px solid ${c.border}`, borderRadius: 8, fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                        {m === "pretty" ? "🎨 Pretty" : "📄 Raw"}
                      </button>
                    ))}
                  </div>
                  <pre style={{ background: "rgba(26,26,46,0.04)", border: `1px solid ${c.border}44`, borderRadius: 12, padding: "12px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", maxHeight: 200, overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                    {jsonViewMode === "pretty" ? prettyJson() : jsonData}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Color picker */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 700 }}>Rang:</span>
            {COLORS.map((col, i) => (
              <button key={i} onClick={() => setColorIdx(i)} style={{
                width: 24, height: 24, borderRadius: "50%", background: col.bg,
                border: i === colorIdx ? `3px solid ${col.border}` : `2px solid ${col.border}88`,
                cursor: "pointer", transform: i === colorIdx ? "scale(1.3)" : "scale(1)",
                transition: "transform 0.15s",
              }} />
            ))}
          </div>

          {/* Save */}
          <button onClick={handleSave} disabled={saving} style={{
            background: saving ? "var(--muted)" : `linear-gradient(135deg, ${c.border}, ${c.border}bb)`,
            color: "white", border: "none", borderRadius: 14, padding: "13px",
            fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "0.97rem",
            cursor: saving ? "not-allowed" : "pointer",
            boxShadow: `0 4px 20px ${c.border}44`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {saving ? <><span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span> Saving...</> : "💾 Save Karo"}
          </button>
        </div>
      </div>
    </div>
  );
}
