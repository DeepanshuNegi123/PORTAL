import { rooms } from './src/room/room.js';

function setupLeader(io) {
  io.on('connection', (socket) => {

    // ── TRANSFER LEADER ────────────────────────────────────────
    // Current leader voluntarily hands crown to a specific socket
    socket.on('transfer-leader', ({ roomId, toSocketId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const from = room.find((u) => u.socketId === socket.id);
      const to   = room.find((u) => u.socketId === toSocketId);

      if (!from || !to) return;
      if (!from.isLeader) return; // only current leader can transfer

      from.isLeader = false;
      to.isLeader   = true;

      io.to(toSocketId).emit('you-are-leader');
      socket.emit('you-are-member');

      console.log(`[leader] ${from.username} → ${to.username} in room ${roomId}`);
    });

    // ── REQUEST LEADER ─────────────────────────────────────────
    // Member asks the current leader for the crown
    socket.on('request-leader', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const requester = room.find((u) => u.socketId === socket.id);
      const leader    = room.find((u) => u.isLeader);

      if (!requester || !leader) return;
      if (requester.isLeader) return; // already the leader

      // Forward the request to the current leader
      io.to(leader.socketId).emit('leader-requested', {
        fromName:     requester.username,
        fromSocketId: requester.socketId,
      });
    });

    // ── ACCEPT LEADER REQUEST ──────────────────────────────────
    // Leader accepts and triggers the actual transfer
    socket.on('accept-leader-request', ({ roomId, toSocketId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const leader = room.find((u) => u.socketId === socket.id);
      const to     = room.find((u) => u.socketId === toSocketId);

      if (!leader || !to) return;
      if (!leader.isLeader) return;

      leader.isLeader = false;
      to.isLeader     = true;

      io.to(toSocketId).emit('you-are-leader');
      socket.emit('you-are-member');

      console.log(`[leader] request accepted — ${leader.username} → ${to.username} in ${roomId}`);
    });
  });
}

export { setupLeader };