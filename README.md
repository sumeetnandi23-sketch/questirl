# ⚔️ QuestIRL

**Real Life. Quest Mode.**

Gamify your daily life — complete quests, defeat enemies, level up with friends.

## Deploy to Vercel (fastest)

```bash
# 1. Install dependencies
npm install

# 2. Test locally
npm run dev
# Open http://localhost:3000 on your phone (same WiFi)

# 3. Deploy
npx vercel
# Follow the prompts. You'll get a URL like questirl.vercel.app
```

## Deploy to Netlify

```bash
npm run build
# Upload the `.next` folder, or connect your GitHub repo
```

## Add to Home Screen (PWA)

Once deployed, open the URL on your phone:
- **iPhone**: Safari → Share → "Add to Home Screen"
- **Android**: Chrome → Menu → "Add to Home Screen"

This gives you the full-screen app experience with no browser chrome.

## Multiplayer / Party System

Right now, party data is stored in localStorage (each device).
To enable real cross-device multiplayer, you'll need to add a backend.

**Recommended: Firebase Realtime Database (free tier)**
1. Create a Firebase project
2. Add `firebase` package
3. Swap the `db.joinParty` and `db.partyMembers` functions to read/write from Firebase

The app is already structured for this — the `db` object in `QuestIRL.js` is the only thing that needs to change.

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Pure CSS animations (no external UI libs)
- Press Start 2P + Silkscreen fonts
- Canvas-based starfield
- localStorage for persistence

## Project Structure

```
questirl/
├── app/
│   ├── layout.js          # Root layout, fonts, PWA meta
│   ├── globals.css         # Global styles + animations
│   ├── page.js             # Entry point
│   └── QuestIRL.js         # Main game component
├── public/
│   └── manifest.json       # PWA manifest
├── package.json
└── next.config.js
```
