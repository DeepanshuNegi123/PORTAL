import { io } from 'socket.io-client'

const socket = io('http://localhost:3001')  // enabling the port 

export default socket;


