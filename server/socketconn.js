import { Server } from 'socket.io';
import { setupRooms } from './src/room/room.js';
import { setupLeader } from './leader.js';

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173'
    }
  });

  setupRooms(io);
  setupLeader(io);
}

export default io;