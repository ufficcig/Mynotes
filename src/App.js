import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import Auth from "./components/Auth";
import NoteCard from "./components/NoteCard";
import NoteEditor from "./components/NoteEditor";

const TAGS_LIST = ["Personal", "Work", "Maths", "Physics", "Chemistry", "Ideas", "Todo", "Important"];

export default function App() {
  const [user, setUser]             = useState(undefined);
  const [notes, setNotes]           = useState([]);
  const [search, setSearch]         = useState("");
  const [filterTag, setFilterTag]   = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editNote, setEditNote]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [sidebar, setSidebar]       = useState(false);

  // Auth
  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u || null);
      if (!u) setLoading(false);
    });
  }, []);

  // Firestore real-time
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(
      collection(db, "notes"),
      where("uid", "==", user.uid)
    );
    const unsub = onSnapshot(q, snap => {
      setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => {
      console.error(err);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  if (user === undefined) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 44, height: 44, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  if (!user) return <Auth />;

  const filtered = notes
    .filter(n => {
      const q = search.toLowerCase();
      return !q || n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q);
    })
    .filter(n => !filterTag || n.tags?.includes(filterTag))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  function openNew()       { setEditNote(null); setEditorOpen(true); }
  function openEdit(note)  { setEditNote(note); setEditorOpen(true); }

  const pinnedCount = notes.filter(n => n.pinned).length;
  const jsonCount   = notes.filter(n => n.jsonData).length;

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--paper)" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebar ? 248 : 0,
        minWidth: sidebar ? 248 : 0,
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
        background: "var(--ink)", color: "white",
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0,
        zIndex: 200,
        padding: sidebar ? "0" : "0",
      }}>
        <div style={{ padding: "28px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{
            fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
            fontSize: "1.6rem", marginBottom: 16, letterSpacing: -0.5,
          }}>MyNotes</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={user.photoURL} alt="" style={{
              width: 36, height: 36, borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.25)",
            }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: "0.85rem", lineHeight: 1.2 }}>{user.displayName}</div>
              <div style={{ fontSize: "0.65rem", opacity: 0.45, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 16 }}>
          {[
            { label: "Notes", val: notes.length },
            { label: "Pinned", val: pinnedCount },
            { label: "JSON", val: jsonCount },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 900, fontSize: "1.1rem" }}>{s.val}</div>
              <div style={{ fontSize: "0.65rem", opacity: 0.45, fontWeight: 700 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          <div style={{ fontSize: "0.62rem", fontWeight: 900, letterSpacing: 1.5, opacity: 0.35, padding: "0 8px 10px", textTransform: "uppercase" }}>Filter by Tag</div>
          {[null, ...TAGS_LIST].map(t => {
            const count = t ? notes.filter(n => n.tags?.includes(t)).length : notes.length;
            if (t && count === 0) return null;
            return (
              <button key={t || "all"} onClick={() => { setFilterTag(t); setSidebar(false); }} style={{
                display: "flex", width: "100%", textAlign: "left",
                justifyContent: "space-between", alignItems: "center",
                background: filterTag === t ? "rgba(255,255,255,0.12)" : "none",
                border: "none", borderRadius: 10,
                padding: "8px 12px",
                color: filterTag === t ? "white" : "rgba(255,255,255,0.55)",
                fontFamily: "'Syne', sans-serif",
                fontWeight: filterTag === t ? 800 : 600,
                fontSize: "0.85rem", cursor: "pointer",
                transition: "all 0.15s", marginBottom: 2,
              }}>
                <span>{t ? `#${t}` : "📋 All Notes"}</span>
                <span style={{ opacity: 0.4, fontSize: "0.75rem" }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Sign out */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={() => signOut(auth)} style={{
            width: "100%",
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10, padding: "9px",
            color: "#fca5a5",
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: "0.82rem", cursor: "pointer",
          }}>🚪 Sign Out</button>
        </div>
      </aside>

      {/* Sidebar overlay */}
      {sidebar && (
        <div onClick={() => setSidebar(false)} style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 199, animation: "fadeIn 0.2s",
        }} />
      )}

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Header */}
        <header style={{
          background: "rgba(247,244,239,0.92)",
          backdropFilter: "blur(14px)",
          borderBottom: "1.5px solid var(--border)",
          padding: "14px 18px",
          position: "sticky", top: 0, zIndex: 100,
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSidebar(s => !s)} style={{
              background: "none", border: "1.5px solid var(--border)",
              borderRadius: 10, padding: "7px 10px",
              cursor: "pointer", fontSize: 16, color: "var(--ink)",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--border)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >☰</button>

            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
                fontSize: "1.5rem", color: "var(--ink)", letterSpacing: -0.5, lineHeight: 1,
              }}>MyNotes</div>
              <div style={{ fontSize: "0.68rem", color: "var(--muted)", fontWeight: 700 }}>
                {notes.length} notes · {pinnedCount} pinned
                {filterTag && <span style={{ color: "var(--accent)" }}> · #{filterTag}</span>}
              </div>
            </div>

            <img src={user.photoURL} alt="" style={{
              width: 34, height: 34, borderRadius: "50%",
              border: "2px solid var(--border)", cursor: "pointer",
            }} onClick={() => setSidebar(s => !s)} />
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none" }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Notes search karo..."
              style={{
                width: "100%",
                border: "1.5px solid var(--border)",
                borderRadius: 14, padding: "9px 36px",
                fontFamily: "'Syne', sans-serif", fontSize: "0.9rem",
                background: "white", outline: "none", color: "var(--ink)",
                transition: "border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                fontSize: 18, color: "var(--muted)", lineHeight: 1,
              }}>×</button>
            )}
          </div>

          {/* Active filter chip */}
          {filterTag && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 700 }}>Filter:</span>
              <span style={{
                background: "var(--ink)", color: "white",
                borderRadius: 20, padding: "3px 12px",
                fontSize: "0.76rem", fontWeight: 800,
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                #{filterTag}
                <button onClick={() => setFilterTag(null)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "white", fontSize: 15, lineHeight: 1, padding: 0,
                }}>×</button>
              </span>
            </div>
          )}
        </header>

        {/* Notes Grid */}
        <main style={{ flex: 1, padding: "18px 16px", maxWidth: 900, margin: "0 auto", width: "100%" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 80, flexDirection: "column", gap: 16 }}>
              <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <p style={{ color: "var(--muted)", fontWeight: 700, fontSize: "0.9rem" }}>Notes load ho rahi hain...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", animation: "fadeIn 0.4s" }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>{search ? "🔍" : "📒"}</div>
              <div style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
                fontSize: "1.5rem", color: "var(--ink)", marginBottom: 10,
              }}>
                {search ? "Koi note nahi mila" : filterTag ? `#${filterTag} mein koi note nahi` : "Pehla note banao!"}
              </div>
              <p style={{ color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.7 }}>
                {!search && !filterTag && "Math likho · JSON attach karo · Cloud mein save karo"}
              </p>
              {!search && (
                <button onClick={openNew} style={{
                  marginTop: 24,
                  background: "var(--ink)", color: "white",
                  border: "none", borderRadius: 14, padding: "12px 28px",
                  fontFamily: "'Syne', sans-serif", fontWeight: 800,
                  fontSize: "0.95rem", cursor: "pointer",
                  boxShadow: "var(--shadow-lg)",
                }}>＋ Note Banao</button>
              )}
            </div>
          ) : (
            <div style={{ columnCount: 2, columnGap: 14 }}>
              {filtered.map(note => (
                <NoteCard key={note.id} note={note} onEdit={openEdit} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* FAB */}
      <button onClick={openNew} style={{
        position: "fixed", bottom: 28, right: 24,
        width: 58, height: 58,
        background: "linear-gradient(135deg, var(--ink), #2d2d4e)",
        color: "white", border: "none", borderRadius: "50%",
        fontSize: 28, cursor: "pointer",
        boxShadow: "0 6px 28px rgba(26,26,46,0.35)",
        zIndex: 500, transition: "transform 0.2s, box-shadow 0.2s",
        display: "flex", alignItems: "center", justifyContent: "center",
        lineHeight: 1,
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.12)"; e.currentTarget.style.boxShadow = "0 10px 36px rgba(26,26,46,0.45)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 6px 28px rgba(26,26,46,0.35)"; }}
        title="Naya note"
      >＋</button>

      {/* Editor Modal */}
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
