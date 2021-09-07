const { HttpRequestMessage } = require("./http/httprequestmessage.js");
const { WebSocketRequestMessage } = require("./websocket/websocketrequestmessage.js");
function RequestMessage({ message }) {
    this.message = message;
    this.retryCount = 0;
    this.maxRetryCount = 3;
};
RequestMessage.prototype.validate = function() {
    this.message.validate();
    if (this.message instanceof HttpRequestMessage || this.message instanceof WebSocketRequestMessage) {
    } else {
        throw new Error("message is not an http or websocket request");
    }
};
RequestMessage.prototype.toString = function() {
    return this.message.toString();
};
module.exports = { RequestMessage };