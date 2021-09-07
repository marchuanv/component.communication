const utils = require("utils");
const { Message } = require("../message.js");
function WebSocketMessage({ message, contentType }) {
    if (message instanceof Message) {
        this.message = message;
        this.contentType = contentType
    } else {
        throw new Error("message is undefined or not of type: Message");
    }
};
WebSocketMessage.prototype.validate = function() {
    this.message.validate();
};
WebSocketMessage.prototype.toString = function() {
};
module.exports = { WebSocketMessage };