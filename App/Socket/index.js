const server = require('http').createServer();
const io = require('socket.io')(server);
const Emitter = require('../Emitter');
io.on('connection', client => {
  client.on('new-user', () => {
    Emitter.emit('new-user');
  });
  client.on('cancel', () => {
    Emitter.emit('cancel');
  });
  Emitter.on('assign', data => {
    client.emit('rfid', data);
  });
});
server.listen(process.env.WEBSOCKET_PORT);
