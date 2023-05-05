import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  reconnectionDelayMax: 10000,
});

console.log(socket);

// setTimeout(() => {
//
// }, 2000);

socket.on('ready', (data) => {
  console.log(data);
  socket.emit('text2speech', { text: 'hello world' });
});

socket.on('audio', (data) => {
  console.log(data);
});
