const { HttpResponseMessage } = require("./http/httpresponsemessage.js");
const { WebSocketResponseMessage } = require("./websocket/websocketresponsemessage.js");
const { HttpMessageStatus } = require("./http/httpmessagestatus.js");

const httpMessageStatus = new HttpMessageStatus();

function ResponseMessage({ message, status }) {
    this.message = message;
    this.status = status;
    if (this.message instanceof HttpResponseMessage) {
        if (this.message.statusCode) {
            this.status = httpMessageStatus.getStatus(this.message.statusCode);
        }
        if (this.status) {
            this.message.statusCode = httpMessageStatus.getCode(this.status);
            this.message.statusMessage = httpMessageStatus.getMessage(this.status);
        }
    }
};
ResponseMessage.prototype.validate = function() {
    this.message.validate();
    if (this.message instanceof HttpResponseMessage || this.message instanceof WebSocketResponseMessage) {
        if (this.message instanceof HttpResponseMessage) {
            if (!this.message.statusCode) {
                throw new Error("response message requires a status code");
            }
            if (!this.statusMessage) {
                throw new Error("response message requires a status message");
            }
        }
    } else {
        throw new Error("message is not an http or websocket response");
    }
};
ResponseMessage.prototype.toString = function() {
    return this.message.toString();
};
module.exports = { ResponseMessage };