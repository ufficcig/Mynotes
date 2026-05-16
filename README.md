# 📒 MyNotes

Math (KaTeX) + JSON files + Google Login + Firebase Cloud Sync

## ✨ Features
- Google Sign In
- KaTeX Math → `$inline$` aur `$$block$$`
- JSON file upload/paste → Firestore mein FREE save
- Tags, Search, Pin
- Real-time cloud sync
- Sidebar with tag filters

---

## 🚀 Setup & Deploy

### Step 1 — Install karo
```bash
npm install
npm install --save-dev gh-pages
```

### Step 2 — Local test karo
```bash
npm start
```
`http://localhost:3000` pe khulega ✅

### Step 3 — GitHub pe push karo
```bash
git init
git add .
git commit -m "MyNotes update"
git branch -M main
git remote add origin https://github.com/ufficcig/Mynotes.git
git push -u origin main --force
```

### Step 4 — Deploy karo
```bash
npm run deploy
```

### Step 5 — GitHub Pages enable karo
Repository → Settings → Pages → Source: `gh-pages` → Save

**Live URL:** https://ufficcig.github.io/Mynotes 🎉

---

## 🔥 Firebase Console mein karna hai

### Firestore Rules update karo:
Firestore → Rules → Edit → `firestore.rules` file ka content paste karo → Publish

### Authorized domain add karo:
Authentication → Settings → Authorized domains → Add:
`ufficcig.github.io`

---

## 📐 KaTeX Examples
```
Inline:  $E = mc^2$
Block:   $$\int_0^\infty e^{-x}\,dx = 1$$
         $$\frac{-b \pm \sqrt{b^2-4ac}}{2a}$$
         $$\sum_{n=1}^\infty \frac{1}{n^2} = \frac{\pi^2}{6}$$
```
