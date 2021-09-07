const { Logger } = require("component.logging");
const { WebSocketMessageFactory } = require("./websocketmessagefactory.js");

const logging = new Logger({ componentName: "Communication WebSocket Request Handler" });

function WebSocketRequestHandler({ name, callback, webSocketMessageFactory }) {
    this.name = name;
    this.callback = callback;
    if (webSocketMessageFactory instanceof WebSocketMessageFactory) {
        this.webSocketMessageFactory = webSocketMessageFactory;
    } else {
        logging.write("webSocketMessageFactory is not of type: WebSocketMessageFactory")
    }
}
WebSocketRequestHandler.prototype.handle = function() {
}
module.exports = { WebSocketRequestHandler };