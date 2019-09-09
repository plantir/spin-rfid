const config = require('./config.json');
const WebSocketServer = require('websocket').server;
const http = require('http');

let connection = null;

const server = http.createServer(function (request, response) {
    console.log(`${(new Date())} Received request for ${request.url}`);
    response.writeHead(404);
    response.end();
});

server.listen(config.websocketPort, function () {
    console.log(`WebSocket is listening on port ${config.websocketPort}`);
});

const wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    return config.websocketOrigin === origin;
}

wsServer.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    connection = request.accept(null, request.origin);
});

module.exports.sendMessage = (msg) => {
    if (connection)
        connection.sendUTF(msg);
}