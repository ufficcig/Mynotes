import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import Auth from "./components/Auth";
import NoteCard from "./components/NoteCard";
import NoteEditor from "./components/NoteEditor";
import ReadMode from "./components/ReadMode";

const CLASSES  = ["Class 9","Class 10","Class 11","Class 12"];
const SUBJECTS = ["Maths","Hindi","English","Physics","Chemistry","Biology"];
const CHAPTERS = Array.from({length:15},(_,i)=>`Chapter ${i+1}`);

const SUBJECT_COLORS = {
  "Maths":"#3B82F6","Hindi":"#F59E0B","English":"#22C55E",
  "Physics":"#A855F7","Chemistry":"#F43F5E","Biology":"#10B981",
};

export default function App() {
  const [user,setUser]                 = useState(undefined);
  const [notes,setNotes]               = useState([]);
  const [search,setSearch]             = useState("");
  const [filterClass,setFilterClass]   = useState(null);
  const [filterSubject,setFilterSubject] = useState(null);
  const [filterChapter,setFilterChapter] = useState(null);
  const [filterImportant,setFilterImportant] = useState(false);
  const [editorOpen,setEditorOpen]     = useState(false);
  const [editNote,setEditNote]         = useState(null);
  const [readNote,setReadNote]         = useState(null);
  const [loading,setLoading]           = useState(true);
  const [sidebar,setSidebar]           = useState(false);
  const [dark,setDark]                 = useState(()=>localStorage.getItem("darkMode")==="true");

  useEffect(()=>{
    document.documentElement.setAttribute("data-theme",dark?"dark":"light");
    localStorage.setItem("darkMode",dark);
  },[dark]);

  useEffect(()=>{
    return onAuthStateChanged(auth,u=>{
      setUser(u||null);
      if(!u) setLoading(false);
    });
  },[]);

  useEffect(()=>{
    if(!user) return;
    setLoading(true);
    const q=query(collection(db,"notes"),where("uid","==",user.uid));
    const unsub=onSnapshot(q,snap=>{
      setNotes(snap.docs.map(d=>({id:d.id,...d.data()})));
      setLoading(false);
    },err=>{console.error(err);setLoading(false);});
    return unsub;
  },[user]);

  if(user===undefined) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>
      <div style={{width:44,height:44,border:"3px solid var(--border)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
    </div>
  );
  if(!user) return <Auth/>;

  const filtered=notes
    .filter(n=>{const q=search.toLowerCase();return !q||n.title?.toLowerCase().includes(q)||n.content?.toLowerCase().includes(q);})
    .filter(n=>!filterClass||n.className===filterClass)
    .filter(n=>!filterSubject||n.subject===filterSubject)
    .filter(n=>!filterChapter||n.chapter===filterChapter)
    .filter(n=>!filterImportant||n.important)
    .sort((a,b)=>(b.important?1:0)-(a.important?1:0)||(b.pinned?1:0)-(a.pinned?1:0)||((b.updatedAt?.seconds||0)-(a.updatedAt?.seconds||0)));

  const openNew=()=>{setEditNote(null);setEditorOpen(true);};
  const openEdit=(note)=>{setEditNote(note);setEditorOpen(true);};
  const openRead=(note)=>setReadNote(note);

  const pinnedCount=notes.filter(n=>n.pinned).length;
  const importantCount=notes.filter(n=>n.important).length;

  const availableChapters=CHAPTERS.filter(ch=>
    notes.some(n=>n.chapter===ch&&(!filterClass||n.className===filterClass)&&(!filterSubject||n.subject===filterSubject))
  );

  return (
    <div style={{minHeight:"100vh",display:"flex",background:"var(--paper)",transition:"background 0.3s"}}>

      {/* Sidebar */}
      <aside style={{
        width:sidebar?264:0,minWidth:sidebar?264:0,
        overflow:"hidden",transition:"all 0.3s cubic-bezier(.4,0,.2,1)",
        background:dark?"#0a0a14":"#1a1a2e",color:"white",
        display:"flex",flexDirection:"column",
        position:"fixed",top:0,left:0,bottom:0,zIndex:200,
      }}>
        <div style={{padding:"26px 20px 18px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:"1.6rem",marginBottom:14}}>MyNotes</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <img src={user.photoURL} alt="" style={{width:36,height:36,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.25)"}}/>
            <div style={{minWidth:0}}>
              <div style={{fontWeight:800,fontSize:"0.85rem"}}>{user.displayName}</div>
              <div style={{fontSize:"0.65rem",opacity:0.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.email}</div>
            </div>
          </div>
        </div>
        <div style={{padding:"12px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",gap:20}}>
          {[{l:"Total",v:notes.length},{l:"⭐",v:importantCount},{l:"📌",v:pinnedCount}].map(s=>(
            <div key={s.l}><div style={{fontWeight:900,fontSize:"1.1rem"}}>{s.v}</div><div style={{fontSize:"0.62rem",opacity:0.4,fontWeight:700}}>{s.l}</div></div>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"12px"}}>
          {[
            {label:"📋 Sab Notes",fn:()=>{setFilterClass(null);setFilterSubject(null);setFilterChapter(null);setFilterImportant(false);setSidebar(false);},active:!filterClass&&!filterSubject&&!filterImportant},
            {label:"⭐ Important",fn:()=>{setFilterImportant(f=>!f);setSidebar(false);},active:filterImportant,count:importantCount},
          ].map((item,i)=>(
            <button key={i} onClick={item.fn} style={{display:"flex",width:"100%",justifyContent:"space-between",alignItems:"center",background:item.active?"rgba(255,255,255,0.12)":"none",border:"none",borderRadius:10,padding:"8px 12px",color:item.active?"white":"rgba(255,255,255,0.55)",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"0.83rem",cursor:"pointer",marginBottom:2}}>
              <span>{item.label}</span><span style={{opacity:0.4,fontSize:"0.75rem"}}>{item.count||notes.length}</span>
            </button>
          ))}
          <div style={{fontSize:"0.6rem",fontWeight:900,letterSpacing:1.5,opacity:0.3,padding:"10px 4px 6px",textTransform:"uppercase"}}>🏫 Class</div>
          {CLASSES.map(cls=>{
            const count=notes.filter(n=>n.className===cls).length;
            if(!count) return null;
            return <button key={cls} onClick={()=>{setFilterClass(filterClass===cls?null:cls);setFilterChapter(null);setSidebar(false);}} style={{display:"flex",width:"100%",justifyContent:"space-between",alignItems:"center",background:filterClass===cls?"rgba(255,255,255,0.12)":"none",border:"none",borderRadius:10,padding:"7px 12px",color:filterClass===cls?"white":"rgba(255,255,255,0.55)",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"0.82rem",cursor:"pointer",marginBottom:2}}>
              <span>🏫 {cls}</span><span style={{opacity:0.4,fontSize:"0.75rem"}}>{count}</span>
            </button>;
          })}
          <div style={{fontSize:"0.6rem",fontWeight:900,letterSpacing:1.5,opacity:0.3,padding:"10px 4px 6px",textTransform:"uppercase"}}>📚 Subject</div>
          {SUBJECTS.map(sub=>{
            const count=notes.filter(n=>n.subject===sub&&(!filterClass||n.className===filterClass)).length;
            if(!count) return null;
            const sc=SUBJECT_COLORS[sub];
            return <button key={sub} onClick={()=>{setFilterSubject(filterSubject===sub?null:sub);setFilterChapter(null);setSidebar(false);}} style={{display:"flex",width:"100%",justifyContent:"space-between",alignItems:"center",background:filterSubject===sub?sc+"33":"none",border:"none",borderRadius:10,padding:"7px 12px",color:filterSubject===sub?"white":"rgba(255,255,255,0.55)",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"0.82rem",cursor:"pointer",marginBottom:2}}>
              <span style={{display:"flex",alignItems:"center",gap:8}}><span style={{width:8,height:8,borderRadius:"50%",background:sc,display:"inline-block"}}/>{sub}</span>
              <span style={{opacity:0.4,fontSize:"0.75rem"}}>{count}</span>
            </button>;
          })}
          {availableChapters.length>0&&<>
            <div style={{fontSize:"0.6rem",fontWeight:900,letterSpacing:1.5,opacity:0.3,padding:"10px 4px 6px",textTransform:"uppercase"}}>📖 Chapter</div>
            {availableChapters.map(ch=>{
              const count=notes.filter(n=>n.chapter===ch&&(!filterClass||n.className===filterClass)&&(!filterSubject||n.subject===filterSubject)).length;
              return <button key={ch} onClick={()=>{setFilterChapter(filterChapter===ch?null:ch);setSidebar(false);}} style={{display:"flex",width:"100%",justifyContent:"space-between",alignItems:"center",background:filterChapter===ch?"rgba(255,255,255,0.12)":"none",border:"none",borderRadius:10,padding:"7px 12px",color:filterChapter===ch?"white":"rgba(255,255,255,0.55)",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"0.82rem",cursor:"pointer",marginBottom:2}}>
                <span>📖 {ch}</span><span style={{opacity:0.4,fontSize:"0.75rem"}}>{count}</span>
              </button>;
            })}
          </>}
        </div>
        <div style={{padding:"14px 20px",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
          <button onClick={()=>signOut(auth)} style={{width:"100%",background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"9px",color:"#fca5a5",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"0.82rem",cursor:"pointer"}}>🚪 Sign Out</button>
        </div>
      </aside>

      {sidebar&&<div onClick={()=>setSidebar(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:199}}/>}

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        <header style={{background:"var(--header-bg)",backdropFilter:"blur(14px)",borderBottom:"1.5px solid var(--border)",padding:"12px 16px",position:"sticky",top:0,zIndex:100,display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setSidebar(s=>!s)} style={{background:"none",border:"1.5px solid var(--border)",borderRadius:10,padding:"7px 10px",cursor:"pointer",fontSize:16,color:"var(--ink)"}}>☰</button>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:"1.4rem",color:"var(--ink)",letterSpacing:-0.5,lineHeight:1}}>MyNotes</div>
              <div style={{fontSize:"0.67rem",color:"var(--muted)",fontWeight:700}}>
                {filtered.length} notes
                {filterClass&&<span style={{color:"var(--accent)"}}> · {filterClass}</span>}
                {filterSubject&&<span style={{color:SUBJECT_COLORS[filterSubject]}}> · {filterSubject}</span>}
                {filterChapter&&<span style={{color:"var(--accent)"}}> · {filterChapter}</span>}
                {filterImportant&&<span style={{color:"#F59E0B"}}> · ⭐</span>}
              </div>
            </div>
            <button onClick={()=>setDark(d=>!d)} style={{background:dark?"rgba(255,255,255,0.1)":"var(--border)",border:"none",borderRadius:20,padding:"6px 12px",cursor:"pointer",fontSize:15,lineHeight:1,transition:"all 0.2s"}}>{dark?"☀️":"🌙"}</button>
            <img src={user.photoURL} alt="" style={{width:32,height:32,borderRadius:"50%",border:"2px solid var(--border)",cursor:"pointer"}} onClick={()=>setSidebar(s=>!s)}/>
          </div>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none"}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search karo..."
              style={{width:"100%",border:"1.5px solid var(--border)",borderRadius:14,padding:"8px 36px",fontFamily:"'Syne',sans-serif",fontSize:"0.88rem",background:"var(--input-bg)",outline:"none",color:"var(--ink)"}}
              onFocus={e=>e.target.style.borderColor="var(--accent)"}
              onBlur={e=>e.target.style.borderColor="var(--border)"}
            />
            {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:18,color:"var(--muted)"}}>×</button>}
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            <button onClick={()=>{setFilterClass(null);setFilterSubject(null);setFilterChapter(null);setFilterImportant(false);}} style={{background:!filterClass&&!filterSubject&&!filterImportant?"var(--ink)":"var(--input-bg)",color:!filterClass&&!filterSubject&&!filterImportant?"white":"var(--muted)",border:"1.5px solid var(--border)",borderRadius:20,padding:"4px 11px",fontSize:"0.71rem",fontWeight:800,cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>All</button>
            <button onClick={()=>setFilterImportant(f=>!f)} style={{background:filterImportant?"#F59E0B":"var(--input-bg)",color:filterImportant?"white":"#F59E0B",border:"1.5px solid #F59E0B",borderRadius:20,padding:"4px 11px",fontSize:"0.71rem",fontWeight:800,cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>⭐ Important</button>
            {CLASSES.map(cls=>notes.some(n=>n.className===cls)&&(
              <button key={cls} onClick={()=>{setFilterClass(filterClass===cls?null:cls);setFilterChapter(null);}} style={{background:filterClass===cls?"var(--ink)":"var(--input-bg)",color:filterClass===cls?"white":"var(--ink)",border:"1.5px solid var(--border)",borderRadius:20,padding:"4px 11px",fontSize:"0.71rem",fontWeight:800,cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>🏫 {cls}</button>
            ))}
            {SUBJECTS.map(sub=>{
              const sc=SUBJECT_COLORS[sub];
              if(!notes.some(n=>n.subject===sub)) return null;
              return <button key={sub} onClick={()=>{setFilterSubject(filterSubject===sub?null:sub);setFilterChapter(null);}} style={{background:filterSubject===sub?sc:"var(--input-bg)",color:filterSubject===sub?"white":sc,border:`1.5px solid ${sc}`,borderRadius:20,padding:"4px 11px",fontSize:"0.71rem",fontWeight:800,cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>📚 {sub}</button>;
            })}
            {filterSubject&&availableChapters.map(ch=>(
              <button key={ch} onClick={()=>setFilterChapter(filterChapter===ch?null:ch)} style={{background:filterChapter===ch?SUBJECT_COLORS[filterSubject]:"var(--input-bg)",color:filterChapter===ch?"white":SUBJECT_COLORS[filterSubject],border:`1.5px solid ${SUBJECT_COLORS[filterSubject]}88`,borderRadius:20,padding:"4px 11px",fontSize:"0.71rem",fontWeight:800,cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>📖 {ch}</button>
            ))}
          </div>
        </header>

        <main style={{flex:1,padding:"16px 14px",maxWidth:900,margin:"0 auto",width:"100%"}}>
          {loading?(
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",paddingTop:80,flexDirection:"column",gap:16}}>
              <div style={{width:40,height:40,border:"3px solid var(--border)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
              <p style={{color:"var(--muted)",fontWeight:700}}>Load ho rahi hain...</p>
            </div>
          ):filtered.length===0?(
            <div style={{textAlign:"center",padding:"70px 20px"}}>
              <div style={{fontSize:56,marginBottom:14}}>📒</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:"1.4rem",color:"var(--ink)",marginBottom:10}}>
                {search?"Koi note nahi mila":"Koi note nahi!"}
              </div>
              {!search&&<button onClick={openNew} style={{marginTop:20,background:"var(--ink)",color:"white",border:"none",borderRadius:14,padding:"11px 26px",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"0.95rem",cursor:"pointer"}}>＋ Note Banao</button>}
            </div>
          ):(
            <div style={{columnCount:2,columnGap:12}}>
              {filtered.map(note=><NoteCard key={note.id} note={note} onEdit={openEdit} onRead={openRead} dark={dark}/>)}
            </div>
          )}
        </main>
      </div>

      <button onClick={openNew} style={{position:"fixed",bottom:26,right:20,width:56,height:56,background:"linear-gradient(135deg,var(--ink),#2d2d4e)",color:"white",border:"none",borderRadius:"50%",fontSize:26,cursor:"pointer",boxShadow:"0 6px 28px rgba(26,26,46,0.35)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.2s"}}
        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.12)"}
        onMouseLeave={e=>e.currentTarget.style.transform=""}>＋</button>

      {readNote&&<ReadMode note={readNote} onClose={()=>setReadNote(null)} onEdit={note=>{setReadNote(null);openEdit(note);}} dark={dark}/>}
      {editorOpen&&<NoteEditor note={editNote} user={user} onClose={()=>{setEditorOpen(false);setEditNote(null);}} dark={dark}/>}
    </div>
  );
}
