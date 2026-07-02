import {MAX_ROOM_SIZE} from '../../config.js';

// rooms = Map { roomId → [{ socketId, username, isLeader }] }
const rooms = new Map();

function setupRooms(io) {
  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    // ── JOIN ROOM ──────────────────────────────────────────────
    socket.on('join-room', ({ roomId, username }) => {
      if (!roomId || !username) return;

      // Create room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, []);
      }

      const room = rooms.get(roomId);

      // Prevent duplicate socket entries (e.g. from React 18 Strict Mode double mounts)
      if (room.some(u => u.socketId === socket.id)) {
        return;
      }

      // Room full check
      if (room.length >= MAX_ROOM_SIZE) {
        socket.emit('room-full');
        return;
      }

      // First person in room becomes leader
      const isLeader = room.length === 0;

      const user = { socketId: socket.id, username, isLeader };
      room.push(user);
      socket.join(roomId);

      // Store roomId + username on socket for disconnect cleanup
      socket.data.roomId = roomId;
      socket.data.username = username;

      console.log(`[room] ${username} joined ${roomId} (leader: ${isLeader})`);

      // Tell the joining socket their role and existing members
      if (isLeader) {
        socket.emit('you-are-leader');
      } else {
        socket.emit('you-are-member', {
          members: room.filter(u => u.socketId !== socket.id)
        });
      }

      // Tell everyone else in the room that a friend joined
      socket.to(roomId).emit('friend-joined', {
        name: username,
        socketId: socket.id,
      });
    });

    // ── LEAVE ROOM ─────────────────────────────────────────────
    socket.on('leave-room', ({ roomId }) => {
      handleLeave(io, socket, roomId);
    });

    // ── DISCONNECT (auto) ──────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.id}`);
      const roomId = socket.data.roomId;
      if (roomId) {
        handleLeave(io, socket, roomId);
      }
    });

    // ── VIDEO SYNC EVENTS ──────────────────────────────────────
    socket.on('video-play',         ({ roomId, time }) => socket.to(roomId).emit('video-play',   { time }));
    socket.on('video-pause',        ({ roomId, time }) => socket.to(roomId).emit('video-pause',  { time }));
    socket.on('video-seek',         ({ roomId, time }) => socket.to(roomId).emit('video-seek',   { time }));
    socket.on('video-sync-request', ({ roomId, time }) => socket.to(roomId).emit('video-sync-request', { time }));


    // ── NOTEPAD EVENTS ─────────────────────────────────────────
    socket.on('notepad-update', ({ roomId, text }) => socket.to(roomId).emit('notepad-update', { text }));

    // ── CLIPBOARD EVENTS ───────────────────────────────────────
    socket.on('clipboard-add',    ({ roomId, item })   => socket.to(roomId).emit('clipboard-add',    { item }));
    socket.on('clipboard-delete', ({ roomId, itemId }) => socket.to(roomId).emit('clipboard-delete', { itemId }));
    socket.on('clipboard-clear',  ({ roomId })         => socket.to(roomId).emit('clipboard-clear'));

    // ── WEBRTC SIGNALING ───────────────────────────────────────
    socket.on('webrtc-offer',         ({ roomId, offer })     => socket.to(roomId).emit('webrtc-offer',         { offer }));
    socket.on('webrtc-answer',        ({ roomId, answer })    => socket.to(roomId).emit('webrtc-answer',        { answer }));
    socket.on('webrtc-ice-candidate', ({ roomId, candidate }) => socket.to(roomId).emit('webrtc-ice-candidate', { candidate }));
  });
}

// ── HELPER: remove user and notify room ───────────────────────
function handleLeave(io, socket, roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  const index = room.findIndex((u) => u.socketId === socket.id);
  if (index === -1) return;

  const [leavingUser] = room.splice(index, 1);
  socket.leave(roomId);

  console.log(`[room] ${leavingUser.username} left ${roomId}`);

  // Clean up empty rooms
  if (room.length === 0) {
    rooms.delete(roomId);
    return;
  }

  // Notify remaining users
  io.to(roomId).emit('friend-left', { name: leavingUser.username });

  // If the leader left, promote the next person
  if (leavingUser.isLeader && room.length > 0) {
    room[0].isLeader = true;
    io.to(room[0].socketId).emit('you-are-leader');
    console.log(`[room] ${room[0].username} is now leader of ${roomId}`);
  }
}

export { setupRooms, rooms };