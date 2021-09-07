const { WebSocketMessageFactory } = require("./websocketmessagefactory.js");
function WebSocketConnection({host, port, webSocketMessageFactory }) {
    if (webSocketMessageFactory instanceof WebSocketMessageFactory) {
    } else {
    }
}
WebSocketConnection.prototype.isOpen = function() {
}
WebSocketConnection.prototype.send = async function(message) {
}
WebSocketConnection.prototype.open = function() {
}
module.exports = { WebSocketConnection };