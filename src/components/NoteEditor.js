// src/components/NoteEditor.js
import { useState, useRef, useEffect } from "react";
import { addDoc, updateDoc, doc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import katex from "katex";

const TAGS_LIST = ["Personal", "Work", "Maths", "Physics", "Chemistry", "Ideas", "Todo", "Important"];

const COLORS = [
  { bg: "#FFFBF0", border: "#F59E0B", name: "Amber" },
  { bg: "#FFF0F3", border: "#F43F5E", name: "Rose" },
  { bg: "#F0FDF4", border: "#22C55E", name: "Mint" },
  { bg: "#EFF6FF", border: "#3B82F6", name: "Sky" },
  { bg: "#FAF5FF", border: "#A855F7", name: "Violet" },
  { bg: "#FFF7ED", border: "#EA580C", name: "Coral" },
];

function MathPreview({ text }) {
  const ref = useRef();
  useEffect(() => {
    if (!ref.current) return;
    const parts = (text || "").split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
    ref.current.innerHTML = parts.map(part => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        try { return `<div style="margin:8px 0">${katex.renderToString(part.slice(2,-2), { displayMode: true, throwOnError: false })}</div>`; }
        catch { return part; }
      }
      if (part.startsWith("$") && part.endsWith("$")) {
        try { return katex.renderToString(part.slice(1,-1), { throwOnError: false }); }
        catch { return part; }
      }
      return part.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br/>");
    }).join("");
  }, [text]);
  return <div ref={ref} style={{ lineHeight: 1.8, fontFamily: "'Instrument Serif', serif", fontSize: "0.95rem" }} />;
}

export default function NoteEditor({ note, user, onClose }) {
  const [title, setTitle]       = useState(note?.title   || "");
  const [content, setContent]   = useState(note?.content || "");
  const [colorIdx, setColorIdx] = useState(note?.colorIdx ?? 0);
  const [tags, setTags]         = useState(note?.tags    || []);
  const [tab, setTab]           = useState("write"); // write | preview | attach
  const [files, setFiles]       = useState([]);           // new files to upload
  const [existingAtts, setExistingAtts] = useState(note?.attachments || []);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState({});
  const [saving, setSaving]       = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const fileInputRef = useRef();
  const c = COLORS[colorIdx];

  function toggleTag(t) {
    setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  }

  function handleFileDrop(e) {
    e.preventDefault(); setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(p => [...p, ...dropped]);
  }

  function handleFileInput(e) {
    setFiles(p => [...p, ...Array.from(e.target.files)]);
  }

  function removeNewFile(i) {
    setFiles(p => p.filter((_,j) => j !== i));
  }

  function removeExisting(i) {
    setExistingAtts(p => p.filter((_,j) => j !== i));
  }

  async function uploadFiles() {
    if (!files.length) return [];
    const results = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const storageRef = ref(storage, `notes/${user.uid}/${Date.now()}_${file.name}`);
      await new Promise((res, rej) => {
        const task = uploadBytesResumable(storageRef, file);
        task.on("state_changed",
          snap => setProgress(p => ({ ...p, [i]: Math.round(snap.bytesTransferred / snap.totalBytes * 100) })),
          rej,
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            results.push({ name: file.name, url, type: file.type, size: file.size });
            res();
          }
        );
      });
    }
    return results;
  }

  async function handleSave() {
    if (!content.trim() && !title.trim()) return;
    setSaving(true);
    try {
      setUploading(true);
      const newUploaded = await uploadFiles();
      setUploading(false);
      const allAttachments = [...existingAtts, ...newUploaded];
      const data = {
        title, content, colorIdx, tags,
        attachments: allAttachments,
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
      console.error(e);
      setSaving(false);
      setUploading(false);
    }
  }

  const fileIcon = (type) => {
    if (!type) return "📎";
    if (type.startsWith("image/")) return "🖼";
    if (type === "application/pdf") return "📄";
    if (type.includes("json")) return "📋";
    return "📎";
  };

  const formatBytes = (b) => {
    if (b < 1024) return b + " B";
    if (b < 1024*1024) return (b/1024).toFixed(1) + " KB";
    return (b/1024/1024).toFixed(1) + " MB";
  };

  const tabStyle = (active) => ({
    padding: "7px 18px",
    background: active ? "var(--ink)" : "transparent",
    color: active ? "white" : "var(--muted)",
    border: "1.5px solid " + (active ? "var(--ink)" : "var(--border)"),
    borderRadius: 10,
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: "0.82rem",
    cursor: "pointer",
    transition: "all 0.15s",
    letterSpacing: 0.2,
  });

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(26,26,46,0.6)",
      backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16,
      animation: "fadeIn 0.2s ease",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: c.bg,
        borderRadius: 28,
        width: "100%", maxWidth: 560,
        maxHeight: "92vh",
        overflowY: "auto",
        boxShadow: `0 20px 60px ${c.border}44, 0 4px 20px rgba(0,0,0,0.2)`,
        border: `2px solid ${c.border}66`,
        display: "flex", flexDirection: "column",
        animation: "fadeUp 0.25s cubic-bezier(.4,0,.2,1)",
      }}>
        {/* Header */}
        <div style={{
          padding: "22px 24px 0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "1.15rem", fontWeight: 900,
            color: c.border, letterSpacing: -0.3,
          }}>
            {note ? "✏️ Edit Note" : "✨ Naya Note"}
          </h2>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 22, color: "var(--muted)", lineHeight: 1,
            padding: 4,
          }}>×</button>
        </div>

        <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Title */}
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title..."
            style={{
              border: `1.5px solid ${c.border}55`,
              borderRadius: 14, padding: "10px 14px",
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700, fontSize: "1rem",
              background: "rgba(255,255,255,0.7)",
              outline: "none", color: "var(--ink)",
            }}
          />

          {/* Tabs */}
          <div style={{ display: "flex", gap: 6 }}>
            {[["write","✍️ Write"],["preview","👁 Preview"],["attach","📎 Files"]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={tabStyle(tab === id)}>
                {label} {id === "attach" && (files.length + existingAtts.length) > 0 &&
                  <span style={{ marginLeft: 4, background: c.border, color: "white", borderRadius: 20, padding: "0 6px", fontSize: "0.7rem" }}>
                    {files.length + existingAtts.length}
                  </span>
                }
              </button>
            ))}
          </div>

          {/* Write Tab */}
          {tab === "write" && (
            <>
              <textarea
                autoFocus
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={"Likho kuch...\n\nInline math:  $x^2 + y^2 = r^2$\nBlock math:\n$$\\int_0^\\infty e^{-x}\\,dx = 1$$\n\n$$\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$"}
                rows={9}
                style={{
                  border: `1.5px solid ${c.border}55`,
                  borderRadius: 14, padding: "12px 14px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.88rem",
                  background: "rgba(255,255,255,0.7)",
                  outline: "none", resize: "vertical",
                  color: "var(--ink)", lineHeight: 1.7,
                }}
              />
              <div style={{
                background: "rgba(255,255,255,0.5)",
                border: `1px dashed ${c.border}55`,
                borderRadius: 12, padding: "10px 14px",
                fontSize: "0.74rem", color: "var(--muted)",
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1.7,
              }}>
                💡 <b>KaTeX shortcuts:</b><br/>
                Inline: <code>$formula$</code> &nbsp;·&nbsp; Block: <code>$$formula$$</code><br/>
                e.g. <code>$\sqrt{{x^2+y^2}}$</code> · <code>$$\sum_{{n=1}}^\infty \frac{{1}}{{n^2}}$$</code>
              </div>
            </>
          )}

          {/* Preview Tab */}
          {tab === "preview" && (
            <div style={{
              minHeight: 180,
              border: `1.5px solid ${c.border}44`,
              borderRadius: 14, padding: "14px 16px",
              background: "rgba(255,255,255,0.8)",
              lineHeight: 1.75,
            }}>
              {(content || title)
                ? <MathPreview text={content || title} />
                : <span style={{ color: "var(--muted)", fontStyle: "italic" }}>Kuch likho pehle...</span>
              }
            </div>
          )}

          {/* Attach Tab */}
          {tab === "attach" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? c.border : c.border + "66"}`,
                  borderRadius: 16,
                  padding: "32px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: dragOver ? c.border + "11" : "rgba(255,255,255,0.5)",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>
                  {dragOver ? "⬇️" : "📁"}
                </div>
                <div style={{ fontWeight: 800, fontSize: "0.9rem", color: c.border }}>
                  Drag & drop karo ya click karo
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
                  Images (JPG, PNG, GIF) · PDF · JSON · Any file
                </div>
                <input ref={fileInputRef} type="file" multiple
                  accept="image/*,.pdf,.json,.txt,.csv,.doc,.docx"
                  onChange={handleFileInput}
                  style={{ display: "none" }}
                />
              </div>

              {/* Existing attachments */}
              {existingAtts.map((att, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "rgba(255,255,255,0.8)",
                  border: `1px solid ${c.border}44`,
                  borderRadius: 12, padding: "10px 12px",
                }}>
                  {att.type?.startsWith("image/")
                    ? <img src={att.url} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8 }} />
                    : <span style={{ fontSize: 28 }}>{fileIcon(att.type)}</span>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Saved · <a href={att.url} target="_blank" rel="noreferrer" style={{ color: c.border }}>View ↗</a></div>
                  </div>
                  <button onClick={() => removeExisting(i)} style={{
                    background: "#fee2e2", border: "1px solid #fca5a5",
                    borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: 13,
                  }}>🗑</button>
                </div>
              ))}

              {/* New files to upload */}
              {files.map((file, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "rgba(255,255,255,0.8)",
                  border: `1px solid ${c.border}66`,
                  borderRadius: 12, padding: "10px 12px",
                }}>
                  {file.type.startsWith("image/")
                    ? <img src={URL.createObjectURL(file)} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8 }} />
                    : <span style={{ fontSize: 28 }}>{fileIcon(file.type)}</span>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                      {formatBytes(file.size)}
                      {progress[i] !== undefined && (
                        <span> · Uploading {progress[i]}%</span>
                      )}
                    </div>
                    {progress[i] !== undefined && (
                      <div style={{ height: 3, background: "#e5e7eb", borderRadius: 10, marginTop: 4 }}>
                        <div style={{ width: progress[i] + "%", height: "100%", background: c.border, borderRadius: 10, transition: "width 0.3s" }} />
                      </div>
                    )}
                  </div>
                  <button onClick={() => removeNewFile(i)} style={{
                    background: "#fee2e2", border: "1px solid #fca5a5",
                    borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: 13,
                  }}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Color picker */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 700 }}>Rang:</span>
            {COLORS.map((col, i) => (
              <button key={i} onClick={() => setColorIdx(i)} title={col.name} style={{
                width: 24, height: 24, borderRadius: "50%",
                background: col.bg,
                border: i === colorIdx ? `3px solid ${col.border}` : `2px solid ${col.border}66`,
                cursor: "pointer",
                transform: i === colorIdx ? "scale(1.3)" : "scale(1)",
                transition: "transform 0.15s",
              }} />
            ))}
          </div>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {TAGS_LIST.map(t => (
              <button key={t} onClick={() => toggleTag(t)} style={{
                background: tags.includes(t) ? c.border : "rgba(255,255,255,0.6)",
                color: tags.includes(t) ? "white" : c.border,
                border: `1.5px solid ${c.border}99`,
                borderRadius: 20, padding: "4px 12px",
                fontSize: "0.75rem", fontWeight: 800,
                cursor: "pointer", transition: "all 0.15s",
                fontFamily: "'Syne', sans-serif",
              }}>#{t}</button>
            ))}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            style={{
              background: saving || uploading ? "var(--muted)" : `linear-gradient(135deg, ${c.border}, ${c.border}cc)`,
              color: "white", border: "none",
              borderRadius: 14, padding: "13px",
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800, fontSize: "0.97rem",
              cursor: saving || uploading ? "not-allowed" : "pointer",
              boxShadow: `0 4px 20px ${c.border}44`,
              transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {uploading
              ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Uploading...</>
              : saving
              ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Saving...</>
              : "💾 Save Karo"
            }
          </button>
        </div>
      </div>
    </div>
  );
}
