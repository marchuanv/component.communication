const { MessageFactory } = require("../messagefactory.js");
function WebSocketConnection({ host, port }) {
    this.host = host;
    this.port = port;
    this.server = http.createServer();
    this.messageFactory = new MessageFactory({ isWebSocket: true });
    this.requestHandlers = [new RequestHandler({ name: "default", callback: () => {
        return new ResponseMessage();
    }})];
}
WebSocketConnection.prototype.isOpen = function() {
}
WebSocketConnection.prototype.send = async function(message) {
}
WebSocketConnection.prototype.start = function() {
}
module.exports = { WebSocketConnection };