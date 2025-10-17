# Project Phases Documentation

## Phase 0 — Infrastructure & Environment Setup

**Goal:** establish the core project skeleton and ensure both environments (server & client) are production-grade ready for development.

**Key Decisions & Achievements:**

- Created a monorepo-style root folder with separate `/server` and `/client` directories.
- Initialized each side independently (`npm init -y`) to keep clear dependency boundaries.
- Added TypeScript, tsconfig.json, and Nodemon for runtime hot-reload.
- Configured ESLint + Prettier for code consistency and quality gates.
- Verified successful local builds and hot reload.

**Architectural purpose:**
Lay a foundation that mirrors a real-world full-stack app: backend isolated for APIs and sockets, frontend for presentation. This makes scalability and deploy separation easier later.

---

## Phase 1 — Database Layer & REST API Foundation

**Goal:** design persistent storage, define data schema, and expose the first API endpoints.

**Key Decisions & Achievements:**

- Chose PostgreSQL as relational DB for reliability and transaction safety.
- Introduced Prisma ORM, enabling type-safe database access.
- Defined the initial `Game` model (players, winner, timestamps).
- Ran first migration and seeded sample data.
- Implemented `/api/games` GET route to retrieve last 50 games.
- Verified connection between Express → Prisma → PostgreSQL end-to-end.

**Architectural purpose:**
Ensure the backend is data-driven and easily extendable. This API becomes the base for the MainPage game list and for persisting match history.

---

## Phase 2 — Real-Time Communication Layer

**Goal:** enable bi-directional real-time updates between players and the backend.

**Key Decisions & Achievements:**

- Integrated Socket.IO on both server (IOServer) and client (socket.io-client).
- Exposed socket events: connection, joinRoom, playerMove, and gameOver.
- Linked socket flow with Express server instance for shared CORS and port.
- Implemented custom React hook `useSocket.ts` to manage connection lifecycle.
- Built minimal GamePage UI to test connectivity and event emission.
- Confirmed stable two-way communication and live event logs in both browser and terminal.

**Architectural purpose:**
Transform the static REST architecture into a reactive real-time system. This ensures instant move synchronization between players and enables the future live-update of the “past games” list.

---

## Current Technical State (End of Phase 2)

- Backend: Express + Prisma + Socket.IO fully functional.
- Database: PostgreSQL seeded and connected.
- Frontend: React 18 + Vite + TypeScript app with working socket connection.
- Communication verified across tabs (joinRoom, playerMove, gameOver).
- Ready for Phase 3 — implementing interactive gameplay + shared state.
