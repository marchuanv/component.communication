const { HttpMessage } = require("./httpmessage.js");

function HttpResponseMessage({ message, statusCode, statusMessage }) {
    if (message instanceof HttpMessage) {
        this.message = message;
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
    } else {
        throw new Error("message is undefined or not of type: HttpMessage");
    }
};
HttpResponseMessage.prototype.validate = function() {
    this.message.validate();
    if (!this.statusCode) {
        throw new Error("http response message requires a status code");
    }
    if (!this.statusMessage) {
        throw new Error("http response message requires a status message");
    }
};
HttpResponseMessage.prototype.toString = function() {
    return this.message.toString();
};
module.exports = { HttpResponseMessage };