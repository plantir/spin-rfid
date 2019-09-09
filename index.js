const SerialPort = require('./SerialPort');
const logger = require('./Logger');
const WebSocket = require('./WebSocket');

const sp = new SerialPort((id) => {
    // Add to daily logs and post to server
    logger.idLog(id);

    // Send to connected websocket client(s)
    WebSocket.sendMessage(id);

    console.log(id);
});

