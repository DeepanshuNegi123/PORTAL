# 🌀 VORTEX — Frontend Documentation
> Complete guide to understanding every file, every state, every flow

---

## 📁 Project Structure At A Glance

```
src/
├── pages/
│   ├── Landing.jsx          ← Home screen (create/join room)
│   ├── Base.jsx             ← Main app screen (THE core file)
│   └── NotFound.jsx         ← 404 page
│
├── components/
│   ├── layout/
│   │   ├── TopBar.jsx       ← Top navigation bar
│   │   └── Sidebar.jsx      ← Left icon sidebar
│   │
│   ├── wormhole/
│   │   ├── WormholePortal.jsx     ← Animated canvas waiting screen
│   │   ├── ConnectionStatus.jsx   ← "Waiting..." / "Connected" label
│   │   └── RoomCode.jsx           ← Room code display + copy buttons
│   │
│   ├── player/
│   │   ├── VideoPlayer.jsx        ← Main video player container
│   │   ├── PlayerControls.jsx     ← Play/pause/seek/volume bar
│   │   ├── FileDropZone.jsx       ← Drag & drop zone before video loads
│   │   ├── Playlist.jsx           ← Right sidebar playlist
│   │   └── GhostlinesCanvas.jsx   ← Drawing layer on top of video
│   │
│   ├── transfer/
│   │   ├── FileTransfer.jsx       ← File send/receive panel
│   │   ├── TransferProgress.jsx   ← Individual file transfer card
│   │   └── FileHistory.jsx        ← Session transfer history sidebar
│   │
│   ├── shared/
│   │   ├── SharedNotepad.jsx      ← Collaborative text editor
│   │   └── SharedClipboard.jsx    ← Shared clipboard panel
│   │
│   └── leader/
│       ├── LeaderBadge.jsx        ← Crown/member badge in sidebar
│       └── TransferLeader.jsx     ← Pass crown / request crown button
│
├── styles/
│   └── globals.css          ← Tailwind imports
│
├── App.jsx                  ← Router setup
└── main.jsx                 ← Entry point
```

---

## 🔄 App.jsx — The Router

```jsx
// App.jsx sets up 3 routes:
/           → Landing.jsx      (home page)
/base/:roomId → Base.jsx       (main app, roomId comes from URL)
*           → NotFound.jsx     (anything else)
```

**What `:roomId` means:**
When you create a room with code `A1B2C3D4`, the URL becomes `/base/A1B2C3D4`.
The `useParams()` hook inside `Base.jsx` reads this ID from the URL.
Both users navigate to the same URL → same room.

---

## 🏠 Landing.jsx — The Home Screen

### State it manages:
| State | Type | Purpose |
|-------|------|---------|
| `username` | string | What the user types as their name |
| `roomInput` | string | Room code typed when joining |
| `mode` | null / 'create' / 'join' | Which form is showing |
| `error` | string | Validation error message |

### Flow — Create Room:
```
User types name → clicks "Create Wormhole"
  → handleCreate() runs
  → validates username (must not be empty)
  → generates roomId: uuidv4().slice(0,8).toUpperCase() = "A1B2C3D4"
  → saves username to localStorage: localStorage.setItem('vortex_user', username)
  → navigates to /base/A1B2C3D4
```

### Flow — Join Room:
```
User types name + room code → clicks "Enter Wormhole"
  → handleJoin() runs
  → validates both fields
  → saves username to localStorage
  → navigates to /base/A1B2C3D4 (whatever code they typed)
```

### Why localStorage?
`localStorage` persists across page reloads. So when `Base.jsx` loads,
it reads the username back with `localStorage.getItem('vortex_user')`.
No login system needed — just a simple name store.

---

## 🧠 Base.jsx — The Core File (Most Important)

This is the "brain" of the app. It holds all the top-level state and
passes it down to every component via props.

### State it manages:
| State | Default | What it controls |
|-------|---------|-----------------|
| `activePanel` | `'player'` | Which panel shows in main area |
| `connected` | `false` | Is a friend in the room? |
| `friendName` | `''` | Friend's display name |
| `isLeader` | `true` | Does the current user have the crown? |

### The two phases of Base.jsx:

---

### PHASE 1 — Before Friend Joins (`connected = false`)

```
What renders:
  TopBar          (always visible)
  Sidebar         (always visible, but leader section is dimmed)
  Main area:
    └── Waiting overlay (z-30, covers everything behind it)
          ├── WormholePortal    (animated canvas)
          ├── ConnectionStatus  (shows "Waiting for friend...")
          ├── RoomCode          (shows room code + copy buttons)
          └── [Dev] button      (simulates friend joining)

The panels (VideoPlayer, FileTransfer etc) ARE rendered behind
the overlay but you can't see or interact with them yet.
```

### The `z-30` overlay trick:
```css
/* The waiting overlay uses: */
position: absolute;
inset: 0;          /* covers full width and height */
z-index: 30;       /* sits on top of everything */
backdrop-blur;     /* blurs what's behind it */
```
When `connected` becomes `true`, this overlay simply disappears
because of the `{!connected && <div>...overlay...</div>}` condition.

---

### PHASE 2 — After Friend Joins (`connected = true`)

Triggered by:
```jsx
// Currently the dev button:
const simulateFriendJoin = () => {
  setConnected(true)      // removes the overlay
  setFriendName('Shadow') // sets friend's name
}

// In real backend, this will be:
socket.on('friend-joined', ({ name }) => {
  setConnected(true)
  setFriendName(name)
})
```

```
What changes visually:
  ✓ Overlay disappears → panels become accessible
  ✓ TopBar: yellow pulsing dot → green dot + friend name
  ✓ Sidebar: dim crown → full LeaderBadge + TransferLeader button
  ✓ User can now switch between all 4 panels
```

### Leader Transfer Flow:
```
isLeader starts as true (creator of room)

User clicks "Pass Crown" in sidebar
  → TransferLeader shows confirmation: "Give to Shadow?"
  → User clicks again to confirm
  → onTransferLeader() fires → Base.jsx sets isLeader = false

In real backend this will also emit:
  socket.emit('transfer-leader', { to: friendId })
  friend receives it → their isLeader becomes true
```

### Panel switching:
```jsx
// Sidebar buttons call setActivePanel('player' | 'files' | 'notepad' | 'clipboard')
// Base.jsx renders conditionally:
{activePanel === 'player'    && <VideoPlayer />}
{activePanel === 'files'     && <FileTransfer />}
{activePanel === 'notepad'   && <SharedNotepad />}
{activePanel === 'clipboard' && <SharedClipboard />}
```
Only ONE panel renders at a time. When you switch, the old one
unmounts completely and the new one mounts fresh.

---

## 🔝 TopBar.jsx

Receives props from Base.jsx: `roomId, username, connected, friendName, isLeader, onLeave`

### What changes based on props:
```
connected = false:
  dot → yellow + animate-pulse
  text → "Waiting for friend..."
  user badge → white border

connected = true:
  dot → green (no pulse)
  text → "{friendName} connected"
  user badge → yellow border if isLeader

isLeader = true:
  badge shows 👑 + "Leader" label in yellow
isLeader = false:
  badge shows 👤 + no label
```

### Copy room code:
```jsx
const copyCode = () => {
  navigator.clipboard.writeText(roomId)  // copies to system clipboard
  setCopied(true)
  setTimeout(() => setCopied(false), 2000) // resets after 2s
}
```

---

## 📌 Sidebar.jsx

Receives: `activePanel, setActivePanel, isLeader, username, friendName, connected, onTransferLeader`

### Structure:
```
Top section:    4 nav buttons (Player, Transfer, Notepad, Clipboard)
Flex-1 spacer:  pushes leader section to bottom
Bottom section: LeaderBadge + TransferLeader (only when connected)
                OR dimmed crown icon (when not connected)
```

Active panel button gets:
```css
bg-violet-600/30 border border-violet-500/50  /* highlighted */
/* vs */
hover:bg-white/5 border-transparent            /* inactive */
```

---

## 🌀 WormholePortal.jsx — The Animated Canvas

Uses HTML5 Canvas with `requestAnimationFrame` for smooth animation.

### What it draws every frame:
```
1. Radial gradient glow (background pulse)
2. 3 spinning dashed rings (each different radius + speed)
3. 80 particles orbiting the center
4. Center orb (radial gradient)
5. 🌀 emoji in center
```

### connected prop changes colors:
```
connected = false:  rings are dark gray (#333), particles barely visible
connected = true:   rings are violet/cyan/pink, particles fully colored
```

### The animation loop:
```jsx
useEffect(() => {
  const draw = () => {
    ctx.clearRect(...)  // clear canvas
    // draw everything...
    animRef.current = requestAnimationFrame(draw)  // loop
  }
  draw()
  return () => cancelAnimationFrame(animRef.current)  // cleanup on unmount
}, [connected])
```

**Bug note:** When `connected` changes, the useEffect re-runs because
`connected` is in the dependency array. This restarts the animation
with new colors.

---

## 🎬 VideoPlayer.jsx — The VLC-Style Player

### State it manages:
| State | Purpose |
|-------|---------|
| `videoSrc` | Object URL of the loaded video file |
| `videoName` | Filename shown in the top bar |
| `playing` | Is video currently playing |
| `currentTime` | Current playback position in seconds |
| `duration` | Total video length in seconds |
| `volume` | 0 to 1 |
| `muted` | Boolean |
| `fullscreen` | Boolean |
| `showControls` | Auto-hide controls after 3s |
| `playlist` | Array of {name, file, url} objects |
| `activeIndex` | Which playlist item is playing |
| `ghostlines` | Is drawing mode active |

### How video files load (important — no upload!):
```jsx
// When user drops/selects a file:
const url = URL.createObjectURL(file)
// This creates a temporary local URL like:
// blob:http://localhost:5173/abc123-def456
// The <video src={url}> plays directly from disk
// File NEVER leaves the computer
```

### Auto-hide controls:
```jsx
const resetControlsTimer = () => {
  setShowControls(true)          // show controls
  clearTimeout(controlsTimer.current)
  if (playing) {
    // hide after 3 seconds if playing
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000)
  }
}
// Called on every mouse move over the video
```

### Layout structure:
```
VideoPlayer
  └── flex row
        ├── Video area (flex-1)
        │     ├── FileDropZone (shown when no video)
        │     ├── <video> element (shown when video loaded)
        │     ├── GhostlinesCanvas (shown when ghostlines active)
        │     └── PlayerControls overlay (bottom, auto-hides)
        └── Playlist sidebar (shown when playlist.length > 0)
```

---

## 🎮 PlayerControls.jsx

Pure display component — receives everything via props, emits events up.

### The invisible range input trick:
```jsx
// Visual progress bar is a styled div:
<div style={{ width: `${progress}%` }} className="bg-violet-500 h-full" />

// Actual clickable/draggable input sits invisibly on top:
<input
  type="range"
  className="absolute inset-0 opacity-0 cursor-pointer"
  onChange={(e) => onSeek(e.target.value)}
/>
```
This gives full control over visual styling while keeping
native browser range input behavior for dragging.

---

## 👻 GhostlinesCanvas.jsx — The Novel Feature

### Core concept — timestamp-keyed stroke map:
```jsx
const strokeMap = useRef(new Map())
// Structure:
// Map {
//   0  → [{points, color, width, tool}, ...],  // strokes at second 0
//   4  → [{points, color, width, tool}, ...],  // strokes at second 4
//   23 → [{points, color, width, tool}, ...],  // strokes at second 23
// }
```

### When you draw:
```
mousedown → startDrawing() → isDrawing = true, start recording points
mousemove → draw() → live-draw current stroke + record points
mouseup   → stopDrawing() → save completed stroke to strokeMap at timeKey
```

### When video seeks:
```jsx
useEffect(() => {
  redrawCanvas()  // clears canvas, redraws only strokes for current second
}, [currentTime])
```

### The 4 tools:
```
pen       → normal stroke, full opacity
highlight → 6x brush width, 0.35 opacity (semi-transparent)
arrow     → draws stroke + arrowhead at end point
eraser    → uses 'destination-out' composite (punches holes)
```

### Known bug to fix:
The canvas size is set once on mount. If the video container
resizes (e.g. fullscreen), the canvas doesn't resize with it.
Fix: add a ResizeObserver on `containerRef` instead of just
listening to `window resize`.

---

## 📁 FileDropZone.jsx

Simple component — shown when no video is loaded in VideoPlayer.

```jsx
// Two ways to add files:
1. Drag & drop → onDrop fires → calls onFiles(e.dataTransfer.files)
2. Click → triggers hidden <input type="file"> → onChange fires
```

Both call `onFiles` which is `addToPlaylist` from VideoPlayer.

---

## 📋 Playlist.jsx

Receives `playlist` array and renders each item as a button.
Active item shows `▶`, others show `○`.
`+ Add` button triggers a hidden file input.

---

## ⚡ FileTransfer.jsx

**Currently UI-only** — transfers are simulated with `setInterval`.

### Simulated transfer flow:
```jsx
const simulateTransfer = (files) => {
  // For each file:
  // 1. Create transfer object with progress: 0
  // 2. Add to transfers[] state (shows in Active Transfers)
  // 3. Start interval that increments progress randomly
  // 4. When progress >= 100:
  //    - Mark as 'done'
  //    - Move to history[] after 3 seconds
  //    - Remove from transfers[]
}
```

### When real backend is added, replace simulateTransfer with:
```jsx
// Sender:
const sendFile = (file) => {
  const chunkSize = 256 * 1024 // 256KB
  let offset = 0
  const reader = new FileReader()
  reader.onload = (e) => {
    dataChannel.send(e.target.result) // send chunk over WebRTC
    offset += chunkSize
    if (offset < file.size) readNextChunk()
  }
  const readNextChunk = () => {
    reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize))
  }
  readNextChunk()
}
```

---

## 📝 SharedNotepad.jsx

### State:
| State | Purpose |
|-------|---------|
| `text` | The actual note content |
| `theme` | Background color theme (4 options) |
| `fontSize` | xs/sm/base/lg |
| `wordWrap` | Toggle line wrapping |
| `showMarkdown` | Side-by-side preview mode |

### Markdown preview:
Simple line-by-line parser — not a real markdown library.
Each line is checked with if/else:
```
starts with "# "   → <h1>
starts with "## "  → <h2>
starts with "- "   → <li>
starts with "> "   → <blockquote>
empty line         → <br>
anything else      → <p>
```

### Insert timestamp:
```jsx
// Gets cursor position, inserts "[HH:MM:SS] " at that spot
const start = el.selectionStart
const newText = text.slice(0, start) + insertion + text.slice(end)
```

### Download note:
```jsx
const blob = new Blob([text], { type: 'text/plain' })
const url = URL.createObjectURL(blob)
// Creates invisible <a> tag, clicks it, removes it
```

### When backend is added:
```jsx
// Every onChange should emit:
socket.emit('notepad-update', { text })
// Partner receives:
socket.on('notepad-update', ({ text }) => setText(text))
// Add debounce (wait 300ms after typing stops) to avoid flooding
```

---

## 📋 SharedClipboard.jsx

### Auto type detection:
```jsx
const detectType = (text) => {
  if (/^https?:\/\//.test(text))        return 'link'  // starts with http
  if (text.includes('\n') && hasCode)   return 'code'  // multiline with brackets
  return 'text'
}
```

### Paste handling:
```jsx
const handlePaste = (e) => {
  // Check if pasted item is an image
  const imageFile = Array.from(e.clipboardData.items)
    .find(i => i.type.startsWith('image/'))
  if (imageFile) {
    // Convert to blob URL and add as image type
  }
  // Otherwise let text flow into textarea normally
}
```

### Pin system:
Pinned items sort to the top via:
```jsx
[...items].sort((a, b) => b.pinned - a.pinned)
// true (1) - false (0) = 1 → pinned items first
```

---

## 👑 LeaderBadge.jsx

Pure display component. Shows:
```
isLeader = true  → 👑 "Leader" in yellow, "You" label
isLeader = false → 👤 "Member" in gray, friend's name
```

---

## 🔄 TransferLeader.jsx

### Two-click confirmation pattern:
```jsx
// Click 1: confirming = false → set confirming = true
//           Button text changes to "Give to Shadow?"
// Click 2: confirming = true → call onTransfer(), reset
// Cancel:  reset confirming = false
```

This prevents accidental crown transfers.

Non-leader sees "Request Crown" button — currently just shows
a visual confirmation. In real backend:
```jsx
socket.emit('request-leader')
// Leader gets a notification and can accept/deny
```

---

## 🐛 Known Bugs To Fix

### Bug 1 — GhostlinesCanvas doesn't resize
**Problem:** Canvas width/height set once on mount. Fullscreen breaks it.
**Fix:**
```jsx
// Replace window resize listener with ResizeObserver:
useEffect(() => {
  const observer = new ResizeObserver(() => resizeCanvas())
  if (containerRef.current) observer.observe(containerRef.current)
  return () => observer.disconnect()
}, [])
```

### Bug 2 — Video doesn't autoplay on playlist switch
**Problem:** `setTimeout(() => videoRef.current?.play(), 100)` is a hack.
**Fix:**
```jsx
// Use onLoadedData event instead:
<video onLoadedData={() => { if (playing) videoRef.current.play() }} />
```

### Bug 3 — Fullscreen exits don't update state
**Problem:** If user presses Escape to exit fullscreen, `fullscreen` state
stays `true`.
**Fix:**
```jsx
useEffect(() => {
  const handler = () => setFullscreen(!!document.fullscreenElement)
  document.addEventListener('fullscreenchange', handler)
  return () => document.removeEventListener('fullscreenchange', handler)
}, [])
```

### Bug 4 — Notepad cursor jumps on typing
**Problem:** Setting state on every keystroke can cause cursor to jump
in some browsers.
**Fix:** Use `useRef` for the value and only sync to state on blur,
or use a `<textarea>` with `defaultValue` + ref.

### Bug 5 — Object URLs not revoked
**Problem:** `URL.createObjectURL()` creates memory leaks if not cleaned up.
**Fix:**
```jsx
useEffect(() => {
  return () => {
    playlist.forEach(item => URL.revokeObjectURL(item.url))
  }
}, [playlist])
```

---

## 🔌 How To Add Backend (Quick Reference)

When you're ready to wire real connections, here's exactly what
replaces the simulated parts:

### 1. Socket.io setup (`src/lib/socket.js`):
```jsx
import { io } from 'socket.io-client'
export const socket = io('http://localhost:3001')
```

### 2. In Base.jsx, replace simulateFriendJoin:
```jsx
useEffect(() => {
  socket.emit('join-room', { roomId, username })

  socket.on('friend-joined', ({ name }) => {
    setConnected(true)
    setFriendName(name)
  })

  socket.on('friend-left', () => {
    setConnected(false)
    setFriendName('')
  })

  socket.on('leader-transferred', () => setIsLeader(true))

  return () => socket.disconnect()
}, [])
```

### 3. In VideoPlayer.jsx, sync play/pause:
```jsx
// When leader presses play:
socket.emit('video-play', { time: videoRef.current.currentTime })

// Partner receives:
socket.on('video-play', ({ time }) => {
  videoRef.current.currentTime = time
  videoRef.current.play()
})
```

### 4. In GhostlinesCanvas.jsx, sync strokes:
```jsx
// After stopDrawing(), emit the stroke:
socket.emit('canvas-stroke', { stroke, timeKey })

// Partner receives and adds to their strokeMap:
socket.on('canvas-stroke', ({ stroke, timeKey }) => {
  const existing = strokeMap.current.get(timeKey) || []
  strokeMap.current.set(timeKey, [...existing, stroke])
  redrawCanvas()
})
```

### 5. Server side (`server/index.js`):
```js
io.on('connection', (socket) => {
  socket.on('join-room', ({ roomId, username }) => {
    socket.join(roomId)
    socket.to(roomId).emit('friend-joined', { name: username })
  })

  socket.on('video-play', (data) => {
    socket.to(data.roomId).emit('video-play', data)
  })

  socket.on('disconnect', () => {
    // notify room
  })
})
```

---

## 📊 Data Flow Summary

```
Landing.jsx
  → generates roomId OR accepts typed roomId
  → saves username to localStorage
  → navigates to /base/:roomId

Base.jsx (mounts)
  → reads roomId from URL params
  → reads username from localStorage
  → renders TopBar + Sidebar + waiting overlay

[Dev button clicked / real: socket friend-joined event]
  → connected = true
  → overlay disappears
  → full app accessible

User interacts
  → Panel switch: setActivePanel() in Base, Sidebar button
  → Leader change: setIsLeader() in Base, TransferLeader button
  → Video: all state local to VideoPlayer
  → Files: all state local to FileTransfer (simulated)
  → Notepad: all state local to SharedNotepad
  → Clipboard: all state local to SharedClipboard
```

---

## 🎨 Design Tokens (Colors Used)

```
Background dark:    #0a0a0f
Background mid:     #0d0d14
Violet accent:      violet-400 / violet-600
Cyan accent:        cyan-400 / cyan-600
Yellow (leader):    yellow-400 / yellow-500
Green (connected):  green-400
Red (leave/error):  red-400
Text primary:       white / gray-200
Text secondary:     gray-400 / gray-500
Text muted:         gray-600 / gray-700
Borders:            white/5 / white/10
```

---

*VORTEX Frontend — documented for full self-sufficiency*
*Backend integration points marked throughout — ready when you are*