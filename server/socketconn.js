import { Server } from 'socket.io';

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173'
    }
  });

  
  io.on('connection', (socket) => {

    console.log('user connected', socket.id);

    socket.on('join-room',({roomId ,username })=>{
      
      socket.join(roomId); // helps in joining rooms 
      socket.to(roomId).emit('friend-joined',{name:username});
      console.log(`${username}joined ${roomId}`);

    })

    socket.on('disconnect', () => {
      console.log('user disconnected', socket.id);
    });
  });
}

export default io ;