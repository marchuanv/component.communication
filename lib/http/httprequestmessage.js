const { HttpMessage } = require("./httpmessage.js");
const { HttpMessageStatus } = require("./httpmessagestatus.js");
const httpMessageStatus = new HttpMessageStatus();

function HttpRequestMessage({ message }) {
    if (message instanceof HttpMessage) {
        Object.assign(this, message);
        const isPreflight =  this.headers["access-control-request-headers"] !== undefined;
        if(isPreflight) {
            this.statusCode = httpMessageStatus.Success;
            this.statusMessage = httpMessageStatus.getMessage(httpMessageStatus.Success);
            this.headers = {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Expose-Headers": "*",
                "Access-Control-Allow-Headers": "*",
                "Content-Type": "text/plain"
            };
        }
    } else {
        throw new Error("message is undefined or not of type: HttpMessage");
    }
};
HttpRequestMessage.prototype.validate = function() {
    if (!this.name) {
        throw new Error("http request message requires a name");
    }
    if (this.content === undefined) {
        throw new Error("http request message requires content");
    }
    if (!this.contentType) {
        throw new Error("http request message requires content type");
    }
    if (!this.headers) {
        throw new Error("http request message requires headers");
    }
    if (this.headers["Content-Length"] === undefined) {
        throw new Error("http request message requires Content-Length header");
    }
    if (this.headers["Content-Type"] === undefined) {
        throw new Error("http request message requires Content-Type header");
    }
    if (!this.resourcePath) {
        throw new Error("http request message requires a resource path");
    }
};
module.exports = { HttpRequestMessage };