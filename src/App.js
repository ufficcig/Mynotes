// src/App.js
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection, query, where, orderBy, onSnapshot,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import Auth from "./components/Auth";
import NoteCard from "./components/NoteCard";
import NoteEditor from "./components/NoteEditor";

const TAGS_LIST = ["Personal", "Work", "Maths", "Physics", "Chemistry", "Ideas", "Todo", "Important"];

export default function App() {
  const [user, setUser]           = useState(undefined); // undefined = loading
  const [notes, setNotes]         = useState([]);
  const [search, setSearch]       = useState("");
  const [filterTag, setFilterTag] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editNote, setEditNote]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth listener
  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u || null);
      if (!u) setLoading(false);
    });
  }, []);

  // Firestore real-time listener
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(
      collection(db, "notes"),
      where("uid", "==", user.uid),
      orderBy("updatedAt", "desc")
    );
    const unsub = onSnapshot(q, snap => {
      setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => {
      console.error("Firestore error:", err);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  // Loading screen
  if (user === undefined) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", flexDirection:"column", gap:16 }}>
      <div style={{ width:48, height:48, border:"3px solid var(--border)", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <p style={{ color:"var(--muted)", fontWeight:700 }}>Loading...</p>
    </div>
  );

  // Auth screen
  if (!user) return <Auth />;

  // Filter notes
  const filtered = notes
    .filter(n => {
      const q = search.toLowerCase();
      return !q || n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q);
    })
    .filter(n => !filterTag || n.tags?.includes(filterTag))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const pinnedCount = notes.filter(n => n.pinned).length;

  function openNew() { setEditNote(null); setEditorOpen(true); }
  function openEdit(note) { setEditNote(note); setEditorOpen(true); }

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:"var(--paper)" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? 240 : 0,
        minWidth: sidebarOpen ? 240 : 0,
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
        background: "var(--ink)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        padding: sidebarOpen ? "28px 0" : 0,
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        zIndex: 200,
      }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:"1.5rem", marginBottom:4 }}>MyNotes</div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:12 }}>
            <img src={user.photoURL} alt="" style={{ width:32, height:32, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)" }} />
            <div>
              <div style={{ fontSize:"0.8rem", fontWeight:800, lineHeight:1.2 }}>{user.displayName}</div>
              <div style={{ fontSize:"0.65rem", opacity:0.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:150 }}>{user.email}</div>
            </div>
          </div>
        </div>

        <div style={{ flex:1, padding:"16px 12px", overflowY:"auto" }}>
          <div style={{ fontSize:"0.65rem", fontWeight:900, letterSpacing:1.5, opacity:0.4, padding:"0 8px 8px", textTransform:"uppercase" }}>Tags</div>
          {[null, ...TAGS_LIST].map(t => (
            <button key={t||"all"} onClick={() => { setFilterTag(t); setSidebarOpen(false); }} style={{
              display:"block", width:"100%", textAlign:"left",
              background: filterTag === t ? "rgba(255,255,255,0.15)" : "none",
              border:"none", borderRadius:10,
              padding:"8px 12px",
              color: filterTag === t ? "white" : "rgba(255,255,255,0.6)",
              fontFamily:"'Syne', sans-serif",
              fontWeight: filterTag === t ? 800 : 600,
              fontSize:"0.85rem",
              cursor:"pointer",
              transition:"all 0.15s",
              marginBottom:2,
            }}>
              {t ? `#${t}` : "📋 All Notes"}
              {t && notes.filter(n => n.tags?.includes(t)).length > 0 && (
                <span style={{ float:"right", opacity:0.5, fontSize:"0.75rem" }}>
                  {notes.filter(n => n.tags?.includes(t)).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ padding:"16px 20px", borderTop:"1px solid rgba(255,255,255,0.1)" }}>
          <button onClick={() => signOut(auth)} style={{
            width:"100%", background:"rgba(239,68,68,0.2)",
            border:"1px solid rgba(239,68,68,0.3)",
            borderRadius:10, padding:"9px",
            color:"#fca5a5", fontFamily:"'Syne', sans-serif",
            fontWeight:800, fontSize:"0.82rem",
            cursor:"pointer",
          }}>🚪 Sign Out</button>
        </div>
      </aside>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.4)",
          zIndex:199, animation:"fadeIn 0.2s",
        }} />
      )}

      {/* ── Main ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:"100vh", minWidth:0 }}>

        {/* Header */}
        <header style={{
          background:"rgba(247,244,239,0.9)",
          backdropFilter:"blur(12px)",
          borderBottom:"1.5px solid var(--border)",
          padding:"14px 20px",
          position:"sticky", top:0, zIndex:100,
          display:"flex", flexDirection:"column", gap:12,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={() => setSidebarOpen(s => !s)} style={{
              background:"none", border:"1.5px solid var(--border)",
              borderRadius:10, padding:"6px 10px",
              cursor:"pointer", fontSize:16, color:"var(--ink)",
              transition:"background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--border)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >☰</button>

            <div style={{ flex:1 }}>
              <div style={{
                fontFamily:"'Instrument Serif', serif",
                fontStyle:"italic",
                fontSize:"1.4rem",
                color:"var(--ink)",
                letterSpacing:-0.5,
                lineHeight:1,
              }}>MyNotes</div>
              <div style={{ fontSize:"0.68rem", color:"var(--muted)", fontWeight:700 }}>
                {notes.length} notes · {pinnedCount} pinned
                {filterTag && <span> · #{filterTag}</span>}
              </div>
            </div>

            <img src={user.photoURL} alt="" style={{
              width:34, height:34, borderRadius:"50%",
              border:"2px solid var(--border)",
              cursor:"pointer",
            }} onClick={() => setSidebarOpen(s => !s)} />
          </div>

          {/* Search */}
          <div style={{ position:"relative" }}>
            <span style={{
              position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
              fontSize:15, pointerEvents:"none",
            }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes..."
              style={{
                width:"100%",
                border:"1.5px solid var(--border)",
                borderRadius:14, padding:"9px 12px 9px 36px",
                fontFamily:"'Syne', sans-serif",
                fontSize:"0.9rem",
                background:"white",
                outline:"none", color:"var(--ink)",
                transition:"border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{
                position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", cursor:"pointer",
                fontSize:16, color:"var(--muted)",
              }}>×</button>
            )}
          </div>

          {/* Tag pills horizontal scroll */}
          {filterTag && (
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              <span style={{ fontSize:"0.75rem", color:"var(--muted)", fontWeight:700 }}>Filter:</span>
              <span style={{
                background:"var(--ink)", color:"white",
                borderRadius:20, padding:"3px 12px",
                fontSize:"0.76rem", fontWeight:800,
                display:"flex", alignItems:"center", gap:6,
              }}>
                #{filterTag}
                <button onClick={() => setFilterTag(null)} style={{
                  background:"none", border:"none", cursor:"pointer",
                  color:"white", fontSize:14, lineHeight:1, padding:0,
                }}>×</button>
              </span>
            </div>
          )}
        </header>

        {/* Notes Grid */}
        <main style={{ flex:1, padding:"18px 16px", maxWidth:880, margin:"0 auto", width:"100%" }}>
          {loading ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, paddingTop:80 }}>
              <div style={{ width:40, height:40, border:"3px solid var(--border)", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
              <p style={{ color:"var(--muted)", fontWeight:700 }}>Notes load ho rahi hain...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"80px 20px", animation:"fadeIn 0.4s" }}>
              <div style={{ fontSize:56, marginBottom:16 }}>{search ? "🔍" : "📒"}</div>
              <div style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:"1.4rem", color:"var(--ink)", marginBottom:8 }}>
                {search ? "Koi note nahi mila" : filterTag ? `#${filterTag} mein koi note nahi` : "Pehla note likho!"}
              </div>
              <p style={{ color:"var(--muted)", fontSize:"0.88rem" }}>
                {!search && !filterTag && "Math, images, PDFs — sab kuch ek jagah rakho"}
              </p>
              {!search && (
                <button onClick={openNew} style={{
                  marginTop:24,
                  background:"var(--ink)", color:"white",
                  border:"none", borderRadius:14, padding:"12px 28px",
                  fontFamily:"'Syne', sans-serif", fontWeight:800,
                  fontSize:"0.95rem", cursor:"pointer",
                  boxShadow:"var(--shadow-lg)",
                }}>＋ Note Banao</button>
              )}
            </div>
          ) : (
            <div style={{
              columnCount: 2,
              columnGap: 14,
            }}>
              {filtered.map(note => (
                <NoteCard key={note.id} note={note} onEdit={openEdit} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── FAB ── */}
      <button
        onClick={openNew}
        style={{
          position:"fixed", bottom:28, right:24,
          width:58, height:58,
          background:"linear-gradient(135deg, var(--ink), #2d2d4e)",
          color:"white", border:"none",
          borderRadius:"50%",
          fontSize:26, cursor:"pointer",
          boxShadow:"0 6px 28px rgba(26,26,46,0.35)",
          zIndex:500,
          transition:"transform 0.2s, box-shadow 0.2s",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform="scale(1.12)"; e.currentTarget.style.boxShadow="0 10px 36px rgba(26,26,46,0.45)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 6px 28px rgba(26,26,46,0.35)"; }}
        title="Naya note"
      >＋</button>

      {/* ── Editor Modal ── */}
      {editorOpen && (
        <NoteEditor
          note={editNote}
          user={user}
          onClose={() => { setEditorOpen(false); setEditNote(null); }}
        />
      )}
    </div>
  );
}
