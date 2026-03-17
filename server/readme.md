# 🌀 VORTEX — Complete Backend Roadmap
> No code. Pure mapping. Follow this to finish the project alone.

---

## 📦 Backend Folder Structure

```
vortex/
├── server/
│   ├── index.js              ← Entry point, starts Express + Socket.io
│   ├── rooms.js              ← Room creation, joining, leaving logic
│   ├── leader.js             ← Leader transfer logic
│   └── config.js             ← Port, CORS settings, constants
│
├── src/
│   └── lib/
│       ├── socket.js         ← Socket.io client setup (frontend connects here)
│       ├── peer.js           ← PeerJS client setup (WebRTC P2P)
│       └── utils.js          ← formatBytes, formatTime, generateRoomId helpers
│
└── package.json              ← Add server dependencies here
```

---

## 🧱 What Each Server File Does

### `server/index.js`
- Starts an Express HTTP server
- Attaches Socket.io to that server
- Imports and uses rooms.js and leader.js
- Listens on a PORT (e.g. 3001)
- Sets up CORS so your frontend (localhost:5173) can talk to it

### `server/rooms.js`
- Keeps a Map in memory: `rooms = Map { roomId → [user1, user2] }`
- Handles these socket events:
  - `join-room` → add user to room, tell the other person
  - `leave-room` → remove user, tell the other person
  - `disconnect` → same as leave-room, auto fires when browser closes
- Each user object looks like: `{ socketId, username, isLeader }`

### `server/leader.js`
- Handles these socket events:
  - `transfer-leader` → change who is leader in the room map
  - `request-leader` → forward the request to the current leader
  - `accept-leader-request` → trigger the actual transfer

### `server/config.js`
- PORT = 3001
- CORS origin = 'http://localhost:5173'
- MAX_ROOM_SIZE = 2 (only 2 people per wormhole)

---

## 📡 Socket.io Events — Complete Map

> This is the contract between frontend and backend.
> Left side = who emits it. Right side = who receives it.

### Room Events
```
FRONTEND emits           →  SERVER receives & broadcasts
─────────────────────────────────────────────────────────
join-room                →  server adds to room
  payload: { roomId, username }
  server emits back to room: 'friend-joined' { name, socketId }

leave-room               →  server removes from room
  payload: { roomId }
  server emits back to room: 'friend-left' { name }

disconnect (auto)        →  same as leave-room
```

### Video Sync Events
```
FRONTEND emits           →  SERVER receives & forwards to room
─────────────────────────────────────────────────────────────
video-play               →  forward to partner
  payload: { roomId, time }

video-pause              →  forward to partner
  payload: { roomId, time }

video-seek               →  forward to partner
  payload: { roomId, time }

video-sync-request       →  leader sends current time to partner
  payload: { roomId, time }
```

### Canvas / Ghostlines Events
```
canvas-stroke            →  forward to partner
  payload: { roomId, stroke, timeKey }

canvas-clear-frame       →  forward to partner
  payload: { roomId, timeKey }

canvas-clear-all         →  forward to partner
  payload: { roomId }
```

### Notepad Events
```
notepad-update           →  forward to partner
  payload: { roomId, text }
  NOTE: debounce this on frontend — emit only after 300ms of no typing
```

### Clipboard Events
```
clipboard-add            →  forward to partner
  payload: { roomId, item }
  item = { id, content, type, imageUrl, time, from }

clipboard-delete         →  forward to partner
  payload: { roomId, itemId }

clipboard-clear          →  forward to partner
  payload: { roomId }
```

### Leader Events
```
transfer-leader          →  update room map + forward to partner
  payload: { roomId, toSocketId }
  server emits to new leader: 'you-are-leader'
  server emits to old leader: 'you-are-member'

request-leader           →  forward to current leader
  payload: { roomId }
  server emits to leader: 'leader-requested' { fromName }

accept-leader-request    →  trigger transfer
  payload: { roomId }
```

### File Transfer (WebRTC only — server not involved)
```
File transfer goes DIRECTLY browser-to-browser via WebRTC DataChannel
Server only helps with the initial WebRTC handshake (signaling):

webrtc-offer             →  forward to partner
  payload: { roomId, offer }

webrtc-answer            →  forward to partner
  payload: { roomId, answer }

webrtc-ice-candidate     →  forward to partner
  payload: { roomId, candidate }
```

---

## 🔌 Frontend Wiring Map

> For each frontend file — what to add, where exactly

### `src/lib/socket.js`
- Create socket.io-client connection to server URL
- Export the socket instance
- All other files import from here

### `src/lib/peer.js`
- Create PeerJS instance (for WebRTC)
- Export the peer instance
- Used only by FileTransfer.jsx

### `src/pages/Base.jsx`
What to add:
- Import socket from lib/socket.js
- On mount: emit `join-room` with roomId + username
- Listen for `friend-joined` → setConnected(true), setFriendName()
- Listen for `friend-left` → setConnected(false), setFriendName('')
- Listen for `you-are-leader` → setIsLeader(true)
- Listen for `you-are-member` → setIsLeader(false)
- Listen for `leader-requested` → show notification to current leader
- On unmount: emit `leave-room`, disconnect socket
- Pass socket down as prop OR use React Context

### `src/components/player/VideoPlayer.jsx`
What to add:
- On play (if isLeader): emit `video-play` with current time
- On pause (if isLeader): emit `video-pause` with current time
- On seek (if isLeader): emit `video-seek` with current time
- Listen for `video-play` → set video time + play
- Listen for `video-pause` → set video time + pause
- Listen for `video-seek` → set video time only
- On mount: if not leader, emit `video-sync-request` to get current state

### `src/components/player/GhostlinesCanvas.jsx`
What to add:
- After every stroke saved to strokeMap: emit `canvas-stroke`
- On clear frame: emit `canvas-clear-frame`
- On clear all: emit `canvas-clear-all`
- Listen for `canvas-stroke` → add to local strokeMap + redraw
- Listen for `canvas-clear-frame` → delete that timeKey + redraw
- Listen for `canvas-clear-all` → clear map + redraw

### `src/components/shared/SharedNotepad.jsx`
What to add:
- On text change: debounce 300ms → emit `notepad-update`
- Listen for `notepad-update` → setText() BUT only if change is from partner
  (use a ref flag `isRemoteUpdate` to prevent echo loop)

### `src/components/shared/SharedClipboard.jsx`
What to add:
- On addItem: emit `clipboard-add` with the item
- On deleteItem: emit `clipboard-delete` with itemId
- On clear all: emit `clipboard-clear`
- Listen for all 3 → apply same change locally

### `src/components/transfer/FileTransfer.jsx`
What to add:
- Replace simulateTransfer() with real WebRTC DataChannel transfer
- Use peer.js (PeerJS) to open a DataChannel
- Split file into 256KB chunks
- Send each chunk over DataChannel
- Track progress by counting chunks sent vs total chunks
- Receiver: collect chunks → reassemble → trigger download via File System Access API

### `src/components/leader/TransferLeader.jsx`
What to add:
- On confirm transfer: emit `transfer-leader`
- On request crown: emit `request-leader`

---

## 🧰 Tech Stack To Learn

### 1. Node.js + Express
**What it is:** JavaScript runtime for backend. Express is a minimal web server.
**What you use it for:** Starting the server, setting up routes, serving the app.
**Topics to study:**
- Creating an Express server
- Middleware (cors, json)
- HTTP vs WebSocket

### 2. Socket.io
**What it is:** Library that makes real-time two-way communication easy.
**What you use it for:** All sync events (video, canvas, notepad, clipboard, leader)
**Topics to study:**
- `io.on('connection')` — new user connects
- `socket.join(roomId)` — put socket in a room
- `socket.to(roomId).emit()` — send to everyone in room except sender
- `socket.emit()` — send back to just this socket
- `socket.on('disconnect')` — user leaves
- Event payload structure (what data to send with each event)

### 3. WebRTC + PeerJS
**What it is:** Browser-to-browser direct connection. PeerJS is a wrapper that simplifies it.
**What you use it for:** File transfer (direct, no server involved after connection)
**Topics to study:**
- What is a DataChannel
- Offer / Answer / ICE candidate (the handshake)
- How PeerJS simplifies this into peer.connect()
- Sending binary data (ArrayBuffer) over DataChannel
- Reassembling chunks on the receiver side

### 4. File System Access API
**What it is:** Browser API that lets you write files directly to disk.
**What you use it for:** Writing received file chunks directly to disk (no memory limit)
**Topics to study:**
- `window.showSaveFilePicker()` — ask user where to save
- `FileSystemWritableFileStream` — write chunks as they arrive
- Why this is better than building a Blob in memory

### 5. React Context API
**What it is:** Way to share state across components without prop drilling.
**What you use it for:** Sharing socket + peer instances across all components.
**Topics to study:**
- `createContext()`
- `useContext()`
- Wrapping app in a Provider
- When to use Context vs props

### 6. React useRef + useEffect patterns
**What it is:** Already in your frontend but important to master for backend wiring.
**Topics to study:**
- Cleanup functions in useEffect (removing socket listeners on unmount)
- Using ref to store socket/peer without causing re-renders
- The echo loop problem in collaborative editing (how to prevent it)

---

## 🗺️ Build Order (Phase by Phase)

### Phase 1 — Server Foundation
```
1. Install: express, socket.io, cors  (in server/)
2. Build server/index.js              (start server on port 3001)
3. Build server/rooms.js              (join-room, leave-room, disconnect)
4. Build server/config.js             (PORT, CORS)
5. Test: open two browser tabs, both join same room, see friend-joined fire
```

### Phase 2 — Connect Frontend to Server
```
1. Build src/lib/socket.js            (connect to server)
2. Wire Base.jsx                      (join-room on mount, friend-joined listener)
3. Remove [Dev] simulate button       (replace with real socket event)
4. Test: open two tabs, real connection established
```

### Phase 3 — Video Sync
```
1. Wire VideoPlayer.jsx               (emit play/pause/seek if leader)
2. Wire VideoPlayer.jsx               (listen for play/pause/seek from partner)
3. Add leader guard                   (only leader can emit control events)
4. Test: two tabs, one controls video, other syncs
```

### Phase 4 — Leader System
```
1. Build server/leader.js             (transfer-leader, request-leader events)
2. Wire TransferLeader.jsx            (emit transfer-leader)
3. Wire Base.jsx                      (listen for you-are-leader / you-are-member)
4. Test: pass crown between two tabs, control switches
```

### Phase 5 — Ghostlines Sync
```
1. Wire GhostlinesCanvas.jsx          (emit strokes, listen for partner strokes)
2. Handle clear events                (frame clear + all clear)
3. Test: draw in one tab, appears in other at same timestamp
```

### Phase 6 — Notepad + Clipboard Sync
```
1. Wire SharedNotepad.jsx             (emit + listen, add debounce + echo prevention)
2. Wire SharedClipboard.jsx           (emit + listen for add/delete/clear)
3. Test: type in notepad tab 1, appears in tab 2
```

### Phase 7 — Real File Transfer (WebRTC)
```
1. Build src/lib/peer.js              (PeerJS setup)
2. Add WebRTC signaling to server     (forward offer/answer/ice-candidate)
3. Wire FileTransfer.jsx              (replace simulateTransfer with real chunks)
4. Implement File System Access API   (write to disk as chunks arrive)
5. Test: send a small file first, then large file
```

### Phase 8 — Polish + Deploy
```
1. Error handling                     (what if friend disconnects mid-transfer?)
2. Reconnection logic                 (socket.io auto-reconnect settings)
3. Room validation                    (what if room is full / doesn't exist?)
4. Deploy server to Railway or Fly.io
5. Deploy frontend to Vercel
6. Update socket URL to production URL
```

---

## ⚠️ Common Problems You Will Hit (And How To Think About Them)

### Echo Loop Problem (Notepad/Clipboard)
**Problem:** You type → emit to partner → partner receives → sets state →
their useEffect fires → they emit back → you receive → infinite loop.
**Solution:** Use a boolean ref `isRemoteUpdate`. Set it to true before
applying partner's change. In the emit effect, check if isRemoteUpdate
is true — if so, skip emitting. Reset ref after applying.

### Video Sync Drift
**Problem:** Partner's video is 0.5s behind due to network delay.
**Solution:** Include a timestamp of when you emitted. Partner adjusts
the seek target based on how long the message took to arrive.

### File Transfer Memory Limit
**Problem:** Collecting all chunks in an array before saving =
50GB game file = browser crashes.
**Solution:** Use File System Access API to write each chunk to disk
immediately as it arrives. Never hold the full file in RAM.

### DataChannel Max Message Size
**Problem:** WebRTC DataChannel has a max message size (~256KB in most browsers).
Sending larger chunks will fail silently.
**Solution:** Always chunk at 256KB or less. Never send a whole file at once.

### Room State Lost on Server Restart
**Problem:** Server stores rooms in a JavaScript Map (memory).
If server restarts, all room state is gone.
**Solution:** For now this is fine (sessions are temporary by design).
For production, use Redis to store room state.

### Two Tabs Same Browser = Same PeerJS ID
**Problem:** Testing with two tabs in same browser can cause PeerJS conflicts.
**Solution:** Always test with two different browsers (Chrome + Firefox)
or use Incognito as second tab.

---

## 🔐 Security Notes

- Room codes are 8 characters = 36^8 = ~2.8 trillion combinations. Enough.
- No auth needed — the room code IS the password.
- All file data goes P2P — server never sees file contents.
- Notepad/clipboard data goes through server — keep this in mind.
- For production: add rate limiting to socket events to prevent spam.
- Never store any user data — when socket disconnects, delete everything.

---

## 📚 Resource Map (What To Search/Learn)

```
Topic                    Search / Resource
──────────────────────────────────────────────────────
Express server setup  →  "express.js getting started"
Socket.io rooms       →  "socket.io rooms and namespaces"
Socket.io + React     →  "socket.io react useEffect cleanup"
WebRTC basics         →  "WebRTC for beginners MDN"
PeerJS file transfer  →  "PeerJS DataChannel file transfer"
File System Access    →  "File System Access API MDN showSaveFilePicker"
React Context         →  "React useContext tutorial"
Debounce in React     →  "debounce useEffect React"
Echo loop fix         →  "collaborative editing react socket echo prevention"
Deploy Node server    →  "deploy express socket.io Railway"
Deploy Vite frontend  →  "deploy vite react Vercel"
```

---

## ✅ Definition of "Done" For Each Feature

```
Feature              Done when...
────────────────────────────────────────────────────────────────────
Room connection    → Two real browsers connect, overlay disappears
Video sync         → Play in browser A, plays at same time in browser B
Leader system      → Crown passes, only new leader can control video
Ghostlines sync    → Draw in A, appears in B at same video timestamp
Notepad sync       → Type in A, appears in B within 300ms
Clipboard sync     → Add item in A, appears in B instantly
File transfer      → Send 1GB file, B receives and can save it to disk
Large file (50GB)  → Send 50GB file, B writes to disk chunk by chunk, no crash
```

---

*This file is your single source of truth.*
*Frontend is done. Follow phases 1-8 to finish the project.*
*You have everything you need.*