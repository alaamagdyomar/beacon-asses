# Tic-Tac-Toe Realtime — Full-Stack Assessment

> React + Vite + TypeScript + Tailwind • Node/Express + Socket.IO • PostgreSQL + Prisma

## 1) Quick Start (recommended local setup)

### Prerequisites

- **Node** ≥ 20.19 (use `nvm use 20` if possible)
- **PostgreSQL** running locally (default port `5432`)
- **npm** (or pnpm/yarn if you prefer)

### 1.1 Clone

```bash
git clone <YOUR_REPO_URL>
cd Beacon-task
```

### 1.2 Server (API + Realtime)

```bash
cd server
cp .env.example .env               # edit if needed
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ttt?schema=public

npm install
npx prisma migrate dev --name init # applies schema
# optional seed: npm run seed
npm run dev                        # serves on http://localhost:4000
```

Verify:

- Health: `http://localhost:4000/health` → `{ ok: true }`
- (Later, after playing a game) `http://localhost:4000/api/games` → JSON list

### 1.3 Client (UI)

```bash
cd ../client
cp .env.example .env
# VITE_API_URL=http://localhost:4000/api
# VITE_SOCKET_URL=http://localhost:4000

npm install
npm run dev                        # opens http://localhost:5173
```

> The frontend uses a **lazy socket**: it connects only when you **Create Room** (not on page load).

---

## 2) How to Use

1. Open the app at `http://localhost:5173`.
2. Click **Create Room** (Player **X**). Copy the room ID shown.
3. Open a **second tab** and click **Join Room**, paste the room ID (Player **O**).
4. Play! The board disables automatically when it’s not your turn. When the game ends, results are persisted; the **Past Games** table shows recent games.

---

## 3) Project Overview

### 3.1 System Design (high-level)

```
┌───────────────┐      HTTP (REST)      ┌───────────────────────────┐
│   Client      ├──────────────────────►│  Express API (server)     │
│  React/Vite   │   /api/games, /:id    │  /api/games, /games/:id   │
│  Tailwind     │◄──────────────────────┤  Prisma -> PostgreSQL      │
│  Socket.IO    │     JSON responses    └──────────┬────────────────┘
│ (lazy connect)│                                  │
│               │       WebSocket (Socket.IO)      │
│               ├──────────────────────────────────┤
└───────────────┘                                  │
                                                   ▼
                                          ┌────────────────┐
                                          │ PostgreSQL +   │
                                          │ Prisma schema  │
                                          │ Game / Move    │
                                          └────────────────┘
```

- **Realtime:** In-memory room state (board, players, turn, winner). Persist **game metadata** and **moves** via Prisma.
- **Board authority:** Server validates moves, determines winners, broadcasts state.
- **Client UX:** Minimal state; subscribes to `gameState` events; enables/disables board based on role/turn.

### 3.2 Data Model (Prisma)

- **Game**: `id`, `roomId (unique)`, `player1`, `player2`, `winner`, `createdAt`, `updatedAt`, `moves` (relation)
- **Move**: `id`, `gameId` (FK), `index` (0–8), `player` (`X|O`), `createdAt`

---

## 4) Repository Layout

```
root/
├─ README.md
├─ server/
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  └─ migrations/
│  ├─ src/
│  │  ├─ index.ts              # Express + Socket.IO bootstrap
│  │  ├─ routes/games.ts       # REST: /api/games, /api/games/:id
│  │  ├─ db/prisma.ts          # Prisma client (singleton)
│  │  ├─ socket/
│  │  │  ├─ index.ts           # registerSocketHandlers()
│  │  │  └─ logic.ts           # room state, move validation, events
│  │  └─ types/                # shared server TS types (socket payloads, etc.)
│  └─ package.json
└─ client/
   ├─ src/
   │  ├─ app/                  # App shell, router, layout, global styles
   │  ├─ features/             # Feature modules (MainPage, GamePage, GameBoard)
   │  ├─ components/           # Presentational components (ConnectionStatus, ...)
   │  ├─ hooks/                # useSocket (lazy singleton), others
   │  ├─ lib/                  # axios client, helpers
   │  ├─ types/                # domain types (Game, Move, board, etc.)
   │  └─ test/                 # unit/integration tests + mocks/setup
   ├─ vite.config.ts, tsconfig*.json, eslint.config.js, tailwind setup
   └─ package.json
```

---

## 5) Scripts & Tooling

**Server**

- `npm run dev` — start Express + Socket.IO with Nodemon/ts-node
- `npx prisma migrate dev --name <msg>` — create/apply migration
- `npx prisma studio` — DB UI
- `npm run seed` — optional seed script (if present)

**Client**

- `npm run dev` — Vite dev server
- `npm run test` — Vitest (unit tests; includes socket mocks)
- `npm run lint` — ESLint (flat config; React hooks rules; Prettier compatible)
- `npm run format` — Prettier write

---

## 6) Runtime Logic (brief)

- **Create Room**  
  Client calls `socket.emit('createRoom', ...)`.  
  Server:
  - Generates `roomId`, persists a `Game` row, assigns Player **X** to creator.
  - Joins socket to room; emits initial `gameState` (with `youAre: "X"`).
- **Join Room**  
  Second client calls `joinRoom(roomId)`.  
  Server:
  - Validates capacity (max 2 players), assigns **O**, updates `Game`.
  - Emits `gameState` to both sockets, each with a personalized `youAre`.
- **Move**  
  Client emits `playerMove({ roomId, cellIndex, player })`.  
  Server:
  - Validates sender role and turn; updates board; checks winner; persists `Move` (and `Game.winner` if end).
  - Broadcasts `gameState` to room.
- **Past Games**  
  Client fetches `/api/games` for the table; can fetch `/api/games/:id` for details (moves).

---

## 7) Testing

- **Client unit/integration** with **Vitest**:
  - `src/test/unit` — `useSocket`, `GameBoard`, helpers
  - `src/test/integration` — UI behavior of board
  - Socket.IO is **fully mocked**; no network is required to run tests.
- Run:
  ```bash
  cd client
  npm run test
  ```

---

## 8) Troubleshooting

- **Windows & Prisma**: If you hit EPERM/rename issues, close all VS Code terminals and run commands in a fresh PowerShell/CMD window.
- **Two connections on server start**: This can happen with React StrictMode double-effect in dev. We use a **lazy socket** on the client to avoid connecting until the user creates/joins a room.
- **Node engine warnings** (Vite/React plugin): upgrade Node to **≥ 20.19**.

---

## 9) Development Phases (summary)

- **Phase 0 – Tooling/Infra**: Vite + React + TS, Tailwind, ESLint/Prettier; Express/Socket.IO; Prisma init.
- **Phase 1 – DB/API**: PostgreSQL schema, migrations, Prisma client; `/api/games` (list), `/api/games/:id` (details).
- **Phase 2 – UI Baseline**: MainPage (past games), GamePage skeleton, Tailwind layout/components.
- **Phase 3 – Realtime Gameplay**: create/join rooms, validated moves, winner detection, persisted moves, lazy socket.
- **Phase 4 – Client Tests**: unit tests for `useSocket`, `GameBoard`; mocking Socket.IO; stable CI-friendly suite.

---

## 10) Optional: Docker (future enhancement) **local setup above is recommended**.
