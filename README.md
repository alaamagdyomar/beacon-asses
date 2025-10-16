# ttt-realtime (Step 0 — Fixed Project Skeleton)

This is the corrected Step 0 skeleton with:
- Server on **CommonJS** (ts-node + nodemon friendly on Windows)
- Client using Vite + React + TS with the React plugin
- LF line endings enforced (cross-OS safe)

## Structure
```
ttt-realtime/
  server/   # Node.js (Express + Socket.IO) — boots via ts-node
  client/   # React + Vite (TypeScript) — boots via vite
  .gitattributes / .editorconfig / .prettierrc  # enforce LF
```

## Run
```
# terminal 1
cd server
cp .env.example .env
npm install
npm run dev

# terminal 2
cd ../client
npm install
npm run dev
```
# beacon-asses
