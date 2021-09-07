const { HttpMessage } = require("./httpmessage.js");
function HttpResponseMessage({ message, statusCode, statusMessage }) {
    if (message instanceof HttpMessage) {
        Object.assign(this, message);
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
    } else {
        throw new Error("message is undefined or not of type: HttpMessage");
    }
};
HttpResponseMessage.prototype.validate = function() {
    if (!this.name) {
        throw new Error("http response message requires a name");
    }
    if (this.content === undefined) {
        throw new Error("http response message requires content");
    }
    if (!this.contentType) {
        throw new Error("http response message requires content type");
    }
    if (!this.headers) {
        throw new Error("http response message requires headers");
    }
    if (this.headers["Content-Length"] === undefined) {
        throw new Error("http response message requires Content-Length header");
    }
    if (this.headers["Content-Type"] === undefined) {
        throw new Error("http response message requires Content-Type header");
    }
    if (!this.resourcePath) {
        throw new Error("http response message requires a resource path");
    }
    if (!this.statusCode) {
        throw new Error("http response message requires a status code");
    }
    if (!this.statusMessage) {
        throw new Error("http response message requires a status message");
    }
};
module.exports = { HttpResponseMessage };