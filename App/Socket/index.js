const server = require("http").createServer();
const io = require("socket.io")(server);
const Emitter = require("../Emitter");
const Logger = require("App/Logger");
io.on("connection", client => {
  client.on("new-user", () => {
    Emitter.emit("new-user");
  });
  client.on("cancel", () => {
    Emitter.emit("cancel");
  });
  Emitter.on("assign", data => {
    client.emit("rfid", data);
  });
  Emitter.on("presence", data => {
    client.emit("presence", data);
  });
  client.on("presence-callback", ({ rfid, credit, message }) => {
    if (credit) {
      Logger.log({
        level: "info",
        title: "presence-success",
        rfid,
        credit
      });
    } else {
      Logger.log({
        level: "error",
        title: "presence-failed",
        rfid: rfid,
        error: message
      });
    }
  });
});
server.listen(process.env.WEBSOCKET_PORT);
