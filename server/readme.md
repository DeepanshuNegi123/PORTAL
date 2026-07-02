# 🌀 Vortex Backend Server

This is the Node.js signaling and room management backend server for the Vortex client. It manages rooms, coordinates connection handshakes, and manages host ownership state.

## Folder Structure

```
server/
├── app.js            # Express app configuration & middlewares
├── server.js         # Entry point, listens on HTTP port and launches Socket.io
├── socketconn.js     # Connection and room-specific socket handlers
├── leader.js         # Room leadership transfer/request handlers
├── db.js             # Mongo database connection configuration
├── config.js         # Base configurations
└── package.json      # Node.js dependencies
```

## Handled Socket.io Events

### Room Management
- `join-room`: Assigns peer connection to room, broadcasts join update (`friend-joined`).
- `disconnect` / `leave-room`: Removes socket context from memory, informs peer (`friend-left`).

### Leader Controls
- `transfer-leader`: Voluntarily hands leader controls to room partner.
- `request-leader`: Requests ownership from room partner.
- `accept-leader-request`: Confirms and executes ownership handoff.

### Shared Workspace Controls
- `video-play` / `video-pause` / `video-seek`: Forwards player actions to synchronized viewer.
- `video-sync-request`: Asks the room partner for the current player timestamp.
- `notepad-update`: Broadcasts updated text modifications.
- `clipboard-update`: Updates clipboard items.

## Setup & Run
1. Install server packages:
   ```bash
   npm install
   ```
2. Start server in development mode:
   ```bash
   npm run dev
   ```