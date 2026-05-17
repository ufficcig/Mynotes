import { useState, useRef, useEffect } from "react";
import { addDoc, updateDoc, doc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { parseRichContent } from "../richContent";

const CLASSES  = ["Class 9","Class 10","Class 11","Class 12"];
const SUBJECTS = ["Maths","Hindi","English","Physics","Chemistry","Biology"];
const CHAPTERS = Array.from({length:15},(_,i)=>`Chapter ${i+1}`);

const COLORS = [
  {bg:"#FFFBF0",border:"#F59E0B",darkBg:"#1a1400",name:"Amber"},
  {bg:"#FFF0F3",border:"#F43F5E",darkBg:"#1a000a",name:"Rose"},
  {bg:"#F0FDF4",border:"#22C55E",darkBg:"#001408",name:"Mint"},
  {bg:"#EFF6FF",border:"#3B82F6",darkBg:"#000d1a",name:"Sky"},
  {bg:"#FAF5FF",border:"#A855F7",darkBg:"#0d0019",name:"Violet"},
  {bg:"#FFF7ED",border:"#EA580C",darkBg:"#1a0a00",name:"Coral"},
];

const SUBJECT_COLORS = {
  "Maths":"#3B82F6","Hindi":"#F59E0B","English":"#22C55E",
  "Physics":"#A855F7","Chemistry":"#F43F5E","Biology":"#10B981",
};

const SYNTAX_EXAMPLES = [
  { label:"# Title", desc:"Big heading" },
  { label:"## Section", desc:"Section" },
  { label:"- Point", desc:"Bullet" },
  { label:"!!important!!", desc:"Yellow highlight" },
  { label:"!!green:Good!!", desc:"Green highlight" },
  { label:"!!blue:Note!!", desc:"Blue highlight" },
  { label:"!!red:Warning!!", desc:"Red highlight" },
  { label:":::formula:\\frac{a}{b}:::", desc:"Formula card" },
  { label:":::def:Newton's Law:::", desc:"Definition box" },
  { label:":::remember:Key point:::", desc:"Remember box" },
  { label:":::diagram:concave-mirror:::", desc:"Mirror diagram" },
  { label:":::diagram:convex-lens:::", desc:"Lens diagram" },
  { label:":::diagram:refraction:::", desc:"Refraction" },
  { label:":::diagram:circuit:::", desc:"Circuit" },
  { label:":::diagram:photosynthesis:::", desc:"Photosynthesis" },
  { label:":::diagram:human-eye:::", desc:"Human eye" },
  { label:"==highlight==", desc:"Inline mark" },
  { label:"**bold**", desc:"Bold text" },
  { label:"$E=mc^2$", desc:"Inline math" },
  { label:"$$\\int f\\,dx$$", desc:"Block math" },
];

export default function NoteEditor({ note, user, onClose, dark }) {
  const [title, setTitle]           = useState(note?.title   || "");
  const [content, setContent]       = useState(note?.content || "");
  const [colorIdx, setColorIdx]     = useState(note?.colorIdx ?? 0);
  const [tab, setTab]               = useState("write");
  const [selectedClass, setSelectedClass]     = useState(note?.className || "");
  const [selectedSubject, setSelectedSubject] = useState(note?.subject   || "");
  const [selectedChapter, setSelectedChapter] = useState(note?.chapter   || "");
  const [important, setImportant]   = useState(note?.important || false);
  const [jsonData, setJsonData]     = useState(note?.jsonData || null);
  const [jsonName, setJsonName]     = useState(note?.jsonName || "");
  const [jsonError, setJsonError]   = useState("");
  const [saving, setSaving]         = useState(false);
  const [dragOver, setDragOver]     = useState(false);
  const [showSyntax, setShowSyntax] = useState(false);
  const previewRef = useRef();
  const fileInputRef = useRef();
  const textRef = useRef();

  const c = COLORS[colorIdx];
  const cardBg = dark ? c.darkBg : c.bg;
  const subjectColor = selectedSubject ? SUBJECT_COLORS[selectedSubject] : c.border;

  useEffect(() => { if (tab === "write") textRef.current?.focus(); }, [tab]);

  useEffect(() => {
    if (tab === "preview" && previewRef.current) {
      previewRef.current.innerHTML = parseRichContent(content || title, subjectColor);
    }
  }, [tab, content, title, subjectColor]);

  function insertSyntax(text) {
    const ta = textRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const newContent = content.slice(0, start) + text + content.slice(end);
    setContent(newContent);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + text.length, start + text.length); }, 10);
  }

  function handleJsonFile(file) {
    if (!file) return;
    if (!file.name.endsWith(".json")) { setJsonError("Sirf .json!"); return; }
    const reader = new FileReader();
    reader.onload = e => {
      try { JSON.parse(e.target.result); setJsonData(e.target.result); setJsonName(file.name); setJsonError(""); }
      catch { setJsonError("Invalid JSON!"); }
    };
    reader.readAsText(file);
  }

  function prettyJson() {
    try { return JSON.stringify(JSON.parse(jsonData),null,2); }
    catch { return jsonData; }
  }

  async function handleSave() {
    if (!content.trim() && !title.trim()) return;
    setSaving(true);
    try {
      const data = {
        title, content, colorIdx,
        className: selectedClass, subject: selectedSubject, chapter: selectedChapter,
        important, jsonData: jsonData||null, jsonName: jsonName||null,
        uid: user.uid, updatedAt: serverTimestamp(), pinned: note?.pinned||false,
      };
      if (note) {
        await updateDoc(doc(db,"notes",note.id), data);
      } else {
        await addDoc(collection(db,"notes"), {...data, createdAt: serverTimestamp()});
      }
      onClose();
    } catch(e) { alert("Error: "+e.message); setSaving(false); }
  }

  const tabBtn = (active) => ({
    padding:"6px 12px",
    background: active ? (dark?"#e8e4dd":"var(--ink)") : "transparent",
    color: active ? (dark?"#1a1a2e":"white") : "var(--muted)",
    border:`1.5px solid ${active?(dark?"#e8e4dd":"var(--ink)"):"var(--border)"}`,
    borderRadius:10, fontFamily:"'Syne',sans-serif",
    fontWeight:700, fontSize:"0.76rem", cursor:"pointer", transition:"all 0.15s",
  });

  const sectionLabel = (text) => (
    <div style={{fontSize:"0.68rem",fontWeight:800,color:"var(--muted)",marginBottom:5,letterSpacing:0.5}}>{text}</div>
  );

  return (
    <div style={{
      position:"fixed",inset:0,
      background:"rgba(0,0,0,0.72)",backdropFilter:"blur(6px)",
      display:"flex",alignItems:"center",justifyContent:"center",
      zIndex:1000,padding:16,
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:cardBg, borderRadius:28,
        width:"100%", maxWidth:580, maxHeight:"93vh", overflowY:"auto",
        boxShadow:`0 20px 60px ${c.border}44`,
        border:`2px solid ${c.border}66`,
        display:"flex",flexDirection:"column",
        animation:"popIn 0.25s ease",
      }}>
        {/* Header */}
        <div style={{padding:"18px 22px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:"1.3rem",fontWeight:700,color:c.border}}>
            {note?"Edit Note":"Naya Note"}
          </h2>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={()=>setImportant(i=>!i)} style={{
              background:important?"#FFF7ED":"transparent",
              border:`1.5px solid ${important?"#F59E0B":"var(--border)"}`,
              borderRadius:10,padding:"6px 10px",
              cursor:"pointer",fontSize:17,lineHeight:1,
              transition:"all 0.2s",
            }}>
              {important?"⭐":"☆"}
            </button>
            <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"var(--muted)"}}>×</button>
          </div>
        </div>

        <div style={{padding:"14px 22px 22px",display:"flex",flexDirection:"column",gap:11}}>

          {/* Title */}
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title..."
            style={{
              border:`1.5px solid ${c.border}55`,borderRadius:14,padding:"10px 14px",
              fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:"1rem",
              background:dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.8)",
              outline:"none",color:dark?"#e8e4dd":"var(--ink)",
            }}
          />

          {/* Class */}
          <div>
            {sectionLabel("🏫 CLASS")}
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {CLASSES.map(cls=>(
                <button key={cls} onClick={()=>setSelectedClass(selectedClass===cls?"":cls)} style={{
                  background:selectedClass===cls?(dark?"#e8e4dd":"var(--ink)"):(dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.7)"),
                  color:selectedClass===cls?(dark?"#1a1a2e":"white"):"var(--ink)",
                  border:`1.5px solid ${selectedClass===cls?"transparent":"var(--border)"}`,
                  borderRadius:10,padding:"6px 13px",
                  fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"0.8rem",cursor:"pointer",transition:"all 0.15s",
                }}>{cls}</button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            {sectionLabel("📚 SUBJECT")}
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {SUBJECTS.map(sub=>{
                const sc2=SUBJECT_COLORS[sub]; const active=selectedSubject===sub;
                return (
                  <button key={sub} onClick={()=>setSelectedSubject(active?"":sub)} style={{
                    background:active?sc2:(dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.7)"),
                    color:active?"white":sc2,
                    border:`1.5px solid ${sc2}`,
                    borderRadius:20,padding:"5px 14px",
                    fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"0.8rem",cursor:"pointer",transition:"all 0.15s",
                  }}>{sub}</button>
                );
              })}
            </div>
          </div>

          {/* Chapter */}
          <div>
            {sectionLabel("📖 CHAPTER")}
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {CHAPTERS.map(ch=>(
                <button key={ch} onClick={()=>setSelectedChapter(selectedChapter===ch?"":ch)} style={{
                  background:selectedChapter===ch?c.border:(dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.7)"),
                  color:selectedChapter===ch?"white":c.border,
                  border:`1.5px solid ${c.border}88`,
                  borderRadius:8,padding:"4px 9px",
                  fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"0.72rem",cursor:"pointer",transition:"all 0.15s",
                }}>{ch.replace("Chapter","Ch.")}</button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            {[["write","✍️ Write"],["preview","👁 Preview"],["json","📋 JSON"]].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} style={tabBtn(tab===id)}>
                {label}
                {id==="json"&&jsonData&&<span style={{marginLeft:5,background:c.border,color:"white",borderRadius:20,padding:"0 5px",fontSize:"0.65rem"}}>✓</span>}
              </button>
            ))}
            <button onClick={()=>setShowSyntax(s=>!s)} style={{
              marginLeft:"auto",
              background:showSyntax?c.border:"transparent",
              color:showSyntax?"white":c.border,
              border:`1.5px solid ${c.border}`,
              borderRadius:10,padding:"6px 12px",
              fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.72rem",cursor:"pointer",
            }}>📖 Syntax</button>
          </div>

          {/* Syntax guide */}
          {showSyntax && (
            <div style={{
              background:dark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.7)",
              border:`1px solid ${c.border}44`,borderRadius:14,
              padding:"12px",maxHeight:180,overflowY:"auto",
              display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,
            }}>
              {SYNTAX_EXAMPLES.map((ex,i)=>(
                <button key={i} onClick={()=>insertSyntax(ex.label)} style={{
                  background:"none",border:"none",
                  textAlign:"left",padding:"4px 8px",borderRadius:8,cursor:"pointer",
                  fontFamily:"'JetBrains Mono',monospace",fontSize:"0.68rem",
                  color:c.border,transition:"background 0.1s",
                }}
                  onMouseEnter={e=>e.currentTarget.style.background=c.border+"22"}
                  onMouseLeave={e=>e.currentTarget.style.background="none"}
                  title={ex.desc}
                >
                  {ex.label.length>22?ex.label.slice(0,22)+"…":ex.label}
                  <span style={{color:"var(--muted)",fontSize:"0.6rem",display:"block"}}>{ex.desc}</span>
                </button>
              ))}
            </div>
          )}

          {/* Write Tab */}
          {tab==="write" && (
            <textarea ref={textRef} value={content} onChange={e=>setContent(e.target.value)}
              placeholder={"# Chapter Title\n## Section Heading\n- Bullet point\n\n!!Important text!!\n!!green:Good point!!\n\n:::formula:\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}:::\n\n:::def:Newton's First Law:::\n:::remember:Key formula:::\n\n:::diagram:concave-mirror:::\n\n==Highlight this== and $E=mc^2$ inline\n\n$$\\int_0^\\infty e^{-x}\\,dx = 1$$"}
              rows={11} style={{
                border:`1.5px solid ${c.border}55`,borderRadius:14,padding:"12px 14px",
                fontFamily:"'JetBrains Mono',monospace",fontSize:"0.82rem",
                background:dark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.8)",
                outline:"none",resize:"vertical",
                color:dark?"#e8e4dd":"var(--ink)",lineHeight:1.7,
              }}
            />
          )}

          {/* Preview Tab */}
          {tab==="preview" && (
            <div style={{
              minHeight:200,border:`1.5px solid ${c.border}44`,
              borderRadius:14,padding:"16px 18px",
              background:dark?"rgba(255,255,255,0.03)":"white",
              overflowX:"auto",
            }}>
              <div ref={previewRef} />
            </div>
          )}

          {/* JSON Tab */}
          {tab==="json" && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {!jsonData?(
                <>
                  <div onDragOver={e=>{e.preventDefault();setDragOver(true);}}
                    onDragLeave={()=>setDragOver(false)}
                    onDrop={e=>{e.preventDefault();setDragOver(false);handleJsonFile(e.dataTransfer.files[0]);}}
                    onClick={()=>fileInputRef.current?.click()}
                    style={{
                      border:`2px dashed ${dragOver?c.border:c.border+"55"}`,
                      borderRadius:16,padding:"28px 20px",textAlign:"center",cursor:"pointer",
                      background:dragOver?c.border+"11":(dark?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.6)"),
                    }}>
                    <div style={{fontSize:32,marginBottom:8}}>📋</div>
                    <div style={{fontWeight:800,color:c.border,fontSize:"0.9rem"}}>JSON file drag karo ya click karo</div>
                    <input ref={fileInputRef} type="file" accept=".json" onChange={e=>handleJsonFile(e.target.files[0])} style={{display:"none"}}/>
                  </div>
                  {jsonError&&<div style={{background:"#fee2e2",borderRadius:10,padding:"9px 14px",fontSize:"0.8rem",color:"#dc2626",fontWeight:700}}>⚠️ {jsonError}</div>}
                </>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:dark?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.9)",border:`1px solid ${c.border}44`,borderRadius:12,padding:"10px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:20}}>📋</span>
                      <div>
                        <div style={{fontWeight:800,fontSize:"0.85rem"}}>{jsonName}</div>
                        <div style={{fontSize:"0.7rem",color:"var(--muted)"}}>{(jsonData.length/1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <button onClick={()=>{setJsonData(null);setJsonName("");}} style={{background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:8,padding:"5px 9px",cursor:"pointer",fontSize:13}}>🗑</button>
                  </div>
                  <pre style={{background:dark?"rgba(255,255,255,0.03)":"rgba(26,26,46,0.03)",border:`1px solid ${c.border}44`,borderRadius:12,padding:"12px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.78rem",maxHeight:160,overflowY:"auto",whiteSpace:"pre-wrap",wordBreak:"break-all",color:dark?"#e8e4dd":"var(--ink)"}}>
                    {prettyJson()}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Color picker */}
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:"0.73rem",color:"var(--muted)",fontWeight:700}}>Rang:</span>
            {COLORS.map((col,i)=>(
              <button key={i} onClick={()=>setColorIdx(i)} style={{
                width:22,height:22,borderRadius:"50%",
                background:dark?col.darkBg:col.bg,
                border:i===colorIdx?`3px solid ${col.border}`:`2px solid ${col.border}88`,
                cursor:"pointer",transform:i===colorIdx?"scale(1.3)":"scale(1)",transition:"transform 0.15s",
              }}/>
            ))}
          </div>

          {/* Save */}
          <button onClick={handleSave} disabled={saving} style={{
            background:saving?"var(--muted)":`linear-gradient(135deg,${c.border},${c.border}cc)`,
            color:"white",border:"none",borderRadius:14,padding:"13px",
            fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"0.95rem",
            cursor:saving?"not-allowed":"pointer",
            boxShadow:`0 4px 20px ${c.border}44`,
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,
          }}>
            {saving?<><span style={{animation:"spin 0.8s linear infinite",display:"inline-block"}}>⟳</span> Saving...</>:"💾 Save Karo"}
          </button>
        </div>
      </div>
    </div>
  );
}
