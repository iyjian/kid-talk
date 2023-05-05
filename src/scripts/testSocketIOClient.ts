import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  reconnectionDelayMax: 10000,
});

console.log(socket);

socket.emit('events', { name: 'Nest' });
