# 🌀 Vortex

Vortex is a private, real-time peer-to-peer (P2P) collaboration and media sharing workspace for two users. It allows instant file transfer, synchronized video playback with a drawing overlay, and collaborative notes/clipboard syncing.

The project is structured as a monorepo consisting of a React-based frontend client (`vortex`) and a Node.js signaling server (`server`).

## Features

- **P2P File Transfer:** Direct browser-to-browser secure file transfer using WebRTC (via PeerJS).
- **Synchronized Video Player:** Watch video files together with synchronized play, pause, seek controls, and a playlist manager.
- **Ghostlines Canvas:** Draw directly on top of the video player in real time.
- **Collaborative Notepad:** A shared text area that synchronizes keystrokes instantly between peers.
- **Shared Clipboard:** Quickly exchange text snippets, links, or commands.
- **Automatic Signaling & Room Management:** Rooms are limited to exactly 2 users, managed via Socket.io with room ownership/leader transfer logic.

---

## Tech Stack

### Frontend (`/vortex`)
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Lucide Icons
- **Real-time Sync:** Socket.io-client
- **P2P Transfer:** PeerJS (WebRTC)
- **Routing:** React Router DOM

### Backend (`/server`)
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express
- **Real-time Engine:** Socket.io
- **Databases:** PostgreSQL (pg) & MongoDB (Mongoose) *(configured/available for persistence if needed)*

---

## Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Setup Backend Server
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (if you need database features or custom configuration):
   ```env
   PORT=3001
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:3001`.

### 3. Setup Frontend Client
1. Navigate to the `vortex` directory:
   ```bash
   cd vortex
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## How It Works

1. **Room Creation:** A user opens the app, enters their username, and clicks **Create Wormhole**. This generates a unique 8-character room ID (e.g., `A1B2C3D4`).
2. **Room Joining:** The user shares the code with a peer, who enters the code on the landing page to join the room.
3. **P2P Setup:** Once both users are in the same room, the Socket.io server coordinates connection handshakes. For file transfer, the browser initializes a direct PeerJS connection, ensuring files are sent directly and do not touch the server.
4. **Co-Watching & Control:** The first user acts as the leader. Leadership can be transferred between peers to give control over playlist choices and timeline seeking.
