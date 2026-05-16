# 📒 MyNotes

> Math (KaTeX) + Images + PDFs + JSON — sab ek jagah. Firebase se powered, Google login ke saath.

## ✨ Features

- **Google Sign In** — ek click mein login
- **KaTeX Math** — `$inline$` aur `$$block$$` math render hoti hai
- **File Upload** — Images, PDFs, JSON, any file attach karo
- **Real-time Sync** — Firestore se instant update, kisi bhi device pe
- **Tags & Search** — notes filter aur search karo
- **Pin Notes** — important notes upar rakho
- **Offline-ready** — Firestore caching se kaam karta hai

---

## 🚀 Local Setup (apne computer pe chalao)

### Step 1 — Node.js install karo
Download: https://nodejs.org (LTS version)

### Step 2 — Project clone/download karo
```bash
# Ya ZIP download karke extract karo
cd mynotes
```

### Step 3 — Dependencies install karo
```bash
npm install
```

### Step 4 — App chalao
```bash
npm start
```
Browser mein `http://localhost:3000` khul jayega ✅

---

## 🌐 GitHub Pages pe Deploy karo (FREE hosting)

### Step 1 — GitHub account banao
https://github.com/signup

### Step 2 — New repository banao
1. github.com pe jaao → `+` → `New repository`
2. Name: `mynotes`
3. Public rakho
4. `Create repository` click karo

### Step 3 — Code GitHub pe push karo
```bash
# Terminal mein project folder mein jaao
cd mynotes

git init
git add .
git commit -m "MyNotes first commit"
git branch -M main
git remote add origin https://github.com/TERA_USERNAME/mynotes.git
git push -u origin main
```

### Step 4 — gh-pages package install karo
```bash
npm install --save-dev gh-pages
```

### Step 5 — package.json mein ye add karo
```json
{
  "homepage": "https://TERA_USERNAME.github.io/mynotes",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

### Step 6 — Deploy!
```bash
npm run deploy
```

### Step 7 — GitHub Pages enable karo
1. Repository → Settings → Pages
2. Source: `gh-pages` branch
3. Save → 2-3 minute baad site live ho jayegi!

**URL:** `https://TERA_USERNAME.github.io/mynotes` 🎉

---

## 🔥 Firebase Setup (zaruri steps)

### 1. Firestore Database banao
Firebase Console → Build → Firestore Database → Create database → Start in test mode

### 2. Storage enable karo
Firebase Console → Build → Storage → Get started

### 3. Authentication enable karo
Firebase Console → Build → Authentication → Sign-in method → Google → Enable

### 4. Authorized domains add karo
Authentication → Settings → Authorized domains → Add domain:
- `localhost`
- `TERA_USERNAME.github.io`

### 5. Firestore Rules paste karo
Firestore → Rules → Edit → `firestore.rules` file ka content paste karo

### 6. Storage Rules paste karo
Storage → Rules → Edit → `storage.rules` file ka content paste karo

---

## 📱 Mobile pe kaise use karein
Apna GitHub Pages URL phone ke browser mein kholo — ye Progressive Web App ki tarah kaam karta hai!

---

## 🛠 Tech Stack
- React 18
- Firebase 10 (Firestore + Storage + Auth)
- KaTeX (math rendering)
- Pure CSS animations

Made with ❤️ by Lav
