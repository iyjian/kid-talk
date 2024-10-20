const WebSocket = require('ws')

const ws = new WebSocket(process.argv[2], {
  perMessageDeflate: false,
  followRedirects: false
})

ws.on('open',  () => {
  console.log('open')
})

ws.on('close',  () => {
  console.log('close')
})