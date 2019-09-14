const WebSocketServer = require('websocket').server;
const http = require('http');

let connection = null;

const server = http.createServer(function(request, response) {
  console.log(`${new Date()} Received request for ${request.url}`);
  response.writeHead(404);
  response.end();
});

server.listen(process.env.WEBSOCKET_PORT, function() {
  console.log(`WebSocket is listening on port ${process.env.WEBSOCKET_PORT}`);
});

const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

function originIsAllowed(origin) {
  return process.env.SITE_URL === origin;
}

wsServer.on('request', function(request) {
  if (!originIsAllowed(request.origin)) {
    request.reject();
    console.log(
      new Date() + ' Connection from origin ' + request.origin + ' rejected.'
    );
    return;
  }

  connection = request.accept(null, request.origin);
});

module.exports.sendMessage = msg => {
  if (connection) connection.sendUTF(msg);
};
