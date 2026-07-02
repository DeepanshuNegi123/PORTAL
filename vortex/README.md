# 🌀 Vortex Frontend Client

This is the React client for Vortex, built with Vite, Tailwind CSS, React Router, Socket.io-client, and PeerJS.

## Folder Structure

```
vortex/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx          # Left panel navigation
│   │   │   └── TopBar.jsx           # Room info, status, leaving control
│   │   ├── leader/
│   │   │   # Components for peer-to-peer room ownership management
│   │   ├── player/
│   │   │   ├── FileDropZone.jsx     # Handles user media drag-and-drop
│   │   │   ├── PlayerControls.jsx   # Custom play/pause/seek controls
│   │   │   ├── Playlist.jsx         # Track lists for shared viewing
│   │   │   └── VideoPlayer.jsx      # Video player frame
│   │   ├── shared/
│   │   │   ├── SharedClipboard.jsx  # Shared clipboard UI
│   │   │   └── SharedNotepad.jsx    # Real-time note collaboration editor
│   │   ├── transfer/
│   │   │   ├── FileHistory.jsx      # Historical log of files transferred
│   │   │   ├── FileTransfer.jsx     # WebRTC file transfer trigger panel
│   │   │   └── TransferProgress.jsx # Progress indicators for active files
│   │   └── wormhole/
│   │       ├── ConnectionStatus.jsx # Connection validation label
│   │       └── RoomCode.jsx         # Code presentation/copier
│   ├── pages/
│   │   ├── Base.jsx                 # Central workspace containing panels
│   │   ├── Landing.jsx              # Landing page (room creator/joiner)
│   │   └── NotFound.jsx             # 404 page
│   ├── App.jsx                      # Client router setup
│   └── main.jsx                     # Vite entry script
```

## Features Implemented
1. **P2P Transfer:** Custom WebRTC file transfer using PeerJS directly between clients.
2. **Synchronized Video Playback:** Load custom video files, build a local playlist, and sync timeline seeking, playback state, and actions between room peers.
3. **Shared Notepad:** A basic text editor synchronizing content change via socket connections.
4. **Shared Clipboard:** Instantly share snippets, links, and notes.

## Run Client
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start in development mode:
   ```bash
   npm run dev
   ```