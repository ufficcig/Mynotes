// src/components/Auth.js
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export default function Auth() {
  const login = async () => {
    try { await signInWithPopup(auth, googleProvider); }
    catch (e) { console.error(e); }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--paper)",
      flexDirection: "column",
      gap: 0,
      animation: "fadeIn 0.6s ease",
    }}>
      {/* Big decorative background text */}
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        fontSize: "clamp(80px,20vw,200px)",
        fontFamily: "'Instrument Serif', serif",
        fontStyle: "italic",
        color: "rgba(26,26,46,0.04)",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        userSelect: "none",
        letterSpacing: -4,
      }}>notes</div>

      <div style={{
        background: "white",
        border: "1.5px solid var(--border)",
        borderRadius: 24,
        padding: "52px 48px",
        maxWidth: 420,
        width: "90%",
        boxShadow: "var(--shadow-lg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
        animation: "fadeUp 0.5s ease",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Logo mark */}
        <div style={{
          width: 64, height: 64,
          background: "var(--ink)",
          borderRadius: 18,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28,
        }}>📒</div>

        <div style={{ textAlign: "center" }}>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "2rem",
            fontWeight: 900,
            color: "var(--ink)",
            letterSpacing: -1,
            lineHeight: 1.1,
          }}>MyNotes</h1>
          <p style={{
            color: "var(--muted)",
            marginTop: 8,
            fontSize: "0.92rem",
            lineHeight: 1.6,
          }}>
            Math, images, PDFs — sab kuch ek jagah.<br/>
            Cloud mein safe, kabhi nahi khota.
          </p>
        </div>

        <button
          onClick={login}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--ink)",
            color: "white",
            border: "none",
            borderRadius: 14,
            padding: "14px 28px",
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: "0.97rem",
            cursor: "pointer",
            width: "100%",
            justifyContent: "center",
            transition: "transform 0.15s, box-shadow 0.15s",
            boxShadow: "0 4px 20px rgba(26,26,46,0.2)",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(26,26,46,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,26,46,0.2)"; }}
        >
          {/* Google SVG icon */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google se Sign In karo
        </button>

        <p style={{ fontSize: "0.75rem", color: "var(--muted)", textAlign: "center", lineHeight: 1.5 }}>
          Sign in karke aap agree karte ho ki aapka data<br/>
          securely Firebase mein store hoga 🔒
        </p>
      </div>
    </div>
  );
}
