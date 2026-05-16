import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import Auth from "./components/Auth";
import NoteCard from "./components/NoteCard";
import NoteEditor from "./components/NoteEditor";
import ReadMode from "./components/ReadMode";

const CLASSES   = ["Class 9", "Class 10"];
const SUBJECTS  = ["Maths", "Hindi", "English", "Physics", "Chemistry", "Biology"];

const SUBJECT_COLORS = {
  "Maths":     "#3B82F6",
  "Hindi":     "#F59E0B",
  "English":   "#22C55E",
  "Physics":   "#A855F7",
  "Chemistry": "#F43F5E",
  "Biology":   "#10B981",
};

export default function App() {
  const [user, setUser]             = useState(undefined);
  const [notes, setNotes]           = useState([]);
  const [search, setSearch]         = useState("");
  const [filterClass, setFilterClass]   = useState(null);
  const [filterSubject, setFilterSubject] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editNote, setEditNote]     = useState(null);
  const [readNote, setReadNote]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [sidebar, setSidebar]       = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u || null);
      if (!u) setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, "notes"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, snap => {
      setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => { console.error(err); setLoading(false); });
    return unsub;
  }, [user]);

  if (user === undefined) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ width: 44, height: 44, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  if (!user) return <Auth />;

  const filtered = notes
    .filter(n => {
      const q = search.toLowerCase();
      return !q || n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q);
    })
    .filter(n => !filterClass || n.className === filterClass)
    .filter(n => !filterSubject || n.subject === filterSubject)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));

  function openNew()      { setEditNote(null); setEditorOpen(true); }
  function openEdit(note) { setEditNote(note); setEditorOpen(true); }
  function openRead(note) { setReadNote(note); }

  const pinnedCount = notes.filter(n => n.pinned).length;

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--paper)" }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebar ? 260 : 0, minWidth: sidebar ? 260 : 0,
        overflow: "hidden", transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
        background: "var(--ink)", color: "white",
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 200,
      }}>
        {/* User info */}
        <div style={{ padding: "28px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "1.5rem", marginBottom: 14 }}>MyNotes</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={user.photoURL} alt="" style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.25)" }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: "0.85rem" }}>{user.displayName}</div>
              <div style={{ fontSize: "0.65rem", opacity: 0.45, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 20 }}>
          {[{ label: "Total", val: notes.length }, { label: "Pinned", val: pinnedCount }].map(s => (
            <div key={s.label}>
              <div style={{ fontWeight: 900, fontSize: "1.2rem" }}>{s.val}</div>
              <div style={{ fontSize: "0.65rem", opacity: 0.4, fontWeight: 700 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Class Filter */}
        <div style={{ padding: "14px 16px 8px", flex: 1, overflowY: "auto" }}>
          <div style={{ fontSize: "0.62rem", fontWeight: 900, letterSpacing: 1.5, opacity: 0.35, padding: "0 4px 8px", textTransform: "uppercase" }}>🏫 Class</div>
          {[null, ...CLASSES].map(cls => (
            <button key={cls || "all"} onClick={() => { setFilterClass(cls); setFilterSubject(null); setSidebar(false); }} style={{
              display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center",
              background: filterClass === cls && !filterSubject ? "rgba(255,255,255,0.12)" : "none",
              border: "none", borderRadius: 10, padding: "8px 12px",
              color: filterClass === cls && !filterSubject ? "white" : "rgba(255,255,255,0.55)",
              fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "0.85rem",
              cursor: "pointer", transition: "all 0.15s", marginBottom: 2,
            }}>
              <span>{cls ? `🏫 ${cls}` : "📋 Sab Notes"}</span>
              <span style={{ opacity: 0.4, fontSize: "0.75rem" }}>
                {cls ? notes.filter(n => n.className === cls).length : notes.length}
              </span>
            </button>
          ))}

          {/* Subject Filter */}
          <div style={{ fontSize: "0.62rem", fontWeight: 900, letterSpacing: 1.5, opacity: 0.35, padding: "14px 4px 8px", textTransform: "uppercase" }}>📚 Subject</div>
          {SUBJECTS.map(sub => {
            const count = notes.filter(n => n.subject === sub).length;
            if (count === 0) return null;
            const subColor = SUBJECT_COLORS[sub];
            return (
              <button key={sub} onClick={() => { setFilterSubject(filterSubject === sub ? null : sub); setSidebar(false); }} style={{
                display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center",
                background: filterSubject === sub ? subColor + "33" : "none",
                border: "none", borderRadius: 10, padding: "8px 12px",
                color: filterSubject === sub ? "white" : "rgba(255,255,255,0.55)",
                fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "0.85rem",
                cursor: "pointer", transition: "all 0.15s", marginBottom: 2,
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: subColor, display: "inline-block" }} />
                  {sub}
                </span>
                <span style={{ opacity: 0.4, fontSize: "0.75rem" }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Sign out */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={() => signOut(auth)} style={{
            width: "100%", background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "9px",
            color: "#fca5a5", fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: "0.82rem", cursor: "pointer",
          }}>🚪 Sign Out</button>
        </div>
      </aside>

      {sidebar && <div onClick={() => setSidebar(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 199 }} />}

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Header */}
        <header style={{
          background: "rgba(247,244,239,0.92)", backdropFilter: "blur(14px)",
          borderBottom: "1.5px solid var(--border)", padding: "14px 18px",
          position: "sticky", top: 0, zIndex: 100, display: "flex", flexDirection: "column", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSidebar(s => !s)} style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: 10, padding: "7px 10px", cursor: "pointer", fontSize: 16, color: "var(--ink)" }}>☰</button>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "1.5rem", color: "var(--ink)", letterSpacing: -0.5, lineHeight: 1 }}>MyNotes</div>
              <div style={{ fontSize: "0.68rem", color: "var(--muted)", fontWeight: 700 }}>
                {filtered.length} notes
                {filterClass && <span style={{ color: "var(--accent)" }}> · {filterClass}</span>}
                {filterSubject && <span style={{ color: SUBJECT_COLORS[filterSubject] }}> · {filterSubject}</span>}
              </div>
            </div>
            <img src={user.photoURL} alt="" style={{ width: 34, height: 34, borderRadius: "50%", border: "2px solid var(--border)", cursor: "pointer" }} onClick={() => setSidebar(s => !s)} />
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Notes search karo..."
              style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 14, padding: "9px 36px", fontFamily: "'Syne', sans-serif", fontSize: "0.9rem", background: "white", outline: "none", color: "var(--ink)" }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--muted)" }}>×</button>}
          </div>

          {/* Class + Subject quick filter pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button onClick={() => { setFilterClass(null); setFilterSubject(null); }} style={{
              background: !filterClass && !filterSubject ? "var(--ink)" : "rgba(255,255,255,0.8)",
              color: !filterClass && !filterSubject ? "white" : "var(--muted)",
              border: "1.5px solid var(--border)", borderRadius: 20,
              padding: "4px 12px", fontSize: "0.74rem", fontWeight: 800,
              cursor: "pointer", fontFamily: "'Syne', sans-serif",
            }}>All</button>

            {CLASSES.map(cls => (
              <button key={cls} onClick={() => { setFilterClass(filterClass === cls ? null : cls); setFilterSubject(null); }} style={{
                background: filterClass === cls ? "var(--ink)" : "rgba(255,255,255,0.8)",
                color: filterClass === cls ? "white" : "var(--ink)",
                border: "1.5px solid var(--border)", borderRadius: 20,
                padding: "4px 12px", fontSize: "0.74rem", fontWeight: 800,
                cursor: "pointer", fontFamily: "'Syne', sans-serif",
              }}>🏫 {cls}</button>
            ))}

            {SUBJECTS.map(sub => {
              const subColor = SUBJECT_COLORS[sub];
              const count = notes.filter(n => n.subject === sub).length;
              if (count === 0) return null;
              return (
                <button key={sub} onClick={() => setFilterSubject(filterSubject === sub ? null : sub)} style={{
                  background: filterSubject === sub ? subColor : "rgba(255,255,255,0.8)",
                  color: filterSubject === sub ? "white" : subColor,
                  border: `1.5px solid ${subColor}`,
                  borderRadius: 20, padding: "4px 12px",
                  fontSize: "0.74rem", fontWeight: 800,
                  cursor: "pointer", fontFamily: "'Syne', sans-serif",
                }}>📚 {sub}</button>
              );
            })}
          </div>
        </header>

        {/* Notes grid */}
        <main style={{ flex: 1, padding: "18px 16px", maxWidth: 900, margin: "0 auto", width: "100%" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 80, flexDirection: "column", gap: 16 }}>
              <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <p style={{ color: "var(--muted)", fontWeight: 700, fontSize: "0.9rem" }}>Notes load ho rahi hain...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>📒</div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "1.5rem", color: "var(--ink)", marginBottom: 10 }}>
                {search ? "Koi note nahi mila" : filterClass || filterSubject ? "Is filter mein koi note nahi" : "Pehla note banao!"}
              </div>
              <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
                {!search && !filterClass && !filterSubject && "Class aur Subject select karke notes banao"}
              </p>
              {!search && (
                <button onClick={openNew} style={{ marginTop: 24, background: "var(--ink)", color: "white", border: "none", borderRadius: 14, padding: "12px 28px", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer" }}>＋ Note Banao</button>
              )}
            </div>
          ) : (
            <div style={{ columnCount: 2, columnGap: 14 }}>
              {filtered.map(note => (
                <NoteCard key={note.id} note={note} onEdit={openEdit} onRead={openRead} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* FAB */}
      <button onClick={openNew} style={{
        position: "fixed", bottom: 28, right: 24, width: 58, height: 58,
        background: "linear-gradient(135deg, var(--ink), #2d2d4e)",
        color: "white", border: "none", borderRadius: "50%", fontSize: 28,
        cursor: "pointer", boxShadow: "0 6px 28px rgba(26,26,46,0.35)", zIndex: 500,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "transform 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.12)"}
        onMouseLeave={e => e.currentTarget.style.transform = ""}
      >＋</button>

      {/* Read Mode */}
      {readNote && (
        <ReadMode
          note={readNote}
          onClose={() => setReadNote(null)}
          onEdit={(note) => { setReadNote(null); openEdit(note); }}
        />
      )}

      {/* Editor */}
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
